(() => {
    'use strict';
    const draftKey = 'aec-homepage-draft-v1';
    const themeKey = 'aec-theme-v1';
    const fields = [...document.querySelectorAll('[data-field]')];
    const originals = new Map(fields.map(el => [el.dataset.field, el.textContent]));
    const status = document.getElementById('draftStatus');
    const editButton = document.getElementById('editToggleBtn');
    const themeButton = document.getElementById('themeToggleBtn');
    let editing = false;
    function message(text) { status.textContent = text; }
    function values() {
        return Object.fromEntries(fields.map(el => [el.dataset.field, el.textContent]));
    }
    function save() {
        try {
            localStorage.setItem(draftKey, JSON.stringify(values()));
            message('Draft saved in this browser only. The published website is unchanged.');
        } catch {
            message('Browser storage is unavailable or full. Export your draft now to keep a copy.');
        }
    }
    function showTheme(theme) {
        document.documentElement.dataset.theme = theme;
        themeButton.textContent = theme === 'light' ? 'Switch to Brown Mode' : 'Switch to Light Mode';
        themeButton.setAttribute('aria-pressed', String(theme === 'light'));
    }
    try {
        const theme = localStorage.getItem(themeKey);
        if (theme === 'light' || theme === 'brown') showTheme(theme);
    } catch { /* The default theme still works without storage. */ }
    try {
        const stored = localStorage.getItem(draftKey);
        if (stored) {
            const draft = JSON.parse(stored);
            if (!draft || typeof draft !== 'object' || Array.isArray(draft)) throw new Error('Invalid draft');
            fields.forEach(el => {
                if (Object.hasOwn(draft, el.dataset.field) && typeof draft[el.dataset.field] === 'string') {
                    el.textContent = draft[el.dataset.field];
                }
            });
            message('Loaded your local draft. Other visitors still see the published website.');
        }
    } catch {
        message('Could not load a saved draft. The published text is shown; your saved data has not been deleted.');
    }
    themeButton.addEventListener('click', () => {
        const theme = document.documentElement.dataset.theme === 'brown' ? 'light' : 'brown';
        showTheme(theme);
        try { localStorage.setItem(themeKey, theme); } catch { /* Theme applies for this visit. */ }
    });
    editButton.addEventListener('click', () => {
        editing = !editing;
        document.body.classList.toggle('editable-active', editing);
        editButton.classList.toggle('active', editing);
        editButton.setAttribute('aria-pressed', String(editing));
        editButton.textContent = editing ? 'Save / Lock Local Draft' : 'Edit Local Draft';
        fields.forEach(el => {
            el.contentEditable = editing ? 'plaintext-only' : 'false';
            if (editing) el.setAttribute('tabindex', '0');
            else el.removeAttribute('tabindex');
        });
        if (!editing) save();
        else message('Editing a personal browser draft. Changes save locally as you type.');
    });
    fields.forEach(el => {
        el.addEventListener('input', () => { if (editing) save(); });
        // Keep pasted content as text, including in browsers without plaintext-only support.
        el.addEventListener('paste', event => {
            if (!editing) return;
            event.preventDefault();
            const text = event.clipboardData?.getData('text/plain');
            if (typeof text !== 'string') return;
            const selection = window.getSelection();
            if (!selection?.rangeCount) return;
            const range = selection.getRangeAt(0);
            if (!el.contains(range.commonAncestorContainer)) return;
            range.deleteContents();
            const node = document.createTextNode(text);
            range.insertNode(node);
            range.setStartAfter(node);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            save();
        });
    });
    document.getElementById('exportDraftBtn').addEventListener('click', () => {
        const text = 'AEC homepage text draft\nNot yet published\n\n' + fields.map(el => el.textContent).join('\n\n');
        const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'aec-homepage-draft.txt';
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        message('Draft export requested. Keep the downloaded file as your backup.');
    });
    document.getElementById('resetDraftBtn').addEventListener('click', () => {
        if (!window.confirm('Discard this browser’s homepage draft and restore the published text? Export first if you need a backup.')) return;
        try { localStorage.removeItem(draftKey); }
        catch { message('Could not remove the saved draft. Nothing has been reset.'); return; }
        fields.forEach(el => { el.textContent = originals.get(el.dataset.field); });
        message('Local draft reset to published text.');
    });
})();
