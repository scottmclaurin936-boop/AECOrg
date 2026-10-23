#!/usr/bin/env python3
"""October 21 review tooling static checks (standard library; no network)."""
from pathlib import Path
import json,subprocess,re
ROOT=Path(__file__).resolve().parents[1]
idx=json.loads((ROOT/'content/review-page-index.json').read_text())
assert idx['status']=='unapproved_offline_review'
assert len(idx['pages'])==16
assert len({p['path'] for p in idx['pages']})==16
for p in idx['pages']:
    assert p['path'].startswith(('org/','com/'))
    assert (ROOT/p['path']).is_file(),p
embedded=(ROOT/'shared/review-desk.js').read_text()
assert 'fetch(' not in embedded
assert 'iframe' not in (ROOT/'shared/asset-audit.js').read_text()
assert 'file.files[0].text()' in (ROOT/'shared/asset-audit.js').read_text()
assert 'Peak Irony is separate' in (ROOT/'shared/asset-audit.js').read_text()
for name in ['review-desk.html','asset-audit.html']:
    s=(ROOT/name).read_text()
    assert 'noindex,nofollow' in s
    assert '<main id="main">' in s
    assert 'http://' not in s and 'https://' not in s
for js in (ROOT/'shared').glob('*.js'):
    subprocess.run(['node','--check',str(js)],check=True,capture_output=True)
assert all(not p['path'].startswith('peak') for p in idx['pages'])
print('PASS: 16 distinct local routes, review-only metadata, JS syntax, no external URLs, and magazine boundary.')
