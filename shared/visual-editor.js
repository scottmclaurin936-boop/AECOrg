/* AEC visual draft editor — local-only. No publishing or server writes.
   Enable from any Academy/production page with ?edit=1. */
(() => {
  'use strict';
  const EDITOR_VERSION = 1;
  const STORAGE_KEY = 'aec-front-end-draft-v1';
  const page = location.pathname.split('/').slice(-2).join('/');
  const isEditorRequested = new URLSearchParams(location.search).get('edit') === '1';
  const local = location.protocol === 'file:';
  const allowed = isEditorRequested || local;
  if (!allowed) return;
  const pages = (() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  })();
  const draft = pages[page] || { text: {}, attributes: {}, media: {}, added: {}, hidden: {}, order: [], theme: {} };
  for (const part of ['text', 'attributes', 'media', 'added', 'hidden', 'theme']) draft[part] ||= {};
  draft.order ||= [];
  const all = selector => Array.from(document.querySelectorAll(selector));
  const statusText = (message, error = false) => {
    const status = document.querySelector('#aec-editor-status');
    if (status) { status.textContent = message; status.dataset.error = String(error); }
  };
  function save() {
    pages[page] = draft;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pages)); statusText('Draft saved on this device. Not published.'); return true; }
    catch { statusText('Device storage is full. Export your draft to keep these changes.', true); return false; }
  }
  function selectorId(element) { return element.dataset.aecNode || element.dataset.aecImage || element.dataset.aecSection || ''; }
  function initialTags() {
    const root = document.body;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent.trim()) continue;
      const parent = node.parentElement;
      if (!parent || parent.closest('script,style,textarea,option,pre,code,[data-aec-editor-ui],[contenteditable]')) continue;
      nodes.push(node);
    }
    nodes.forEach((node, idx) => {
      const span = document.createElement('span');
      span.dataset.aecNode = 't' + idx;
      span.className = 'aec-edit-text';
      span.textContent = Object.hasOwn(draft.text, span.dataset.aecNode) ? draft.text[span.dataset.aecNode] : node.textContent;
      node.replaceWith(span);
      span.addEventListener('input', () => { draft.text[span.dataset.aecNode] = span.textContent; saveSoon(); });
      span.addEventListener('blur', save);
    });
    all('header img,main img,footer img,main [role="img"],main .orbital').forEach((element, idx) => {
      element.dataset.aecImage = 'i' + idx;
      const media = draft.media[element.dataset.aecImage];
      if (media) setImage(element, media);
    });
    all('main > section').forEach((element, idx) => {
      element.dataset.aecSection = 's' + idx;
      if (draft.hidden[element.dataset.aecSection]) element.classList.add('aec-section-muted');
    });
    all('header a, main a, footer a, main input, main textarea, main button, header img, main img, footer img').forEach((element, idx) => {
      element.dataset.aecAttribute = 'a' + idx;
      const attrs = draft.attributes[element.dataset.aecAttribute] || {};
      for (const [name, value] of Object.entries(attrs)) if (['href', 'alt', 'title', 'placeholder', 'aria-label'].includes(name)) element.setAttribute(name, value);
    });
    all('[data-aec-section]').forEach(section => {
      const saved = draft.added[section.dataset.aecSection] || [];
      for (const item of saved) addImageElement(section, item, false);
    });
    if (draft.order.length) {
      const parent = document.querySelector('main');
      if (parent) draft.order.forEach(id => {
        const section = all('main > section').find(item => item.dataset.aecSection === id);
        if (section) parent.append(section);
      });
    }
  }
  function setImage(el, media) {
    if (el.tagName.toLowerCase() === 'img') {
      el.src = media;
    } else {
      el.style.backgroundImage = `linear-gradient(0deg, rgba(3,18,32,.2), rgba(3,18,32,.2)), url(${JSON.stringify(media)})`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.classList.add('aec-has-image');
    }
  }
  function addImageElement(section, data, persist = true) {
    const figure = document.createElement('figure');
    figure.className = 'aec-inserted-image';
    const img = document.createElement('img');
    img.src = data.src;
    img.alt = data.alt || 'Creator-selected image';
    img.dataset.aecImage = data.id;
    figure.append(img);
    const wrap = section.querySelector('.wrap') || section;
    wrap.append(figure);
    if (persist) { (draft.added[section.dataset.aecSection] ||= []).push(data); save(); }
    return img;
  }
  let saveTimer;
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 400); }
  const style = document.createElement('style');
  style.textContent = `
  body.aec-edit-active [data-aec-node] { outline: 1px dashed #2ebfcd55; cursor: text; border-radius: 2px; }
  body.aec-edit-active [data-aec-node]:focus { outline: 2px solid #29d5d0; background: rgba(41,213,208,.12); }
  body.aec-edit-active [data-aec-image] { outline: 2px dashed #26cecc; cursor: pointer; }
  body.aec-edit-active a { cursor: text; }
  .aec-section-muted { opacity: .40; }
  body:not(.aec-edit-active) .aec-section-muted { display:none; }
  .aec-inserted-image { margin: 22px 0; }
  .aec-inserted-image img { max-width: 100%; max-height: 560px; border-radius: 16px; object-fit: contain; }
  .aec-has-image > span { display:none; }
  #aec-editor-launch { position: fixed; right: 14px; bottom: 15px; z-index: 10100; padding: 12px 16px; background: #0e8795; color: #fff; border:2px solid #39d6d1; border-radius: 40px; box-shadow: 0 5px 24px #0008; font: 700 14px/1.2 system-ui; cursor:pointer; }
  #aec-editor-panel { position:fixed; z-index:10101; right: 10px; bottom: 72px; width: min(355px, calc(100vw - 20px)); max-height: min(82vh, 700px); overflow:auto; padding: 14px; border:1px solid #35c5d0; border-radius:17px; color:#ebfaff; background:#092d43; box-shadow: 0 18px 80px #000a; font: 14px/1.45 system-ui,sans-serif; }
  #aec-editor-panel[hidden] { display:none; }
  #aec-editor-panel h2 { font: 700 19px/1.2 system-ui; margin:0 0 8px; color:#fff; }
  #aec-editor-panel .aec-buttons { display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:10px 0; }
  #aec-editor-panel button, #aec-editor-panel select { min-height:42px; font:inherit; border-radius:8px; border:1px solid #429da9; background:#0d5164; color:#fff; padding:7px; cursor:pointer; }
  #aec-editor-panel button:focus-visible { outline: 3px solid #fff; }
  #aec-editor-panel input:not([type=file]) { width:100%;padding:9px;border-radius:7px;border:1px solid #5dc8d0;font:inherit; background:#e9fbff;color:#082235; }
  #aec-editor-panel label { font-weight:650;display:block;margin:8px 0 4px; }
  #aec-editor-status {font-size:12px;min-height:2.5em;margin-top:10px;color:#9af4e7;}
  #aec-editor-status[data-error="true"] {color:#ffbaba;}
  .aec-editor-help {font-size:12px;opacity:.88;margin:6px 0 12px;}
  `;
  document.head.append(style);
  const launch = document.createElement('button');
  launch.id = 'aec-editor-launch';
  launch.dataset.aecEditorUi = '1';
  launch.textContent = '✎ Edit page';
  launch.type='button';
  const panel = document.createElement('aside');
  panel.id = 'aec-editor-panel';
  panel.dataset.aecEditorUi = '1';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'AEC front-end visual editor');
  panel.innerHTML = `<h2>AEC Visual Editor</h2>
    <p class="aec-editor-help">Tap visible text to change it, or tap an image to replace it. Your draft saves only on this device. Nothing is published or sent to GitHub.</p>
    <div class="aec-buttons"><button type="button" data-action="save">Save draft</button><button type="button" data-action="export">Export all pages</button><button type="button" data-action="import">Import draft</button><button type="button" data-action="image">Replace image</button><button type="button" data-action="add-image">Add image</button><button type="button" data-action="link">Edit link / alt</button><button type="button" data-action="up">Section ↑</button><button type="button" data-action="down">Section ↓</button><button type="button" data-action="hide">Show / hide section</button><button type="button" data-action="reset">Reset page draft</button></div>
    <label for="aec-editor-accent">Theme accent</label><input id="aec-editor-accent" type="color" value="#21b9c1" aria-label="Theme accent color">
    <label for="aec-editor-link">Selected link / image description</label><input id="aec-editor-link" type="text" placeholder="Select a link or image first">
    <input id="aec-editor-file" type="file" accept="image/*" hidden>
    <input id="aec-editor-import" type="file" accept=".json,application/json" hidden>
    <p id="aec-editor-status" role="status">Local draft mode. Not published.</p>`;
  document.body.append(launch,panel);
  initialTags();
  const selected = {element:null, section:null};
  let editing=false;
  const accent=panel.querySelector('#aec-editor-accent');
  const linkInput=panel.querySelector('#aec-editor-link');
  const fileInput=panel.querySelector('#aec-editor-file');
  const importInput=panel.querySelector('#aec-editor-import');
  const themeId = 'aec-user-theme';
  function applyTheme() {
    let node=document.getElementById(themeId);
    if(!node) {node=document.createElement('style');node.id=themeId;document.head.append(node);}
    const c=draft.theme.accent;
    node.textContent=c ? `:root {--accent:${c};}` : '';
    if(c) accent.value=c;
  }
  applyTheme();
  function currentElement(eventTarget) {
    if(eventTarget.closest('[data-aec-editor-ui]')) return null;
    return eventTarget.closest('[data-aec-node],[data-aec-image],a,button,input,textarea,label,section') || eventTarget;
  }
  function updateSelected(event) {
    if (!editing || event.target.closest('[data-aec-editor-ui]')) return;
    const element = currentElement(event.target);
    if(!element) return;
    selected.element=element;
    selected.section=element.closest('[data-aec-section]');
    const attrTarget=element.closest('[data-aec-attribute]') || element;
    linkInput.value=attrTarget.getAttribute('href') || attrTarget.getAttribute('alt') || attrTarget.getAttribute('aria-label') || '';
    statusText('Selected: '+(element.dataset.aecNode ? 'editable text' : element.dataset.aecImage ? 'image' : element.tagName.toLowerCase())+'.');
  }
  document.addEventListener('click', event => {
    if (!editing || event.target.closest('[data-aec-editor-ui]')) return;
    updateSelected(event);
    if (event.target.closest('a')) event.preventDefault();
  }, true);
  document.addEventListener('focusin', updateSelected);
  function toggle() {
    editing=!editing;
    document.body.classList.toggle('aec-edit-active',editing);
    panel.hidden=!editing;
    launch.textContent=editing?'✓ Close editor':'✎ Edit page';
    all('[data-aec-node]').forEach(element => {
      element.contentEditable=editing?'true':'false';
      element.spellcheck=editing;
    });
    if(!editing) save();
  }
  launch.addEventListener('click',toggle);
  accent.addEventListener('input',e=>{draft.theme.accent=e.target.value;applyTheme();saveSoon();});
  function downloadJSON() {
    save();
    const payload=JSON.stringify({schema:'aec-visual-draft',version:EDITOR_VERSION,pages,exportedAt:new Date().toISOString(),published:false},null,2);
    const url=URL.createObjectURL(new Blob([payload],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='AEC_VISUAL_DRAFT_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
    statusText('Complete editing draft exported as JSON. It has not been published.');
  }
  function resizeImage(file) {
    return new Promise((resolve,reject)=>{
      if (!file || !file.type.startsWith('image/')) return reject(new Error('Choose an image.'));
      const reader=new FileReader();
      reader.onerror=()=>reject(new Error('Cannot read image.'));
      reader.onload=()=>{
        const img=new Image();
        img.onerror=()=>reject(new Error('Cannot open image.'));
        img.onload=()=>{
          const max=1600, scale=Math.min(1,max/Math.max(img.width,img.height));
          const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
          const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);
          resolve(canvas.toDataURL('image/jpeg',.78));
        };img.src=reader.result;
      };reader.readAsDataURL(file);
    });
  }
  let pendingImageAction='replace';
  fileInput.addEventListener('change',async()=>{
    try {
      const src=await resizeImage(fileInput.files?.[0]);
      if (pendingImageAction==='add') {
        const section=selected.section || all('[data-aec-section]')[0];
        if (!section) throw new Error('Select a section first.');
        addImageElement(section,{id:'u'+Date.now(),src,alt:'Creator-selected image'});
      } else {
        const el=selected.element?.closest('[data-aec-image]') || selected.element?.querySelector?.('[data-aec-image]');
        if(!el) throw new Error('Tap an existing image or hero placeholder first.');
        setImage(el,src);
        const id=el.dataset.aecImage;
        if(id.startsWith('u')) {
          for(const arr of Object.values(draft.added)) {const item=arr.find(x=>x.id===id);if(item) item.src=src;}
        } else draft.media[id]=src;
        save();
      }
      statusText('Image updated in your local draft. Export a backup.');
    } catch(error) {statusText(error.message,true);}
    fileInput.value='';
  });
  importInput.addEventListener('change',async()=>{
    try {
      const file=importInput.files?.[0]; if(!file) return;
      const payload=JSON.parse(await file.text());
      if(payload.schema!=='aec-visual-draft'||payload.version!==1||typeof payload.pages!=='object'||Array.isArray(payload.pages)) throw new Error('Not an AEC visual editing backup.');
      if(!confirm('Import this draft onto this device? Existing local drafts will be replaced.')) return;
      localStorage.setItem(STORAGE_KEY,JSON.stringify(payload.pages));location.reload();
    } catch(error) {statusText('Import failed: '+error.message,true);}
  });
  panel.addEventListener('click',event=>{
    const btn=event.target.closest('[data-action]');if(!btn) return;
    const action=btn.dataset.action;
    const el=selected.element, section=selected.section;
    if(action==='save') save();
    if(action==='export') downloadJSON();
    if(action==='import') importInput.click();
    if(action==='image'||action==='add-image') {pendingImageAction=action==='image'?'replace':'add';fileInput.click();}
    if(action==='link') {
      const target=el?.closest('[data-aec-attribute]') || el?.querySelector?.('[data-aec-attribute]');
      if(!target) return statusText('Select a link, input, or image first.',true);
      const attr=target.matches('a')?'href':target.matches('img')?'alt':target.matches('input,textarea')?'placeholder':'aria-label';
      const value=linkInput.value.trim();
      if(attr==='href'&&!/^(https?:\/\/|mailto:|tel:|#|[.\/\w-]+\.html(?:[?#].*)?$)/i.test(value)) return statusText('Only normal web, email, telephone or local page links are allowed.',true);
      target.setAttribute(attr,value);
      (draft.attributes[target.dataset.aecAttribute] ||= {})[attr]=value;save();
    }
    if(action==='up'||action==='down') {
      if(!section) return statusText('Tap a section first.',true);
      const sibling=action==='up'?section.previousElementSibling:section.nextElementSibling;
      if(!sibling||!sibling.matches('[data-aec-section]')) return statusText('That section cannot move further.',true);
      if(action==='up') sibling.before(section);else sibling.after(section);
      draft.order=all('main > section').map(item=>item.dataset.aecSection);save();
    }
    if(action==='hide') {
      if(!section) return statusText('Tap a section first.',true);
      draft.hidden[section.dataset.aecSection]=!draft.hidden[section.dataset.aecSection];
      section.classList.toggle('aec-section-muted',draft.hidden[section.dataset.aecSection]);save();
    }
    if(action==='reset') {
      if(!confirm('Delete all local edits for this page? Export first if you may need them.')) return;
      delete pages[page];localStorage.setItem(STORAGE_KEY,JSON.stringify(pages));location.reload();
    }
  });
})();
