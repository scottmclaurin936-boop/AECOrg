#!/usr/bin/env python3
"""Standard-library checks for the AEC offline draft content registry.

Reject any public visibility or populated asset manifest. This intentionally
blocks publication until a future, separately approved release workflow exists.
"""
import json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
errors=[]
manifest=json.loads((ROOT/'content/asset-manifest.json').read_text())
if manifest.get('publication_state')!='unapproved_preview': errors.append('Asset manifest is not in preview state')
if manifest.get('assets') or manifest.get('approved_public_entries'): errors.append('Nonempty public assets/entries require a separate approved build')
records=list((ROOT/'content').glob('*.draft.json'))
seen=set()
for p in records:
    d=json.loads(p.read_text())
    for field in ['id','surface','title','category','visibility','approval','assets','credits']:
        if field not in d: errors.append(f'{p.name}: missing {field}')
    if d.get('id') in seen: errors.append(f'{p.name}: duplicate id')
    seen.add(d.get('id'))
    if d.get('surface') not in ('academy_org','production_com'): errors.append(f'{p.name}: unknown surface')
    if d.get('visibility') not in ('draft','review'): errors.append(f'{p.name}: publication blocked')
    if d.get('assets'): errors.append(f'{p.name}: assets not allowed in example drafts')
    approval=d.get('approval',{})
    if approval.get('approved_by') or approval.get('approved_at') or approval.get('rights_verified'):
        errors.append(f'{p.name}: unexpected approval in example draft')
    if any(x in p.read_text().lower() for x in ('https://peakirony.com','http://peakirony.com')):
        errors.append(f'{p.name}: unapproved Peak Irony routing')
print(f'Checked {len(records)} draft content records, approval state, and empty asset registry.')
if errors:
    print('FAILED:'); print('\n'.join(' - '+e for e in errors)); sys.exit(1)
print('PASS: no approved public records or assets; publication remains blocked.')
