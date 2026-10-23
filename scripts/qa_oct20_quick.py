#!/usr/bin/env python3
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,sys
R=Path(__file__).resolve().parents[1]
CSS=(R/'shared/style.css').read_text(); APP=(R/'shared/app.js').read_text(); CONTROL=(R/'shared/review-controls.js').read_text()
def load(page,path):
 s=(R/path).read_text()
 if '/' in path:
  s=s.replace('<link rel="stylesheet" href="../shared/style.css">','<style>'+CSS+'</style>').replace('<script src="../shared/app.js" defer></script>','<script>'+APP+'</script>')
 else:
  s=s.replace('<link rel="stylesheet" href="shared/style.css">','<style>'+CSS+'</style>').replace('<script src="shared/review-controls.js" defer></script>','<script>'+CONTROL+'</script>')
 page.set_content(s,wait_until='load',timeout=10000)
errors=[]; tested=0
pages=['org/index.html','org/membership.html','org/apply.html','org/site-map.html','com/index.html','com/production-inquiry.html','com/site-map.html','review-controls.html']
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for name in pages:
  for width in [390,1280]:
   page=b.new_page(viewport={'width':width,'height':850},accept_downloads=True)
   js=[];page.on('pageerror',lambda e:js.append(str(e)))
   try:
    load(page,name)
    overflow=page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
    if overflow>1:errors.append(f'{name} {width}px overflow {overflow}')
    if js:errors.append(f'{name} {width}px JS {js}')
    if '/' in name:
     nav=page.locator('.mobile-nav' if width<1200 else '.desktop-nav')
     if not nav.is_visible():errors.append(f'{name} {width}px nav hidden')
     if width<1200:
      nav.locator('summary').click(timeout=4000)
      if not nav.locator('a').first.is_visible():errors.append(f'{name} mobile menu failed')
      page.keyboard.press('Escape')
      if nav.get_attribute('open') is not None:errors.append(f'{name} menu Escape failed')
    if width==390 and name in ['org/membership.html','org/apply.html','com/production-inquiry.html','review-controls.html']:
     page.screenshot(path=str(R/'previews'/('new-'+name.replace('/','-').replace('.html','')+'-390px.png')),full_page=True,timeout=10000)
    tested+=1
   except Exception as e:errors.append(f'{name} {width}px {e}')
   finally:page.close()
 # application preview
 page=b.new_page();load(page,'org/apply.html');page.locator('#app-name').fill('Sample Creator');page.locator('#app-interest').select_option(label='Music');page.locator('#app-note').fill('Sample fictional song');page.get_by_role('button',name='Preview review summary').click();out=page.locator('#application-result').inner_text();
 if 'Sample Creator' not in out or 'not submitted' not in out:errors.append('application preview failed')
 page.close()
 # production preview
 page=b.new_page();load(page,'com/production-inquiry.html');page.locator('#brief-title').fill('Sample film');page.locator('#brief-type').select_option(label='Film & Screen');page.locator('#brief-scope').fill('Sample clip');page.get_by_role('button',name='Preview production brief').click();
 if 'Sample film' not in page.locator('#brief-result').inner_text():errors.append('production preview failed')
 page.close()
 # config download
 page=b.new_page(accept_downloads=True);load(page,'review-controls.html');page.locator('#setting-hero').fill('New local heading');
 with page.expect_download(timeout=8000) as download_info:page.get_by_role('button',name='Download proposed JSON').click()
 file=R/'docs'/'_qa_download.json';download_info.value.save_as(file);cfg=json.loads(file.read_text());file.unlink();
 if cfg['academy']['home_hero_heading']!='New local heading' or cfg['academy']['membership']['allow_public_signup'] or cfg['publication']['deploy_authorized']:errors.append('config export failed')
 page.close();b.close()
print(f'Browser QA: {tested}/{len(pages)*2} responsive checks + 3 interactive workflows; {len(errors)} errors.')
if errors:print('\n'.join(errors));sys.exit(1)
print('PASS: navigation, form previews, editable JSON export, mobile/desktop layout.')
