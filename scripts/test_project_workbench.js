// Dependency-free Node test for offline browser editor behavior, not a visual browser test.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
class El {
  constructor(id){this.id=id;this.value='';this.textContent='';this.children=[];this.handlers={};this.disabled=false;this.files=[];this.style={};}
  addEventListener(name,fn){this.handlers[name]=fn;}
  replaceChildren(...children){this.children=children;}
  append(...children){this.children.push(...children);}
  prepend(...children){this.children.unshift(...children);}
  click(){this.handlers.click?.({target:this});}
  remove(){}
  reset(){for(const k of ['id','title','summary','credits','assets']) elements['rec-'+k].value='';elements['rec-surface'].value='academy_org';elements['rec-category'].value='other';elements['rec-visibility'].value='draft';}
}
const ids=['rec-id','rec-surface','rec-title','rec-category','rec-summary','rec-credits','rec-assets','rec-visibility','record-checks','preview-surface','preview-title','preview-summary','preview-meta','export-record','reset-record','import-record','record-form'];
const elements=Object.fromEntries(ids.map(id=>[id,new El(id)]));
elements['rec-surface'].value='academy_org';elements['rec-category'].value='other';elements['rec-visibility'].value='draft';
let downloaded='';
const sandbox={document:{getElementById:id=>elements[id],createElement:tag=>new El(tag),body:{append() {}}},Blob:class{constructor(chunks){this.text=chunks.join('');downloaded=this.text;}},URL:{createObjectURL:()=> 'blob:local',revokeObjectURL(){}},setTimeout:fn=>fn(),Object,console};
vm.runInNewContext(fs.readFileSync('shared/project-workbench.js','utf8'),sandbox);
assert(elements['export-record'].disabled,'empty draft must not export');
elements['rec-id'].value='film-project-001';elements['rec-title'].value='Working film title';elements['rec-summary'].value='<img src=x onerror=alert(1)>';elements['rec-category'].value='film';elements['rec-assets'].value='cover_01\ncover_01';elements['rec-id'].handlers.input();
assert(elements['export-record'].disabled,'duplicate asset references must fail');
elements['rec-assets'].value='cover_01';elements['rec-assets'].handlers.input();
assert(!elements['export-record'].disabled,'valid draft must export');
assert.equal(elements['preview-summary'].textContent,'<img src=x onerror=alert(1)>','preview must be text-only');
elements['export-record'].click();
let exported=JSON.parse(downloaded);
assert.equal(exported.surface,'academy_org');assert.equal(exported.approval.approved_by,null);assert.equal(exported.approval.rights_verified,false);
assert.equal(exported.visibility,'draft');
(async()=>{
  const importData={id:'music-record-002',surface:'production_com',title:'Music project',category:'music',summary:'Working text',visibility:'approved_public',approval:{approved_by:'Someone',approved_at:'2026-10-22',rights_verified:true},assets:[],credits:[]};
  await elements['import-record'].handlers.change({target:{files:[{size:250,text:async()=>JSON.stringify(importData)}],value:''}});
  assert.equal(elements['rec-visibility'].value,'draft','import must remove public visibility');
  assert.equal(elements['rec-surface'].value,'production_com');
  elements['export-record'].click();exported=JSON.parse(downloaded);
  assert.equal(exported.approval.approved_by,null);assert.equal(exported.approval.rights_verified,false);
  assert.equal(exported.visibility,'draft');
  assert.equal(exported.surface,'production_com');
  console.log('PASS: invalid input blocked, safe text preview, valid export, import approval downgrade, surface isolation.');
})().catch(e=>{console.error(e);process.exit(1)});
