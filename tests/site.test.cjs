const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
function page(kind = 'home', options = {}) {
    const dir = kind === 'home' ? 'public' : 'library-site';
    const dom = new JSDOM(fs.readFileSync(`${dir}/index.html`, 'utf8'), {
        url: kind === 'home' ? 'https://aecorg.vercel.app' : 'https://aecorg-library.vercel.app',
        runScripts: 'outside-only'
    });
    const win = dom.window;
    if (options.draft) win.localStorage.setItem('aec-homepage-draft-v1', JSON.stringify(options.draft));
    if (options.note) win.localStorage.setItem('aec-private-library-note-v1', options.note);
    if (options.corrupt) win.localStorage.setItem('aec-homepage-draft-v1', '{');
    if (options.noStorage) Object.defineProperty(win, 'localStorage', { get() { throw new Error('Blocked'); } });
    win.confirm = () => true;
    win.eval(fs.readFileSync(`${dir}/${kind === 'home' ? 'site' : 'library'}.js`, 'utf8'));
    return win;
}
function click(win, id) { win.document.getElementById(id).click(); }
test('all homepage navigation targets exist; only library leaves the public site', () => {
    const win = page();
    for (const a of win.document.querySelectorAll('a')) {
        const href = a.getAttribute('href');
        assert.notEqual(href, '#');
        if (href.startsWith('#')) assert.ok(win.document.getElementById(href.slice(1)), href);
        else assert.equal(href, 'https://aecorg-library.vercel.app');
    }
    win.close();
});
test('theme toggles and is stored', () => {
    const win = page();
    click(win, 'themeToggleBtn');
    assert.equal(win.document.documentElement.dataset.theme, 'light');
    assert.equal(win.localStorage.getItem('aec-theme-v1'), 'light');
    click(win, 'themeToggleBtn');
    assert.equal(win.document.documentElement.dataset.theme, 'brown');
    win.close();
});
test('edits persist after locking and reloading, and reset restores original', () => {
    let win = page();
    const original = win.document.querySelector('h1').textContent;
    click(win, 'editToggleBtn');
    assert.equal(win.document.querySelector('h1').contentEditable, 'plaintext-only');
    const field = win.document.querySelector('h1');
    field.textContent = 'My draft title';
    field.dispatchEvent(new win.Event('input'));
    click(win, 'editToggleBtn');
    assert.equal(field.contentEditable, 'false');
    const draft = JSON.parse(win.localStorage.getItem('aec-homepage-draft-v1'));
    win.close();
    win = page('home', { draft });
    assert.equal(win.document.querySelector('h1').textContent, 'My draft title');
    click(win, 'resetDraftBtn');
    assert.equal(win.document.querySelector('h1').textContent, original);
    assert.equal(win.localStorage.getItem('aec-homepage-draft-v1'), null);
    win.close();
});
test('saved markup stays inert text, never injected HTML', () => {
    const win = page('home', { draft: { 'field-2': '<img src=x onerror=alert(1)>' } });
    assert.equal(win.document.querySelectorAll('img').length, 0);
    assert.ok(win.document.body.textContent.includes('<img src=x onerror=alert(1)>'));
    win.close();
});
test('corrupt storage and disabled storage fail honestly', () => {
    let win = page('home', { corrupt: true });
    assert.match(win.document.getElementById('draftStatus').textContent, /Could not load/);
    assert.equal(win.localStorage.getItem('aec-homepage-draft-v1'), '{');
    win.close();
    win = page('home', { noStorage: true });
    click(win, 'editToggleBtn');
    click(win, 'editToggleBtn');
    assert.match(win.document.getElementById('draftStatus').textContent, /unavailable or full/);
    win.close();
});
test('private note saves, reloads, and clears with confirmation', () => {
    let win = page('library');
    const notes = win.document.getElementById('privateNotes');
    notes.value = 'Reference notes';
    notes.dispatchEvent(new win.Event('input'));
    assert.equal(win.localStorage.getItem('aec-private-library-note-v1'), 'Reference notes');
    win.close();
    win = page('library', { note: 'Reference notes' });
    assert.equal(win.document.getElementById('privateNotes').value, 'Reference notes');
    win.confirm = () => false;
    click(win, 'clearNotes');
    assert.equal(win.document.getElementById('privateNotes').value, 'Reference notes');
    win.confirm = () => true;
    click(win, 'clearNotes');
    assert.equal(win.document.getElementById('privateNotes').value, '');
    assert.equal(win.localStorage.getItem('aec-private-library-note-v1'), null);
    win.close();
});
test('private notes do not pretend to save if storage is blocked', () => {
    const win = page('library', { noStorage: true });
    click(win, 'saveNotes');
    assert.match(win.document.getElementById('noteStatus').textContent, /Could not save locally/);
    win.close();
});
test('exports capture current drafts without a server upload', () => {
    for (const kind of ['home', 'library']) {
        const win = page(kind);
        let blob;
        win.URL.createObjectURL = value => { blob = value; return 'blob:test'; };
        win.URL.revokeObjectURL = () => {};
        let download;
        win.HTMLAnchorElement.prototype.click = function () { download = this.download; };
        click(win, kind === 'home' ? 'exportDraftBtn' : 'exportNotes');
        assert.ok(blob instanceof win.Blob);
        assert.match(download, /draft\.txt$/);
        win.close();
    }
});
test('public output excludes the private library and internal files', () => {
    assert.equal(JSON.parse(fs.readFileSync('vercel.json')).outputDirectory, 'public');
    assert.deepEqual(fs.readdirSync('public').sort(), ['index.html', 'site.js']);
    assert.ok(!fs.readFileSync('public/index.html', 'utf8').includes('LIBRARY_URL'));
});
