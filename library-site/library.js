(() => {
    'use strict';
    const key = 'aec-private-library-note-v1';
    const notes = document.getElementById('privateNotes');
    const status = document.getElementById('noteStatus');
    try {
        notes.value = localStorage.getItem(key) || '';
        status.textContent = notes.value ? 'Loaded your draft from this browser.' : 'No browser draft yet.';
    } catch {
        status.textContent = 'Browser storage is unavailable. Export your draft before leaving.';
    }
    function save() {
        try {
            localStorage.setItem(key, notes.value);
            status.textContent = 'Saved in this browser only. Export a backup to keep it elsewhere.';
        } catch {
            status.textContent = 'Could not save locally. Export your draft now to keep a copy.';
        }
    }
    notes.addEventListener('input', save);
    document.getElementById('saveNotes').addEventListener('click', save);
    document.getElementById('exportNotes').addEventListener('click', () => {
        const url = URL.createObjectURL(new Blob([notes.value], { type: 'text/plain;charset=utf-8' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'aec-library-draft.txt';
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        status.textContent = 'Draft export requested. Keep the downloaded file as your backup.';
    });
    document.getElementById('clearNotes').addEventListener('click', () => {
        if (!window.confirm('Delete this browser’s library draft? Export a backup first if you need it.')) return;
        try { localStorage.removeItem(key); }
        catch { status.textContent = 'Could not clear storage. Your note has not been changed.'; return; }
        notes.value = '';
        status.textContent = 'Browser draft cleared.';
    });
})();
