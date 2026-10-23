(() => {
  // Local-only placeholder shelf: search and category filtering; no network access.
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-category]')];
  const search = document.getElementById('project-search');
  const status = document.getElementById('filter-status');
  const empty = document.getElementById('no-results');
  let choice = 'all';
  function applyFilters() {
    const query = (search?.value || '').trim().toLocaleLowerCase();
    let shown = 0;
    cards.forEach(card => {
      const categoryMatch = choice === 'all' || card.dataset.category === choice;
      const textMatch = !query || card.textContent.toLocaleLowerCase().includes(query);
      const visible = categoryMatch && textMatch;
      card.hidden = !visible;
      if (visible) shown++;
    });
    if (status) status.textContent = `${shown} placeholder ${shown === 1 ? 'category' : 'categories'} shown`;
    if (empty) empty.hidden = shown !== 0;
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    choice = button.dataset.filter;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    applyFilters();
  }));
  search?.addEventListener('input', applyFilters);
  // Form previews intentionally have no action, API, localStorage, or real submission.
  function bindPreview(formId, resultId, fields, title) {
    const form=document.getElementById(formId);const output=document.getElementById(resultId);
    if(!form || !output)return;
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(!form.reportValidity())return;
      const box=document.createElement('div');
      const heading=document.createElement('h3');heading.textContent=title;box.appendChild(heading);
      const note=document.createElement('p');note.className='small muted';note.textContent='Local preview only — not submitted, received, approved, or saved.';box.appendChild(note);
      const dl=document.createElement('dl');dl.className='facts';
      for(const [label,id] of fields){const row=document.createElement('div');const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=document.getElementById(id).value.trim();row.append(dt,dd);dl.appendChild(row);}
      box.appendChild(dl);output.replaceChildren(box);
    });
    form.addEventListener('reset',()=>{output.textContent='Example cleared. Nothing was sent or saved.';});
  }
  bindPreview('application-demo','application-result',[['Display name','app-name'],['Creative area','app-interest'],['Project idea','app-note']],'Application review summary');
  bindPreview('brief-demo','brief-result',[['Project','brief-title'],['Category','brief-type'],['Sample scope','brief-scope']],'Production brief summary');
  document.querySelectorAll('.mobile-nav').forEach(menu => {
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
    menu.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        menu.querySelector('summary')?.focus();
      }
    });
    document.addEventListener('pointerdown', event => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  });
})();
