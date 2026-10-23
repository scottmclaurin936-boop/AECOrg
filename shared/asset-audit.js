(() => {
 const required = ["id", "filename", "sha256", "source", "rights_holder", "permission_record", "alt_text", "approved_by", "approved_at", "intended_surface"];
 const baseline = {"assets": [], "approved_public_entries": []};
 const file = document.getElementById('manifest-input');
 const output = document.getElementById('audit-results');
 const status = document.getElementById('audit-status');
 function audit(data) {
   output.replaceChildren();
   if (!data || typeof data !== 'object' || !Array.isArray(data.assets) || !Array.isArray(data.approved_public_entries)) {
     status.textContent = 'Invalid registry: assets and approved_public_entries must be arrays.'; return;
   }
   const issues = [];
   const ids = new Set();
   data.assets.forEach((a,i) => {
     if (!a || typeof a !== 'object') {issues.push(`Asset ${i+1}: not an object`);return;}
     for (const k of required) if (typeof a[k] !== 'string' || !a[k].trim()) issues.push(`Asset ${i+1}: missing ${k}`);
     if (a.id && ids.has(a.id)) issues.push(`Asset ${i+1}: duplicate id`);
     if (a.id) ids.add(a.id);
     if (a.sha256 && !/^[a-f0-9]{64}$/i.test(a.sha256)) issues.push(`Asset ${i+1}: SHA-256 must have 64 hex characters`);
     if (a.intended_surface && !['academy_org','production_com'].includes(a.intended_surface)) issues.push(`Asset ${i+1}: invalid surface; Peak Irony is separate`);
   });
   data.approved_public_entries.forEach((e,i) => {
     if (!e || typeof e !== 'object') {issues.push(`Entry ${i+1}: not an object`);return;}
     for (const k of ['id','title','owner','summary','status','visibility','approved_by','approved_at','credits']) if (typeof e[k] !== 'string' || !e[k].trim()) issues.push(`Entry ${i+1}: missing ${k}`);
     if (!Array.isArray(e.asset_ids)) issues.push(`Entry ${i+1}: asset_ids must be an array`);
     else for (const id of e.asset_ids) if (!ids.has(id)) issues.push(`Entry ${i+1}: unknown asset id ${String(id)}`);
   });
   const summary = document.createElement('p'); summary.textContent = `${data.assets.length} assets · ${data.approved_public_entries.length} public entries · ${issues.length} structural issues`;
   output.appendChild(summary);
   if (issues.length) {
     const ul=document.createElement('ul'); for (const issue of issues.slice(0,100)) {const li=document.createElement('li');li.textContent=issue;ul.appendChild(li);}output.appendChild(ul);
     if (issues.length>100) {const p=document.createElement('p');p.textContent=`${issues.length-100} more issues not shown`;output.appendChild(p);}
   } else {const p=document.createElement('p');p.textContent='Structure check passed. This does not confer publication approval.';output.appendChild(p);}
   status.textContent = 'Audit complete. No files or data were sent anywhere.';
 }
 document.getElementById('audit-default').addEventListener('click',()=>audit(baseline));
 document.getElementById('audit-clear').addEventListener('click',()=>{output.replaceChildren();status.textContent='Results cleared.';file.value='';});
 file.addEventListener('change',async()=>{
   if(!file.files.length)return;
   try {if(file.files[0].size>2_000_000)throw new Error('File exceeds 2 MB review limit');audit(JSON.parse(await file.files[0].text()));}
   catch(e) {output.replaceChildren();status.textContent='Could not read manifest: '+e.message;}
 });
})();