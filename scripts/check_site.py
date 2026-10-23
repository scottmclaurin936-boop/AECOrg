#!/usr/bin/env python3
"""Offline prototype guardrails. Python standard library only."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import json, sys
ROOT=Path(__file__).resolve().parents[1]

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.ids=set(); self.titles=0; self.main=0; self.h1=0; self.robots=False; self.viewport=False; self.lang=False
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='html' and a.get('lang'): self.lang=True
        if tag=='title': self.titles+=1
        if tag=='main': self.main+=1
        if tag=='h1': self.h1+=1
        if tag=='meta' and a.get('name')=='robots' and 'noindex' in a.get('content',''): self.robots=True
        if tag=='meta' and a.get('name')=='viewport': self.viewport=True
        if 'id' in a: self.ids.add(a['id'])
        if tag in ('a','link','script','img'):
            key={'a':'href','link':'href','script':'src','img':'src'}[tag]
            if key in a: self.links.append((tag,a[key]))

errors=[]
html_pages=sorted(ROOT.glob('*/*.html'))+sorted(ROOT.glob('*.html'))
for p in html_pages:
    if not p.exists(): errors.append(f'Missing {p.relative_to(ROOT)}'); continue
    parser=PageParser(); parser.feed(p.read_text(encoding='utf-8'))
    for key,ok in [('language',parser.lang),('viewport',parser.viewport),('title',parser.titles==1),('one main',parser.main==1),('one h1',parser.h1==1),('noindex',parser.robots),('skip target','main' in parser.ids)]:
        if not ok: errors.append(f'{p.relative_to(ROOT)}: missing/invalid {key}')
    for tag,ref in parser.links:
        if ref.startswith(('mailto:','tel:','data:','javascript:')):
            errors.append(f'{p.relative_to(ROOT)}: disallowed non-local link {ref}'); continue
        u=urlparse(ref)
        if u.scheme or u.netloc:
            errors.append(f'{p.relative_to(ROOT)}: external link requires approval: {ref}'); continue
        if u.path:
            target=(p.parent/unquote(u.path)).resolve()
            if not target.is_relative_to(ROOT.resolve()) or not target.is_file():
                errors.append(f'{p.relative_to(ROOT)}: broken path {ref}')
            if p.parent.name in ('org','com') and u.path.endswith('.html') and target.parent!=p.parent.resolve():
                errors.append(f'{p.relative_to(ROOT)}: cross-surface page link {ref}')
        elif u.fragment and u.fragment not in parser.ids:
            errors.append(f'{p.relative_to(ROOT)}: broken local anchor {ref}')

manifest=json.loads((ROOT/'content/asset-manifest.json').read_text())
if manifest.get('assets') or manifest.get('approved_public_entries'): errors.append('manifest unexpectedly contains public assets/entries')
page_map=json.loads((ROOT/'content/page-map.json').read_text())
if page_map['status']!='unapproved_offline_review': errors.append('invalid review state')
if page_map['peak_irony']['integrated'] is not False: errors.append('Peak Irony integration not authorized')
if (ROOT/'peak-irony').exists(): errors.append('Peak Irony code must remain separate')
config=json.loads((ROOT/'content/site-config.json').read_text())
if config['academy']['membership']['mode']!='application_review' or config['academy']['membership']['applications_open'] or config['academy']['membership']['allow_public_signup']: errors.append('membership mode or opening gate changed')
if config['production']['inquiries_open'] or config['publication']['deploy_authorized'] or config['peak_irony']['integrated']: errors.append('draft-only publication gates changed')
for path in ['org/apply.html','com/production-inquiry.html']:
    if 'action=' in (ROOT/path).read_text().lower(): errors.append(f'{path}: form has an action endpoint')
for key in ['academy_org','production_com']:
    for path in page_map[key]['pages']:
        if not (ROOT/path).is_file(): errors.append(f'page map points to missing page: {path}')
for p in list((ROOT/'org').glob('*.html'))+list((ROOT/'com').glob('*.html')):
    s=p.read_text().lower()
    if 'brown-and-gold' in s:
        errors.append(f'{p.relative_to(ROOT)}: forbidden legacy/magazine reference')
print(f'Checked {len(html_pages)} HTML pages, local links, surface isolation, and empty-public-content gates.')
if errors:
    print('FAILED:');print('\n'.join(' - '+x for x in errors));sys.exit(1)
print('PASS: structural and publication-boundary checks passed. No authorization to deploy.')
