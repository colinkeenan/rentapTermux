const rGray = '#57606F';
const rDisabled = '#b4cefb'
const rLightBlue = '#77aaff'
const requiredFields = ["FullName", "dateApplied"]; // possibilities: FullName, SSN, BirthDate, Email, StateID, Phone1, Phone2, dateApplied, dateStart, dateStop

export function EditHeaders ({headers, icon, message, editOption, phone, m}: {headers:{[key:string]:any}, icon:string, message:string, editOption:string, phone:boolean, m:number}) {
  // m is magnification factor
  const fieldsetStyle={display:'inline-block', width:425*m, border:'none'};
  const maxWidth = phone ? 425*m : 1500*m; // force single-column on phone
  const headerNames = headers.map((header:any) => header.Name);
  const encodedOptions = headerNames.map((name:any) => encodeURIComponent(name).replaceAll('%20','+'));
  headerNames[0] = "Select Option to Edit"
  const editRow = editOption ? encodedOptions.indexOf(editOption) : 0;
  return (
    <>
      <meta charSet="utf-8" />
      <title>Rentap Options</title>
      <link rel="icon" href={`data:image/x-icon;base64,${icon}`} />
      <header style={{maxWidth: phone ? maxWidth+6*m : maxWidth+21*m }}>
        <a href='/view'><img src={`data:image/png;base64,${icon}`} alt="Rentap Icon" /></a>
        <div style={{display:'inline-block', fontWeight:'bold', color:'blue'}}> {message} </div>
      </header>
      <body style={{backgroundColor:rLightBlue, maxWidth: phone ? maxWidth+6*m : maxWidth+21*m }} >
        <h3 style={{backgroundColor:'darkblue', color:'white', textAlign:'center', maxWidth:maxWidth, fontSize:28*m}}>'Applying for:' Options</h3>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Delete Option</legend>
          <form action="/delheader" method="post" encType="multipart/form-data"  >
            <input type="submit" defaultValue="X" style={{backgroundColor:'darkred', color:'white'}} />
            <Field type= "number" name="Row" placeholder="Row" width="20%" viewOnly={false} m={m}/>
          </form>
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Edit Option</legend>
          <form action="/editheader" method="post" encType="multipart/form-data" >
            <select name="select" id="select" style={{width:'60%'}}  value={headerNames[editRow]} onChange={function(){}} >
              {headerNames.map( (name:string) => <option value={name} key={name}>{name}</option> )}
            </select>
            <input type="submit" defaultValue="Edit" style={{backgroundColor:'darkblue', color:'white'}} />
          </form>
          <form action="/saveheader" method="post" encType="multipart/form-data" >
            <input type="submit" defaultValue="Save" style={{backgroundColor:'darkblue', color:'white'}} />
            <Field type= "text" name="Name" placeholder="" width="50%" ap={headers[editRow]} viewOnly={true} m={m} />
            <Field type= "text" name="StreetAddress" placeholder="Street Address" width="75%" ap={headers[editRow]} viewOnly={false} m={m} />
            <Field type= "text" name="CityStateZip" placeholder="City State Zip" width="75%" ap={headers[editRow]} viewOnly={false} m={m} />
            <Field type= "text" name="Title" placeholder="Title" width="75%" ap={headers[editRow]} viewOnly={false} m={m} />
          </form>
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Add Option</legend>
          <form action="/addheader" method="post" encType="multipart/form-data"  >
            <input type="submit" defaultValue="+" style={{backgroundColor:'darkblue', color:'white'}} />
            <Field type= "text" name="Name" placeholder="Unique Option Name" width="50%" viewOnly={false} m={m} />
            <Field type= "text" name="StreetAddress" placeholder="Street Address" width="75%" viewOnly={false} m={m} />
            <Field type= "text" name="CityStateZip" placeholder="City State Zip" width="75%" viewOnly={false} m={m} />
            <Field type= "text" name="Title" placeholder="Title" width="75%" viewOnly={false} m={m} />
          </form>
        </fieldset>
        <table style={{backgroundColor:'black'}}>
          <thead>
            <tr> <Th text="Row" m={m} /> <Th text="Unique Option Name" m={m} /> <Th text="Street Address" m={m} /> <Th text="City State Zip" m={m} /> <Th text="Title" m={m} /> </tr>
          </thead>
          <tbody> {
            headers.map (
              (h:any) => h.Name && //skip headers[0] which has all blank entries
              <tr key={h.Name}>
                <TdR text={headers.indexOf(h)} m={m} /> <Td text={h.Name} m={m} /> <Td text={h.StreetAddress} m={m} /> <Td text={h.CityStateZip} m={m} /> <Td text={h.Title} m={m} />
              </tr>
            )
          } </tbody>
        </table>
      </body>
    </>
  )
}

export function Rentap({message, viewOnly, icon, ap, searchField, foundFullNames, apID, header, headerNames, inTrash, phone, m }:
  {message:string, viewOnly:boolean, inTrash:boolean
    icon:string, ap:{[key:string]:any}, searchField:string, foundFullNames:Array<string>
   apID:number, header:{[key:string]:any}, headerNames:Array<string>, phone:boolean, m:number} ) {

  const fieldsetStyle={display:'inline-block', width:425*m, border:'none', fontSize:22*m};
  // when toggling Sort/Unsort button, check whether or not "Sorted:" was inserted at top of list
  const sorted = foundFullNames[0].substring(0,7) === "Sorted:";
  const maxWidth = phone ? 425*m : 1374*m; // force single-column on phone

  return (
    <>
      <meta charSet="utf-8" />
      <title>Rentap</title>
      <link rel="icon" href={`data:image/x-icon;base64,${icon}`} />
      <header style={{maxWidth: phone ? maxWidth+6*m : maxWidth+21*m }}>
        <div style={{display:'flex', minHeight:76*m, border:8*m + 'solid white', minWidth:425*m, maxWidth:maxWidth*m}} >
          <div style={{flex:'grow', textAlign:'center', backgroundColor:'darkred', width:70*m}} >
            <a href='/view' ><img src={`data:image/png;base64,${icon}`} alt="Rentap Icon" style={{marginTop:12*m}} /></a>
          </div>
          <div style={{flex: 1, alignItems:'center', minHeight:54*m, fontWeight:'bold', textAlign:'center', backgroundColor:'darkblue', color:'white', fontSize:22*m }}>
            <p> {message} </p>
          </div>
        </div>
        <br/><br/>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Applying for:</legend>
          <form action="/selectapplyingfor" method="post" encType="multipart/form-data" style={{margin:'0', marginBottom:5*m}} >
            <select name="selectApplyingFor" id="selectapplyingfor" style={{ display:'inline-block', width:'73%' }} value={header.Name} onChange={function(){}} required>
              {headerNames.map( (name:string) => <option value={name} key={name}>{name}</option> )}
            </select>
            <input type="submit" defaultValue="Update" style={{backgroundColor:'darkblue', color:'white'}} />
          </form>
          <h3 style={{margin:'0', color:rGray, fontSize:28*m}}>{header.Title ? header.Title : "Title"}</h3>
          <p style={{margin:'0', color:rGray, fontSize:22*m}}>
            {header.StreetAddress ? header.StreetAddress : "Street Address"}
            <br/> {header.CityStateZip ? header.CityStateZip : "City, ST Zip"}
          </p>
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Actions</legend>
          {!apID ? "" :
            <div style={{width:'100%', marginBottom:5*m, display:'flex', justifyContent:'space-between'}}>
                <a href={viewOnly?'/edit':'/view'} > <button type="button" style={{backgroundColor:'darkblue', color:'white', fontWeight:'bold', fontSize:20*m }} > {viewOnly?'Edit':'View'} </button> </a>
              <div>
                {ap.FullName==="Deleted apID:" + apID ? <div>&bull</div> :
                <a href={inTrash ? "/restore" : "/discard"} ><button type="button" style={{backgroundColor:rGray, color:'white', fontSize:20*m }} >{inTrash ? "Restore" : "Discard"}</button></a>
                }
                <div style={{backgroundColor:'gray', color:'white', textAlign:'center', display:'inline-block'}}>{'||'}</div>
                <a href={inTrash ? "/exittrash" : "/trash"} ><button type="button" style={{backgroundColor:rGray, color:'white', fontSize:20*m }} >{inTrash ? "Exit Trash" : "View Discarded"}</button></a>
              </div>
            </div>
          }
          <div style={{width:'100%', display:'flex', justifyContent:'space-between'}}>
            <a href="/"     ><button type="button" style={{backgroundColor:'darkblue', color:'white', fontWeight:'bold', fontSize:20*m }} >New</button></a>
            <a href={inTrash ? "/delete" : "/editheaders"} ><button type="button" style={{backgroundColor:inTrash ? 'darkred' : rGray, color:'white', fontSize:20*m}} >
              {inTrash ? "Delete (This is Permanent)" : "Edit 'Applying for:' Options"}</button></a>
          </div>
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Navigation</legend>
          <form action="/search" method="post" encType="multipart/form-data" style={{margin:'0', marginBottom:'5'}} >
            <div style={{display:'flex', justifyContent:'space-between'}} >
              <input type="text" name="search" id="search" placeholder="search" style={{width:'65%'}} />
              <div>
                <a href="/prev" ><button type="button" style={{backgroundColor:rGray, color:'white', fontSize:20*m }} >&lt;</button></a>
                <div style={{backgroundColor:rDisabled, textAlign:'center', display:'inline-block', width:'80px' }}>{apID}</div>
                <a href="/next" ><button type="button" style={{backgroundColor:rGray, color:'white', fontSize:20*m }} >&gt;</button></a>
              </div>
            </div>
            <Label forId='searchFields' labelText="Search Field(s)" m={m} />
            <select name="searchFields" id="searchfields" value={searchField} style={{width:'73%', marginLeft:8*m, marginBottom:2*m }} onChange={function(){}} >
              <option value="selectSearchFields" key="selectSearchFields"> ALL  or [ Select field to search ]</option>
              {Object.keys(ap).map( (key:string) => <option value={key} key={key}>{camelCaseToWords(key)}</option> )}
            </select>
          </form>
          <form action="/select" method="post" encType="multipart/form-data"  style={{margin:'0'}}>
            <div style={{width:'100%', display:'flex', justifyContent:'space-between'}}>
              <a href="/sort" ><button type="button" style={{backgroundColor:rGray, color:'white', fontSize:20*m }} >{sorted ? "Unsort" : "Sort"}</button></a>
              <select name="select" id="select" value={ap.FullName ? ap.FullName : foundFullNames[0]} style={{width:'58%'}} onChange={function(){}} >
                {foundFullNames.map( (name:any) => <option value={name} key={name}>{name}</option> )}
              </select>
              <input type="submit" defaultValue="View" style={{backgroundColor:'darkblue', color:'white'}} />
            </div>
          </form>
        </fieldset>
      </header>
      <body style={{backgroundColor:rLightBlue, maxWidth: phone ? maxWidth+6*m : maxWidth+21*m }} >
      <form action="/save" method="post" encType="multipart/form-data" >
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Identity</legend>
          <Label forId="fullname"  labelText="Full Name" m={m} />     <Field type="text"  name="FullName"      placeholder="First Middle Last" width='73%' ap={ap} viewOnly={viewOnly} m={m} />
          <Label forId="ssn"  labelText="Social Security" m={m} />    <Field type="text"  name="SSN"           placeholder="555-55-5555" width='73%' ap={ap} viewOnly={viewOnly} m={m} />
          <Label forId="birthdate" labelText="Birth Date" m={m} />    <Field type="date"  name="BirthDate"     placeholder="" width='36.5%' ap={ap} viewOnly={viewOnly} m={m} />
                                                                <Field type="text"  name="MaritalStatus" placeholder="Marital Status" width='36.5%' ap={ap} viewOnly={viewOnly} m={m} />
          <Label forId="email" labelText="Email" m={m} />             <Field type="email" name="Email"         placeholder="youremail@provider.com" width='73%' ap={ap} viewOnly={viewOnly} m={m} />
          <Label forId="stateid" labelText="State ID#" m={m} />       <Field type="text"  name="StateID"       placeholder="MO 123456789 1/2/2034" width='73%' ap={ap} viewOnly={viewOnly} m={m} />
          <Label forId="phone1" labelText="Phones" m={m} />           <Field type="tel"   name="Phone1"        placeholder="Phone 1" width='36.5%' ap={ap} viewOnly={viewOnly} m={m} />
                                                                <Field type="tel"   name="Phone2"        placeholder="Phone 2" width='36.5%' ap={ap} viewOnly={viewOnly} m={m} />
          <TextArea rows={5}  name="CurrentAddress"    placeholder="Address, City, State, Zip, Dates, Rent, Landlord name and phone number" ap={ap} viewOnly={viewOnly} m={m} />
          <TextArea rows={16} name="PriorAddresses"    placeholder="Prior Addresses, Cities, States, Zips, Dates, Rents, Landlords" ap={ap} viewOnly={viewOnly} m={m} />
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Situation</legend>
          <Label forId="headername" labelText="Applying for:" m={m} />
            <select name="headerName" id="headername"
              style={{width:'73%', marginLeft:8*m, marginBottom:2*m }}
              value={header.Name} onChange={function(){}} disabled={viewOnly} required>
              {headerNames.map( (name:string) => <option value={name} key={name}>{name}</option> )}
            </select>
          <TextArea rows={5}  name="ProposedOccupants" placeholder="Proposed Occupants: self+age, other+age" ap={ap} viewOnly={viewOnly} m={m} />
          <TextArea rows={3}  name="ProposedPets"      placeholder="Proposed Pets, names, types, ages, weights" ap={ap} viewOnly={viewOnly} m={m} />
          <TextArea rows={6}  name="Income"            placeholder="Income amount and source" ap={ap} viewOnly={viewOnly} m={m} />
          <TextArea rows={14} name="Employment"        placeholder="Employment: address, job/position, dates, hours, supervisor name and phone number" ap={ap} viewOnly={viewOnly} m={m} />
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Criminal &amp; Civil Record | Notes</legend>
          <TextArea rows={15} name="Evictions"         placeholder="Evictions Past 10 Years, or other notes" ap={ap} viewOnly={viewOnly} m={m} />
          <TextArea rows={15} name="Felonies"          placeholder="Felonies/Drug Convictions, or other notes" ap={ap} viewOnly={viewOnly} m={m} />
        </fieldset>
        <br />
        <fieldset style={fieldsetStyle}>
          <legend style={{color:rGray}}>Agreement Dates</legend>
          <Label forId="datestart" labelText="Start | Stop" m={m}/> <Field type="date" name="dateStart" placeholder="" width='36%' ap={ap} viewOnly={viewOnly} m={m} />
                                                              <Field type="date" name="dateStop"  placeholder="" width='36%' ap={ap} viewOnly={viewOnly} m={m} />
        </fieldset>
        <Label forId="dateapplied" labelText="Applied" m={m}/> <Field type="date" name="dateApplied" placeholder="" width='auto' ap={ap} viewOnly={viewOnly} m={m} />
        {viewOnly ? "" : <input type="submit" defaultValue="Save" style={{backgroundColor:'darkblue', color:'white', marginLeft:15*m}} />}
      </form>
      </body>
    </>
  );
}

function Label({forId, labelText, m}: {forId:string, labelText:string, m:number}) {
  return (
    <label htmlFor={forId} style={{width:106*m, display:'inline-block', color:'white', textAlign:'right', fontSize:14*m}} > {labelText} </label>
  )
}

function Field({type, name, placeholder, width, ap, viewOnly, m}: { type: string, name: string, placeholder: string, width: string, ap?: {[key:string]: any}, viewOnly: boolean, m:number }) {
  const required = requiredFields.some((r:string) => r === name);
  return (
    <input type={type} name={name} id={name.toLowerCase()} placeholder={placeholder}
      style={{width:width, marginBottom:2*m, backgroundColor:viewOnly?rDisabled:'white', fontSize:20*m}}
      value={ap ? ap[name] : ""} readOnly={viewOnly} onChange={function(){}} required={required} />
  )
}

function TextArea({rows, name, placeholder, ap, viewOnly, m}: { rows:number, name:string, placeholder:string, ap: {[key:string]: any}, viewOnly: boolean, m:number }) {
  return (
    <textarea rows={rows} name={name} placeholder={placeholder}
      style={{width:'100%', marginBottom:2*m, backgroundColor:viewOnly?rDisabled:'white', fontSize:16*m}}
      defaultValue={ap[name]} readOnly={viewOnly} onChange={function(){}} />
  )
}

function Td({text,m}:{text:string,m:number}) {
  return (
    <td style={{backgroundColor:rDisabled, paddingLeft:10*m, paddingRight:10*m, fontSize:22*m}}>{text}</td>
  )
}

function TdR({text,m}:{text:string, m:number}) {
  return (
    <td style={{backgroundColor:rDisabled, paddingLeft:10*m, paddingRight:10*m, textAlign:'right', fontSize:22*m}}>{text}</td>
  )
}

function Th({text,m}:{text:string, m:number}) {
  return (
    <th style={{backgroundColor:rDisabled, paddingLeft:10*m, paddingRight:10*m, fontSize:22*m}}>{text}</th>
  )
}

function camelCaseToWords(s:string) {
  let str = s
  .replace(/([a-z])([A-Z])/g, '$1 $2') // replaces FullName with Full Name
  .replace(/([a-zA-Z])([0-9])/g, '$1 $2') // replaces Phone1 with Phone 1
  .replace(/^./, m => m.toUpperCase()); // uppercases first letter
  if (str==='SSN') str='Social Security'
  if (str==='Header Name') str='Applying For:'
  return str;
}
