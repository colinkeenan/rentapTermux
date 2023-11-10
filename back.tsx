// {{{ za to toggle fold which includes all the imports and global variables
import { renderToStaticMarkup } from "react-dom/server";
import { Rentap, EditHeaders } from "./rentap"
import { existsSync, readFileSync, writeFileSync } from "fs";
import { createServer } from "http";
import { resolve } from "path";

// argv: [ 'path/to/node', 'path/to/back.tsx', 'arguements' ], so length of 2 means no args. Any args, then phone is true.
const phone = !(process.argv.length === 2);

const base64icon = readFileSync("icon.txt", { encoding: 'utf8' });
const base64trash = readFileSync("trash.txt", { encoding: 'utf8'});
//sJfT short for storeJSONfileText.
const sJfT = existsSync("store.json") ? readFileSync("store.json", { encoding: 'utf8' }) : "";
const storeArray = sJfT ? JSON.parse(sJfT) : {};
// Setting up aps, headers, trash, deleted using ? : instead of just defining them and then if() to change because would have to use "let" to be able to change them in if()
const aps = sJfT ? storeArray.aps : [{"FullName":"","SSN":"","BirthDate":"","MaritalStatus":"","Email":"","StateID":"","Phone1":"","Phone2":"","CurrentAddress":"","PriorAddresses":"","headerName":"","ProposedOccupants":"","ProposedPets":"","Income":"","Employment":"","Evictions":"","Felonies":"","dateStart":"","dateStop":"","dateApplied":""}];
const trash = sJfT ? storeArray.trash : [{"discardedRow":0}];
const deleted = sJfT ? storeArray.deleted : [{"deletedRow":0}];
const trashMessage="Viewing Discarded Applications in Trash"
let apHasUndefined = false;
let sort = false;

// const variables needed for <EditHeaders .../> are:
//   icon={base64icon} (defined above) and
//   headers
const headers = sJfT ? storeArray.headers :
  [{"StreetAddress":"","CityStateZip":"","Title":"","Name":""}];
// let variables needed for <EditHeaders .../> are:
//   messageEditHeaders editOption;
let messageEditHeaders = "";
let editOption = "";

// const variables needed for <Rentap .../> are:
//   icon={base64icon} foundFullNames and
//   headerNames
const headerNames = headers.map((header:any) => header.Name);
const foundFullNames = ["All Names (not Discarded)"];
// let variables needed for <Rentap .../> are:
//   ap={aps[apID]} header={headers[headerID]} and
//   message viewOnly inTrash searchField apID (headerID for header)
let message = "";
let viewOnly = true;
let inTrash = false;
let searchField='selectSearchFields'
let apID = 0;
let headerID = 0;
// }}}

const host = 'localhost';
const port = 3000;
const server = createServer(async (req:any, res:any) => {

  // A bunch of path-handlers for the Rentap page follows. After those, the rest are for the
  // Applying for Options page. A render follows the switch.
  // {{{ za to toggle fold: entire switch should be same for both Bun & Termux

  switch (req.url) {
    case '/':
      message = "New";
      viewOnly = true;
      inTrash = false;
      foundFullNamesUpdate();
      apID = 0;
      headerID = 0;
      break;
    case '/edit':
      if (apID) {
        message = "Edit";
        viewOnly = false;
        if (foundFullNames.length === 1) foundFullNamesUpdate();
        headerID = matchHeader(aps[apID].headerName);
      } else message = "Update 'Applying for:' section before editing a blank application"
      break;
    case '/view':
      message = "View"
      viewOnly = true;
      if (foundFullNames.length === 1) foundFullNamesUpdate();
      headerID = matchHeader(aps[apID].headerName);
      break;
    case '/selectapplyingfor':
      message = "Edit";
      viewOnly = false;
      const headerEntry = await getFormData(req);
      const headerNameSelected = headerEntry.selectApplyingFor.toString();
      if (foundFullNames.length === 1) foundFullNamesUpdate();
      aps[apID].headerName = headerNameSelected;
      headerID = matchHeader(aps[apID].headerName);
      break;
    case '/sort':
      message = inTrash ? trashMessage : "View";
      viewOnly = true;
      sort = !sort;
      headerID = matchHeader(aps[apID].headerName);
      foundFullNamesUpdate();
      if (sort) { // sort, but don't include the first "name" (a description of the list)
        const sortedNames = foundFullNames.slice(1).sort()
        const n0 = foundFullNames[0];
        foundFullNames.length = 0;
        foundFullNames.push(n0);
        for (const n of sortedNames) foundFullNames.push(n);
      }
    break;
    case '/go':
      const goEntry = await getFormData(req);
      const goID = Number(goEntry.go);
      if ( !isNaN(goID) && (0 < goID) && (goID < aps.length) ) {
        apID = goID;
        inTrash = trash.some((e:any) => e.discardedRow === goID);
        message = inTrash ? trashMessage : "View";
        viewOnly = true;
        headerID = matchHeader(aps[apID].headerName);
        foundFullNamesUpdate();
      } else message = "Enter a valid apID";
      break;
    case '/prev':
      gotoPrevID();
      message = inTrash ? trashMessage : "View";
      viewOnly = true;
      if (foundFullNames.length === 1) foundFullNamesUpdate();
      headerID = matchHeader(aps[apID].headerName);
      break;
    case '/next':
      gotoNextID();
      message = inTrash ? trashMessage : "View";
      viewOnly = true;
      if (foundFullNames.length === 1) foundFullNamesUpdate();
      headerID = matchHeader(aps[apID].headerName);
      break;
    case '/current': // search for existing dateStart without dateStop (should return all aps with agreements that have not terminated)
      foundFullNames.length = 0;
      foundFullNames.push(inTrash ? "Search Results in Trash" : "Search Results (not Discarded)");
      for (const ap of aps) {
        if (!deleted.some((e:any) => e.deletedRow === aps.indexOf(ap))) { // nothing to search for in deleted aps
          if (inTrash) { // searching in trash (shouldn't have current agreements in trash, but maybe there by mistake)
            if(trash.some((e:any) => e.discardedRow === aps.indexOf(ap)) // verify the ap is in trash
            && ap["dateStart"] && !ap["dateStop"]) {
              foundFullNames.push(ap.FullName);
            }
          } else { // searching aps not in trash
            if(!trash.some((e:any) => e.discardedRow === aps.indexOf(ap)) // verify the ap is not in trash
            && ap["dateStart"] && !ap["dateStop"]) {
              foundFullNames.push(ap.FullName);
            }
          }
        }
      }
      if (foundFullNames.length === 1) foundFullNamesUpdate(); // nothing found even though search completed, just show all
      else apID = matchFullName(foundFullNames[1]);
      message = inTrash ? trashMessage : "View";
      viewOnly = true;
      headerID = matchHeader(aps[apID].headerName);
      break;
    case '/search':
      const searchEntry = await getFormData(req);
      const search = searchEntry.search.toString();
      searchField = searchEntry.searchFields.toString();
      foundFullNames.length = 0;
      foundFullNames.push(inTrash ? "Search Results in Trash" : "Search Results (not Discarded)");
      if (search) { // no need to search if the search string is empty
        for (const ap of aps) {
          if (!deleted.some((e:any) => e.deletedRow === aps.indexOf(ap))) { // nothing to search for in deleted aps
            if (inTrash) { // searching in trash
              if(trash.some((e:any) => e.discardedRow === aps.indexOf(ap)) // verify the ap is in trash
              && containsSubstring(searchField==='selectSearchFields' ? ap : {searchField:ap[searchField]}, search)) {
                foundFullNames.push(ap.FullName);
              }
            } else { // searching aps not in trash
              if(!trash.some((e:any) => e.discardedRow === aps.indexOf(ap)) // verify the ap is not in trash
              && containsSubstring(searchField==='selectSearchFields' ? ap : {searchField:ap[searchField]}, search)) {
                foundFullNames.push(ap.FullName);
              }
            }
          }
        }
      } else { // no search done because search string was empty
        foundFullNamesUpdate(); // just show all
        searchField='selectSearchFields';
      }
      if (foundFullNames.length === 1) foundFullNamesUpdate(); // nothing found even though search completed, just show all
      else apID = matchFullName(foundFullNames[1]);
      message = inTrash ? trashMessage : "View";
      viewOnly = true;
      headerID = matchHeader(aps[apID].headerName);
      break;
    case '/select':
      const selectedFullName = await getFormData(req);
      message = inTrash ? trashMessage : "View";
      viewOnly = true;
      if (foundFullNames.length === 1) foundFullNamesUpdate();
      apID = matchFullName(selectedFullName.select.toString());
      headerID = matchHeader(aps[apID].headerName);
      break;
    case '/trash':
      message = trashMessage;
      viewOnly = true;
      inTrash = true;
      gotoNextID();
      headerID = matchHeader(aps[apID].headerName);
      foundFullNamesUpdate();
      break;
    case '/exittrash':
      message = "View";
      viewOnly = true;
      inTrash = false;
      gotoPrevID();
      headerID = matchHeader(aps[apID].headerName);
      foundFullNamesUpdate();
      break;
    case '/discard':
      //put apID in trash if not already there
      if (!trash.some((e:any) => e.discardedRow === apID)) {
        trash.push({discardedRow:apID});
        saveAll();
      }
      message = trashMessage;
      viewOnly = true;
      inTrash = true;
      headerID = matchHeader(aps[apID].headerName);
      if (foundFullNames.length === 1) foundFullNamesUpdate();
      break;
    case '/restore':
      //remove apID from trash if it's in there
      if (trash.some((e:any) => e.discardedRow === apID)) {
        const trashApIDindex = trash.map((e:any) => e.discardedRow).indexOf(apID);
        trash.splice(trashApIDindex,1);
        saveAll();
      }
      message = "Edit";
      viewOnly = false;
      inTrash = false;
      headerID = matchHeader(aps[apID].headerName);
      if (foundFullNames.length === 1) foundFullNamesUpdate();
      break;
    case '/delete':
      //put apID in deleted if not already there and delete the ap
      if (!deleted.some((e:any) => e.deletedRow === apID)) {
        //add to deleted list and remove from trash list
        deleted.push({deletedRow:apID});
        const trashApIDindex = trash.map((e:any) => e.discardedRow).indexOf(apID);
        trash.splice(trashApIDindex,1);
        //delete the information
        aps[apID] = {"FullName":"Deleted apID:" + apID,"SSN":"","BirthDate":"","MaritalStatus":"","Email":"","StateID":"","Phone1":"","Phone2":"","CurrentAddress":"","PriorAddresses":"","ProposedOccupants":"","ProposedPets":"","Income":"","Employment":"","Evictions":"","Felonies":"","dateApplied":"","dateStart":"","dateStop":"","headerName":""};
        saveAll();
      }
      message = trashMessage;
      viewOnly = true;
      inTrash = true;
      headerID = matchHeader(aps[apID].headerName);
      if (foundFullNames.length === 1) foundFullNamesUpdate();
      break;
    case '/save':
      message = "Nothing to save";
      const apSave = await getFormData(req);
      if (apIsEdited(apSave)) {
        aps[apID] = apSave;
        saveAll();
        message = apHasUndefined ? "Saved and replaced undefined entries with ''" : "Saved";
      } else if (apIsUnique(apSave) && apIsNew(apSave)) {
        aps.push(apSave);
        apID = aps.length -1;
        saveAll();
        message = "Saved";
      } else if (!apID) { // only display the "already applied" message if user is trying to add a new application (which has to be at apID=0)
        const FullName = apSave.FullName.toString().trim();
        let First = FullName;
        if(First.indexOf(' ')!==-1)
          First = First.substring(0, First.indexOf(' '));
        const AfterFirst = FullName.substring(First.length);
        message = `${apSave.FullName} already applied. Append this new information to that previous application,
                   or use numbers as in: '${First} 1 ${AfterFirst}' & '${First} 2 ${AfterFirst}'`;
      }
      // write to file if doesn't exist already
      if (!sJfT) saveAll();
      viewOnly = true;
      headerID = matchHeader(aps[apID].headerName);
      if (foundFullNames.length === 1) foundFullNamesUpdate();
      break;
    case '/editheaders':
      messageEditHeaders = "'Applying for' Options";
      break;
    case '/delheader':
      const delIndex = await getFormData(req);
      const dI = Number(delIndex.Row);
      if ( !isNaN(dI) && (0 < dI) && (dI < headers.length) &&
        !aps.some((ap:any) => ap.headerName ===headers[dI].Name) )
      {
        const delName = headers[dI].Name;
        headers.splice(dI,1);
        headerNames.splice(dI,1); // keep headerNames in sync with headers
        saveAll();
        messageEditHeaders = "Deleted '" + delName + "' that was on row " + dI;
      } else if ( !(!isNaN(dI) && (0 < dI) && (dI < headers.length)) )
        messageEditHeaders = "Please enter a valid row to be deleted"
      else messageEditHeaders = "Can't delete row " + delIndex + " because '" + headers[dI].Name + "' is in use."
      break;
    case '/editheader':
      messageEditHeaders = 'Rentap';
      const selOption = await getFormData(req);
      editOption = selOption.select.toString();
      break;
    case '/saveheader':
      const headerSave = await getFormData(req);
      const headerRow = headerNames.indexOf(headerSave.Name);
      headers[headerRow] = headerSave;
      saveAll();
      messageEditHeaders = 'Rentap';
      break;
    case '/addheader':
      messageEditHeaders = "Option Added";
      const headerAdd = await getFormData(req);
      if (headers.some((h:any) => h.Name === headerAdd.Name))
        messageEditHeaders = "Choose a unique name for the new option.";
      else {
        headers.push(headerAdd);
        headerNames.push(headerAdd.Name); // keep headerNames in sync with headers
        saveAll();
      }
      break;
    default:
      return new Response("Not Found", { status: 404 });
  }
// }}}

  if (req.url.includes("header")) {
    const content =
      renderToStaticMarkup(
      <EditHeaders icon={base64icon} trash={base64trash}
        headers={headers} message={messageEditHeaders} editOption={editOption} phone={phone} n={phone?2:1}/>
      );
    res.writeHead(200, {
      'Content-Type': 'text/html' }); // creates necessary html header and code 200 means everything's ok
    res.end(content);
  } else {
    const content =
      renderToStaticMarkup(
      <Rentap icon={base64icon} trash={base64trash}
        message={message} viewOnly={viewOnly} inTrash={inTrash}
        ap={aps[apID]} searchField={searchField} foundFullNames={foundFullNames} apID={apID}
        header={headers[headerID]} headerNames={headerNames} phone={phone} n={phone?2:1}/>);
    res.writeHead(200, {
      'Content-Type': 'text/html' }); // creates necessary html header and code 200 means everything's ok
    res.end(content);
  }
});

server.listen(port, host, () => {
    console.log(`Listening on http://${host}:${port}`);
});

// {{{ za to toggle fold: all these functions should be same for both Bun & Termux
function formatArray(arrObj:Array<Object>) {
  // write each array element on it's own line if there's more than one
  const [a0, ...aRest] = arrObj;
  return arrObj.length > 1 ?
  `[${JSON.stringify(a0)},${aRest.map( (a) => "\n" + JSON.stringify(a) )}]\n`
  : JSON.stringify(arrObj) + "\n";
};

function matchHeader(name:string) {
  const headerID = headers.map((h:any) => h.Name).indexOf(name);
  return headerID > 0 ? headerID : 0;
}

function matchFullName(fullName:string) {
  const encodedFullNames = aps.map((ap:any) => encodeURI(ap.FullName).replaceAll('%20','+'));
  const matchingApID =
    fullName.includes(' ')
    ? aps.map((ap:any) => ap.FullName).indexOf(fullName)
    : encodedFullNames.indexOf(fullName); //fullName from <select...> is encoded for valid URI, replacing spaces with +
  return matchingApID > 0 ? matchingApID : 0;
}

function containsSubstring(obj:{[key:string]: any}, substring:string) {
  for (const key in obj)
    if (obj[key] && obj[key].toString().includes(substring)) return true;
  return false;
}

function apIsNew(obj:{[key:string]:any}) {
  // if apID is not 0, we are editing an existing ap, not a new one
  if (apID) return false;
  for (const key in obj)
    if (obj[key].toString() != "")
      return true; // there's something to save
  return false; // even though on a new ap, there was nothing entered,
  // (but this should never happen because there are required fields that prevent submission if empty)
}

function apIsEdited(obj:{[key:string]:any}) {
  const isString =  (input:any) => typeof input?.replaceAll === 'function'
  // if apID is 0, we are editing a new ap, not an existing one
  if (!apID) return false;
  for (const key in obj) {
    apHasUndefined = !isString(aps[apID][key]);
    const objKeyIsString = isString(obj[key]);
    if (!objKeyIsString) {
      return false; // don't save undefined
    }
    if (apHasUndefined && objKeyIsString) {
      return true; // yes, replace undefined with something
    }
    if (!apHasUndefined && objKeyIsString) {
      const maybeEdited = obj[key].trim(); // trim to avoid saving extra spaces, but if trying to remove
      const original = aps[apID][key].trim(); // extra spaces, they will have to edit something else too
      if (maybeEdited != original) return true; // there's something to save
    }
  }
  return false; // on an existing ap that was not changed
}

function apIsUnique(obj:{[key:string]:any}) {
  // if obj.FullName is already in aps, it's not unique because every app must have a unique fullName
  return !aps.some((a:any) => a.FullName.toString().trim() === obj.FullName.toString().trim());
}

function gotoPrevID() {
    apID>0? apID-- : apID = aps.length-1;
    //check if apID was deleted or discarded and skip it unless we're in trash then skip it if not discarded
    if (inTrash)
      while (deleted.some((e:any) => e.deletedRow === apID) || !trash.some((e:any) => e.discardedRow === apID))
        apID>0? apID-- : apID = aps.length-1;
    else
      while (deleted.some((e:any) => e.deletedRow === apID) || trash.some((e:any) => e.discardedRow === apID))
        apID>0? apID-- : apID = aps.length-1;
}

function gotoNextID() {
    apID < aps.length-1 ? apID++ : apID=0;
    //check if apID was deleted or discarded and skip it unless we're in trash then skip it if not discarded
    if (inTrash)
      while (deleted.some((e:any) => e.deletedRow === apID) || !trash.some((e:any) => e.discardedRow === apID))
        apID < aps.length-1 ? apID++ : apID=0;
    else
      while (deleted.some((e:any) => e.deletedRow === apID) || trash.some((e:any) => e.discardedRow === apID))
        apID < aps.length-1 ? apID++ : apID=0;
}

function foundFullNamesUpdate() {
  foundFullNames.length = 0;
  foundFullNames.push(sort ?
    inTrash ? "Sorted: All Discarded Names" : "Sorted: All Names (not Discarded)"
    : inTrash ? "All Discarded Names" : "All Names (not Discarded)");
  for (const ap of aps) {
    if (inTrash) {
      if (ap.FullName && trash.some((e:any) => e.discardedRow === aps.indexOf(ap)))
        foundFullNames.push(ap.FullName);
    } else {
      if (!trash.some((e:any) => e.discardedRow === aps.indexOf(ap)) && !deleted.some((e:any) => e.deletedRow === aps.indexOf(ap)))
        foundFullNames.push(ap.FullName);
    }
  }
}
// }}}

function saveAll() {
  const fAps = formatArray(aps);
  const fHeaders = formatArray(headers);
  const fTrash = formatArray(trash);
  const fDeleted = formatArray(deleted);
  const formattedStore = `\{"aps":${fAps}, "headers":${fHeaders}, "trash":${fTrash}, "deleted":${fDeleted}\}`;
  // this last line is why saveAll() can't be the same for both Bun and Termux
  writeFileSync("./store.json", formattedStore);
}

// https://stackoverflow.com/questions/40576255/nodejs-how-to-parse-multipart-form-data-without-frameworks
function getFormData(request:any) {
  return new Promise<{[key:string]:string}>((resolve, reject) => {
    try {
      const contentTypeHeader = request.headers["content-type"];
      const boundary = "--" + contentTypeHeader.split("; ")[1].replace("boundary=","");
      const body = [] as any;
      request.on('data', (chunk:any) => { body.push(chunk) });
      request.on('end', () => {
        const formDataSubmitted: {[key:string]:string} = {};
        const bodyParts = Buffer.concat(body).toString().split(boundary);
        bodyParts.forEach((val:string) => {
          // After name=.. there are 2 \r\n before the value - that's the only split I want
          // So, the regex below splits at the first occurance of \r\n\r\n, and that's it
          // This way, newlines inside texarea inputs are preserved
          const formDataEntry = returnKeyValObj(
            val.replace("Content-Disposition: form-data; ","").split(/\r\n\r\n(.*)/s)
          );
          if (formDataEntry) Object.assign(formDataSubmitted, formDataEntry);
        })
        if (Object.keys(formDataSubmitted).length) resolve(formDataSubmitted);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function returnKeyValObj(arr:Array<string>){
  if (!Array.isArray(arr) || arr.length < 2) return false;
  let propKey = '';
  const formDataEntries: {[key:string]:string} = {};
  const [pKey, ...pValArray] = arr;
  // pValArray[0] ends with \r\n (2 characters total)
  const propVal = pValArray[0].slice(0,-2)
  // pKey looks like '\r\nname=\"key\"', where \r and \n and \" count as one character each
  // So, need to remove 8 from start of pKey and 1 from end of pKey
  if (pKey && pKey.includes('name=\"')) propKey = pKey.slice(8).slice(0,-1);
  if (propKey) formDataEntries[propKey] = propVal;
  if (Object.keys(formDataEntries).length) return formDataEntries;
  return false;
}
