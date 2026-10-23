(() => {
  // Embedded build-time index avoids remote data loading which often fails under file:// on phones.
  const pages = [{"group":"Academy / .org","path":"org/index.html","label":"Home","title":"Academy of Emerging Creators"},{"group":"Academy / .org","path":"org/about.html","label":"About","title":"About"},{"group":"Academy / .org","path":"org/member-001.html","label":"Member #001","title":"Member #001"},{"group":"Academy / .org","path":"org/creators.html","label":"Creators","title":"Creator Directory"},{"group":"Academy / .org","path":"org/projects.html","label":"Projects","title":"Project Library"},{"group":"Academy / .org","path":"org/initiatives.html","label":"Initiatives","title":"Initiatives"},{"group":"Academy / .org","path":"org/project-record.html","label":"Project detail","title":"Academy Project Record"},{"group":"Academy / .org","path":"org/membership.html","label":"Membership","title":"Membership concept"},{"group":"Academy / .org","path":"org/apply.html","label":"Apply","title":"Application preview"},{"group":"Academy / .org","path":"org/site-map.html","label":"All pages","title":"All Academy pages"},{"group":"Production / .com","path":"com/index.html","label":"Home","title":"AEC Production"},{"group":"Production / .com","path":"com/portfolio.html","label":"Portfolio","title":"Portfolio"},{"group":"Production / .com","path":"com/production-record.html","label":"Production detail","title":"Project Record"},{"group":"Production / .com","path":"com/workflow.html","label":"Workflow","title":"Production Workflow"},{"group":"Production / .com","path":"com/production-inquiry.html","label":"Inquiry preview","title":"Project inquiry concept"},{"group":"Production / .com","path":"com/site-map.html","label":"All pages","title":"All production pages"}];
  const list = document.getElementById('desk-page-list');
  const frame = document.getElementById('desk-frame');
  const open = document.getElementById('desk-open');
  const stage = document.getElementById('desk-stage');
  const query = document.getElementById('desk-search');
  const count = document.getElementById('desk-count');
  let selected = pages[0].path;
  function select(page) {
    selected = page.path;
    frame.src = page.path;
    frame.title = page.group + ': ' + page.label + ' draft page';
    open.href = page.path;
    document.getElementById('desk-title').textContent = page.label;
    document.getElementById('desk-path').textContent = page.path;
    document.getElementById('desk-surface').textContent = page.group;
    for (const b of list.querySelectorAll('button[data-path]')) b.setAttribute('aria-current', b.dataset.path === selected ? 'page' : 'false');
  }
  function render() {
    const q = query.value.trim().toLowerCase();
    list.replaceChildren();
    let total = 0;
    for (const group of ['Academy / .org','Production / .com']) {
      const found = pages.filter(p => p.group === group && (p.label+' '+p.path+' '+p.title).toLowerCase().includes(q));
      if (!found.length) continue;
      const h = document.createElement('h3'); h.textContent = group; list.appendChild(h);
      for (const p of found) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'desk-page-button'; b.textContent = p.label;
        b.dataset.path = p.path; b.setAttribute('aria-current', p.path === selected ? 'page' : 'false');
        b.addEventListener('click', () => select(p)); list.appendChild(b); total++;
      }
    }
    count.textContent = `${total} of ${pages.length} draft pages shown`;
    if (!total) { const p=document.createElement('p');p.textContent='No matching pages.';list.appendChild(p); }
  }
  query.addEventListener('input', render);
  for (const b of document.querySelectorAll('[data-width]')) b.addEventListener('click', () => {
    stage.style.setProperty('--frame-width', b.dataset.width+'px');
    for (const other of document.querySelectorAll('[data-width]')) other.setAttribute('aria-pressed', String(other===b));
  });
  stage.style.setProperty('--frame-width','390px');
  select(pages[0]);render();
})();