const rGray = '#57606F';
const rDisabled = '#b4cefb'
const rLightBlue = '#77aaff'
const requiredFields = ["FullName", "dateApplied"]; // possibilities: FullName, SSN, BirthDate, Email, StateID, Phone1, Phone2, dateApplied, dateStart, dateStop

export function EditHeaders ({headers, icon, message, editOption, phone, m}: {headers:{[key:string]:any}, icon:string, message:string, editOption:string, phone:boolean, m:number}) {
  // m is magnification factor
  const fieldsetStyle={display:'inline-block', width:300*m, border:'none', fontSize:23.5*m};
  const legendStyle={width:'auto', marginLeft:'auto', marginRight:'auto', color:rGray};
  const maxWidth = phone ? 400*m : 1200*m; // force single-column on phone
  const headerNames = headers.map((header:any) => header.Name);
  headerNames[0] = "Select Option to Edit"
  const editRow = editOption ? headerNames.indexOf(editOption) : 0;
  return (
    <>
      <meta charSet="utf-8" />
      <title>Rentap Options</title>
      <link rel="icon" href={`data:image/x-icon;base64,${icon}`} />
      <header style={{maxWidth: maxWidth }}>
        <a href='/view'><img src={`data:image/png;base64,${icon}`} alt="Rentap Icon" /></a>
        <div style={{display:'inline-block', fontWeight:'bold', color:'blue', fontSize:23.5*m}}> {message} </div>
      </header>
      <body style={{backgroundColor:rLightBlue, maxWidth: maxWidth }} >
        <h3 style={{backgroundColor:'darkblue', color:'white', textAlign:'center', maxWidth:maxWidth, fontSize:28*m}}>'Applying for:' Options</h3>
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Delete Option</legend>
          <form action="/delheader" method="post" encType="multipart/form-data" style={{display:'flex', justifyContent:'center'}} >
            <input type="submit" defaultValue="X" style={{backgroundColor:'darkred', color:'white', fontSize:23.5*m}} />
            <Field type= "number" name="Row" placeholder="Row" width="30%" viewOnly={false} m={m}/>
          </form>
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Edit Option</legend>
          <form action="/editheader" method="post" encType="multipart/form-data" style={{display:'flex'}}  >
            <select name="select" id="select" style={{fontSize:21*m, width:'100%'}}  value={headerNames[editRow]} onChange={function(){}} >
              {headerNames.map( (name:string) => <option value={name} key={name}>{name}</option> )}
            </select>
            <input type="submit" defaultValue="Edit" style={{backgroundColor:'darkblue', color:'white', fontSize:21*m}} />
          </form>
          <form action="/saveheader" method="post" encType="multipart/form-data">
            <div style={{display:'flex'}}>
              <input type="submit" defaultValue="Save" style={{backgroundColor:'darkblue', color:'white', fontSize:21*m}} />
              <Field type= "text" name="Name" placeholder="" width="100%" ap={headers[editRow]} viewOnly={true} m={m} />
            </div>
            <Field type= "text" name="StreetAddress" placeholder="Street Address" width="100%" ap={headers[editRow]} viewOnly={false} m={m} />
            <Field type= "text" name="CityStateZip" placeholder="City State Zip" width="100%" ap={headers[editRow]} viewOnly={false} m={m} />
            <Field type= "text" name="Title" placeholder="Title" width="100%" ap={headers[editRow]} viewOnly={false} m={m} />
          </form>
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Add Option</legend>
          <form action="/addheader" method="post" encType="multipart/form-data">
            <div style={{display:'flex'}}>
              <input type="submit" defaultValue="+" style={{backgroundColor:'darkblue', color:'white', fontSize:21*m}} />
              <Field type= "text" name="Name" placeholder="Unique Option Name" width="100%" viewOnly={false} m={m} />
            </div>
            <Field type= "text" name="StreetAddress" placeholder="Street Address" width="100%" viewOnly={false} m={m} />
            <Field type= "text" name="CityStateZip" placeholder="City State Zip" width="100%" viewOnly={false} m={m} />
            <Field type= "text" name="Title" placeholder="Title" width="100%" viewOnly={false} m={m} />
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

  const fieldsetStyle={display:'inline-block', width:425*m, border:'none', fontSize:23.5*m};
  const legendStyle={width:'auto', marginLeft:'auto', marginRight:'auto', color:rGray};
  // when toggling Sort/Unsort button, check whether or not "Sorted:" was inserted at top of list
  const sorted = foundFullNames[0].substring(0,7) === "Sorted:";
  const maxWidth = phone ? 428*m : 1394*m; // force single-column on phone

  return (
    <>
      <meta charSet="utf-8" />
      <title>Rentap</title>
      <link rel="icon" href={`data:image/x-icon;base64,${icon}`} />
      <header style={{maxWidth: maxWidth}}>
        <div style={{display:'flex', minHeight:76*m, border:'8px solid white', marginBottom:16*m, marginLeft:16*m, minWidth:425*m, maxWidth:maxWidth}} >
          <div style={{flex:'grow', textAlign:'center', backgroundColor:'darkred', width:70*m}} >
            <a href='/view' ><img src={`data:image/png;base64,${icon}`} alt="Rentap Icon" style={{marginTop:12*m}} /></a>
          </div>
          <div style={{flex: 1, alignItems:'center', minHeight:54*m, fontWeight:'bold', textAlign:'center', backgroundColor:'darkblue', color:'white', fontSize:23.5*m }}>
            <p> {message} </p>
          </div>
        </div>
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Navigation</legend>
          <div style={{display:'flex', justifyContent:'space-between'}}>
          <div style={{display:'block'}}>
            <form action="/search" method="post" encType="multipart/form-data" style={{margin:'0'}} >
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:5*m}} >
                <input type="text" name="search" id="search" placeholder="search" style={{width:'50%', fontSize:21*m}} />
                <input type="submit" defaultValue="&#10003;" style={{backgroundColor:'darkblue', color:'white', fontSize:21*m}} />
                <div>
                  <a href="/prev" ><button type="button" style={{backgroundColor:rGray, color:'white', fontSize:21*m }} >&lt;</button></a>
                  <div style={{backgroundColor:rDisabled, textAlign:'center', display:'inline-block', width:80*m, fontSize:23.5*m }}>{apID}</div>
                  <a href="/next" ><button type="button" style={{backgroundColor:rGray, color:'white', fontSize:21*m }} >&gt;</button></a>
                </div>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:5*m}} >
                <select name="searchFields" id="searchfields" value={searchField} style={{width:'80%', fontSize:21*m }} onChange={function(){}} >
                  <option value="selectSearchFields" key="selectSearchFields"> ALL  or [ Select field to search ]</option>
                  {Object.keys(ap).map( (key:string) => <option value={key} key={key}>{camelCaseToWords(key)}</option> )}
                </select>
                <a href="/sort" ><button type="button" style={{backgroundColor:rGray, color:'white', fontSize:21*m }} >{sorted ? "Unsort" : "Sort"}</button></a>
              </div>
            </form>
            <form action="/select" method="post" encType="multipart/form-data"  style={{margin:'0'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <select name="select" id="select" value={ap.FullName ? ap.FullName : foundFullNames[0]} style={{width:'80%', fontSize:21*m}} onChange={function(){}} >
                  {foundFullNames.map( (name:any) => <option value={name} key={name}>{name}</option> )}
                </select>
                <input type="submit" defaultValue="View" style={{backgroundColor:'darkblue', color:'white', fontSize:21*m}} />
              </div>
            </form>
          </div>
          </div>
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Applying for:</legend>
          <div style={{display:'flex', justifyContent:'center'}}>
            <div style={{display:'block', color:'black'}}>
              <h3 style={{fontSize:28*m, margin:'0'}}>{header.Title ? header.Title : "Title"}</h3>
              <p style={{fontSize:23.5*m, marginTop:'0', marginBottom:5*m}}>
                {header.StreetAddress ? header.StreetAddress : "Street Address"}
                <br/> {header.CityStateZip ? header.CityStateZip : "City, ST Zip"}
              </p>
              <form action="/selectapplyingfor" method="post" encType="multipart/form-data" style={{margin:'0', marginBottom:5*m, display:'flex', justifyContent:'space-between'}} >
                <select name="selectApplyingFor" id="selectapplyingfor" style={{ display:'inline-block', width:'73%', fontSize:21*m }} value={header.Name} onChange={function(){}} required>
                  {headerNames.map( (name:string) => <option value={name} key={name}>{name}</option> )}
                </select>
                <input type="submit" defaultValue="Update" style={{backgroundColor:'darkblue', color:'white', fontSize:21*m}} />
              </form>
            </div>
          </div>
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Actions</legend>
          <div style={{display:'flex', justifyContent:'right'}}>
          <div style={{display:'block'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:5*m}}>
              <a href="/"><button type="button" style={{backgroundColor:'darkblue', color:'white', fontWeight:'bold', fontSize:21*m }} >New</button></a>
              {!apID ? "" :
                <a href={viewOnly?'/edit':'/view'}> <button type="button" style={{backgroundColor:'darkblue', color:'white', fontWeight:'bold', fontSize:21*m}}> {viewOnly?'Edit':'View'}</button></a>
              }
            </div>
            <div style={{marginBottom:5*m}}>
              {ap.FullName==="Deleted apID:" + apID ? <div>&bull</div> :
                <a href={inTrash ? "/restore" : "/discard"}><button type="button" style={{backgroundColor:rGray, color:'white', fontSize:21*m}}>{inTrash ? "Restore" : "Discard"}</button></a>
              }
              <div style={{backgroundColor:'gray', color:'white', textAlign:'center', display:'inline-block'}}>{'||'}</div>
              <a href={inTrash ? "/exittrash" : "/trash"}><button type="button" style={{backgroundColor:rGray, color:'white', fontSize:21*m}}>{inTrash ? "Exit Trash" : "View Discarded"}</button></a>
            </div>
            <a href={inTrash ? "/delete" : "/editheaders"} ><button type="button" style={{backgroundColor:inTrash ? 'darkred' : rGray, color:'white', fontSize:21*m}} >
              {inTrash ? "Delete (This is Permanent)" : "Edit 'Applying for:' Options"}</button></a>
          </div>
          </div>
        </fieldset>
      </header>
      <body style={{backgroundColor:rLightBlue, maxWidth: maxWidth}} >
      <form action="/save" method="post" encType="multipart/form-data" >
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Identity</legend>
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
          <legend style={legendStyle}>Situation</legend>
          <Label forId="headername" labelText="Applying for:" m={m} />
            <select name="headerName" id="headername"
              style={{width:'73%', marginLeft:8*m, marginBottom:2*m, fontSize:21*m }}
              value={header.Name} onChange={function(){}} disabled={viewOnly} required>
              {headerNames.map( (name:string) => <option value={name} key={name}>{name}</option> )}
            </select>
          <TextArea rows={5}  name="ProposedOccupants" placeholder="Proposed Occupants: self+age, other+age" ap={ap} viewOnly={viewOnly} m={m} />
          <TextArea rows={3}  name="ProposedPets"      placeholder="Proposed Pets, names, types, ages, weights" ap={ap} viewOnly={viewOnly} m={m} />
          <TextArea rows={6}  name="Income"            placeholder="Income amount and source" ap={ap} viewOnly={viewOnly} m={m} />
          <TextArea rows={14} name="Employment"        placeholder="Employment: address, job/position, dates, hours, supervisor name and phone number" ap={ap} viewOnly={viewOnly} m={m} />
        </fieldset>
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Criminal &amp; Civil Record | Notes</legend>
          <TextArea rows={15} name="Evictions"         placeholder="Evictions Past 10 Years, or other notes" ap={ap} viewOnly={viewOnly} m={m} />
          <TextArea rows={15} name="Felonies"          placeholder="Felonies/Drug Convictions, or other notes" ap={ap} viewOnly={viewOnly} m={m} />
        </fieldset>
        <br />
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Agreement Dates</legend>
          <Label forId="datestart" labelText="Start | Stop" m={m}/> <Field type="date" name="dateStart" placeholder="" width='36%' ap={ap} viewOnly={viewOnly} m={m} />
                                                              <Field type="date" name="dateStop"  placeholder="" width='36%' ap={ap} viewOnly={viewOnly} m={m} />
        </fieldset>
        <Label forId="dateapplied" labelText="Applied" m={m}/> <Field type="date" name="dateApplied" placeholder="" width='auto' ap={ap} viewOnly={viewOnly} m={m} />
        {viewOnly ? "" : <input type="submit" defaultValue="Save" style={{backgroundColor:'darkblue', color:'white', marginLeft:15*m, fontSize:21*m}} />}
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
      style={{width:width, marginBottom:2*m, backgroundColor:viewOnly?rDisabled:'white', fontSize:21*m}}
      value={ap ? ap[name] : ""} readOnly={viewOnly} onChange={function(){}} required={required} />
  )
}

function TextArea({rows, name, placeholder, ap, viewOnly, m}: { rows:number, name:string, placeholder:string, ap: {[key:string]: any}, viewOnly: boolean, m:number }) {
  return (
    <textarea rows={rows} name={name} placeholder={placeholder}
      style={{width:'100%', marginBottom:2*m, backgroundColor:viewOnly?rDisabled:'white', fontSize:21*m}}
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
