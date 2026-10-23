#!/usr/bin/env python3
"""Offline draft-workbench regression checks; no network or live site access."""
from pathlib import Path
import json,hashlib,subprocess
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'project-workbench.html').read_text()
js=(ROOT/'shared/project-workbench.js').read_text()
review=(ROOT/'review.html').read_text()
assert '<main id="main">' in html and 'noindex,nofollow' in html
assert 'project-workbench.html' in review
assert 'http://' not in html and 'https://' not in html
for forbidden in ('fetch(', 'XMLHttpRequest', 'localStorage', 'sendBeacon', 'window.location=', 'approved_public:'):
    assert forbidden not in js, forbidden
assert 'f.visibility.value=\'draft\'' in js
assert 'approved_by:null,approved_at:null,rights_verified:false' in js
assert not (ROOT/'peak-irony').exists()
page_map=json.loads((ROOT/'content/page-map.json').read_text())
assert page_map['review_tools'][-1]=='project-workbench.html'
assert page_map['peak_irony']['integrated'] is False
before=json.loads((ROOT/'content/oct21-public-tree-hashes.json').read_text())
# The visual editor was added to all concept pages after the original workbench
# hashes were recorded. Validate the documented script-only change, while
# keeping the original public page markup otherwise byte-for-byte identical.
for path,hash_before in before.items():
    html_page=(ROOT/path).read_text()
    editor_tag='<script src="../shared/visual-editor.js" defer></script>'
    assert html_page.count(editor_tag)==1, f'Visual editor missing or duplicated: {path}'
    original=html_page.replace(editor_tag, '')
    assert hashlib.sha256(original.encode()).hexdigest()==hash_before, f'Concept page changed unexpectedly: {path}'
subprocess.run(['node','--check',str(ROOT/'shared/project-workbench.js')],check=True)
subprocess.run(['node',str(ROOT/'scripts/test_project_workbench.js')],check=True)
print(f'PASS: {len(before)} Academy/production page baselines preserved apart from the visual-editor script; workbench and boundaries validated.')
