(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fields = ['id','surface','title','category','summary','credits','assets','visibility'];
  const f = Object.fromEntries(fields.map(k => [k, $('rec-' + k)]));
  const checkBox = $('record-checks');
  const categoryLabels = {film:'Film',music:'Music',audio:'Audio / podcast',design:'Design',publishing:'Publishing',other:'Other / undecided'};
  const surfaceLabels = {academy_org:'Academy / .org',production_com:'Production / .com'};
  const splitLines = value => value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  function record() {
    return {
      id: f.id.value.trim(), surface: f.surface.value, title: f.title.value.trim(),
      category: f.category.value, summary: f.summary.value.trim(), visibility: f.visibility.value,
      approval: {approved_by:null,approved_at:null,rights_verified:false},
      assets: splitLines(f.assets.value), credits: splitLines(f.credits.value)
    };
  }
  function validate(r) {
    const errors=[];
    if (!/^[a-z0-9][a-z0-9-]{2,63}$/.test(r.id)) errors.push('Record ID must be 3–64 lowercase letters, digits, or hyphens.');
    if (!r.title || r.title.length>140) errors.push('Enter a project title (1–140 characters).');
    if (r.summary.length>1500) errors.push('Keep the summary to 1,500 characters or fewer.');
    if (!Object.hasOwn(surfaceLabels,r.surface)) errors.push('Choose a supported AEC surface.');
    if (!Object.hasOwn(categoryLabels,r.category)) errors.push('Choose a supported discipline.');
    if (!['draft','review'].includes(r.visibility)) errors.push('Only draft and review stages can be exported.');
    if (r.assets.some(x=>!/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,79}$/.test(x))) errors.push('Asset IDs must be 2–80 letters, numbers, underscores, or hyphens.');
    if (new Set(r.assets).size!==r.assets.length) errors.push('Duplicate asset IDs must be removed.');
    return errors;
  }
  function render() {
    const r=record(), errors=validate(r);
    $('preview-surface').textContent=surfaceLabels[r.surface] || 'Unknown';
    $('preview-title').textContent=r.title || 'Untitled draft';
    $('preview-summary').textContent=r.summary || 'No summary entered.';
    $('preview-meta').textContent=`${categoryLabels[r.category] || 'Unknown'} · ${r.visibility==='review'?'Human review pending':'Draft'} · ${r.assets.length} asset reference(s)`;
    checkBox.replaceChildren();
    const p=document.createElement('p');p.textContent=errors.length?`${errors.length} issue(s) to fix before export.`:'Draft metadata is structurally ready for export. NOT approved for publication.';checkBox.append(p);
    if(errors.length){const ul=document.createElement('ul');for(const e of errors){const li=document.createElement('li');li.textContent=e;ul.append(li);}checkBox.append(ul);}
    $('export-record').disabled=errors.length>0;
  }
  for(const input of Object.values(f)) input.addEventListener('input',render);
  $('reset-record').addEventListener('click',()=>{ $('record-form').reset();$('import-record').value='';render(); });
  $('export-record').addEventListener('click',()=>{
    const r=record();if(validate(r).length){render();return;}
    const blob=new Blob([JSON.stringify(r,null,2)+'\n'],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`aec-${r.surface}-${r.id}.draft.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  });
  $('import-record').addEventListener('change',async event=>{
    const file=event.target.files?.[0];if(!file)return;
    try{
      if(file.size>1024*1024)throw Error('File exceeds 1 MB limit.');
      const data=JSON.parse(await file.text());
      if(!data || typeof data!=='object' || Array.isArray(data))throw Error('Expected a JSON object.');
      f.id.value=typeof data.id==='string'?data.id:'';
      f.surface.value=['academy_org','production_com'].includes(data.surface)?data.surface:'academy_org';
      f.title.value=typeof data.title==='string'?data.title:'';
      f.category.value=Object.hasOwn(categoryLabels,data.category)?data.category:'other';
      f.summary.value=typeof data.summary==='string'?data.summary:'';
      f.credits.value=Array.isArray(data.credits)?data.credits.filter(x=>typeof x==='string').join('\n'):'';
      f.assets.value=Array.isArray(data.assets)?data.assets.filter(x=>typeof x==='string').join('\n'):'';
      f.visibility.value='draft'; // Deliberately downgrade all imported records; never import approval claims.
      render();
      const p=document.createElement('p');p.textContent='Imported locally as an unapproved draft. Any prior approval or public visibility claims were discarded.';checkBox.prepend(p);
    }catch(e){const p=document.createElement('p');p.textContent='Import failed: '+e.message;checkBox.replaceChildren(p);}
    event.target.value='';
  });
  render();
})();
