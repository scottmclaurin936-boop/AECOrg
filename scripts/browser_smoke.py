#!/usr/bin/env python3
"""Local Chromium render/interaction QA without opening blocked file/http URLs.

Inline CSS/JS into page.set_content. This tests layout and local interactions,
not server routing, authentication, or real deployment behavior.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import sys
ROOT=Path(__file__).resolve().parents[1]
CSS=(ROOT/'shared/style.css').read_text()
JS=(ROOT/'shared/app.js').read_text()
PREVIEWS=ROOT/'previews';PREVIEWS.mkdir(exist_ok=True)
PAGES=['review.html','org/index.html','org/creators.html','org/projects.html','org/project-record.html','com/index.html','com/production-record.html','com/workflow.html']
WIDTHS=[360,390,768,1280]
errors=[];checked=0

def inline(page_path):
    text=(ROOT/page_path).read_text()
    css_path='shared/style.css' if page_path=='review.html' else '../shared/style.css'
    text=text.replace(f'<link rel="stylesheet" href="{css_path}">','<style>'+CSS+'</style>')
    text=text.replace('<script src="../shared/app.js" defer></script>','<script>'+JS+'</script>')
    return text

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for page_path in PAGES:
        for width in WIDTHS:
            page=browser.new_page(viewport={'width':width,'height':850},device_scale_factor=1)
            page_errors=[];page.on('pageerror',lambda e:page_errors.append(str(e)))
            try:
                page.set_content(inline(page_path),wait_until='load')
                page.wait_for_timeout(80)
                overflow=page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
                if overflow>1: errors.append(f'{page_path} {width}px: horizontal overflow {overflow}px')
                if page.locator('h1').count()!=1: errors.append(f'{page_path} {width}px: invalid h1 count')
                if page_errors: errors.append(f'{page_path} {width}px: JS error {page_errors}')
                if page_path!='review.html':
                    mobile=page.locator('.mobile-nav')
                    if width<=1000:
                        if not mobile.is_visible(): errors.append(f'{page_path} {width}px: mobile nav hidden')
                        else:
                            mobile.locator('summary').click()
                            if not page.locator('.mobile-nav').get_attribute('open')=='': errors.append(f'{page_path} {width}px: mobile nav not opened')
                            mobile.locator('summary').press('Escape')
                            if page.locator('.mobile-nav').get_attribute('open') is not None: errors.append(f'{page_path} {width}px: Escape did not close menu')
                    else:
                        if not page.locator('.desktop-nav').is_visible(): errors.append(f'{page_path} {width}px: desktop nav hidden')
                if page_path=='org/projects.html':
                    page.get_by_role('button',name='Music').click()
                    if page.locator('[data-category]:visible').count()!=1: errors.append(f'{page_path} {width}px: filter count invalid')
                    if '1 placeholder category' not in page.locator('#filter-status').inner_text(): errors.append(f'{page_path} {width}px: live status invalid')
                    page.get_by_role('button',name='All',exact=True).click()
                    if page.locator('[data-category]:visible').count()!=4: errors.append(f'{page_path} {width}px: reset filter invalid')
                    page.locator('#project-search').fill('podcast')
                    if page.locator('[data-category]:visible').count()!=1: errors.append(f'{page_path} {width}px: search result count invalid')
                    page.locator('#project-search').fill('zzzz')
                    if not page.locator('#no-results').is_visible(): errors.append(f'{page_path} {width}px: empty state not visible')
                    page.locator('#project-search').fill('')
                if (page_path,width) in [('org/index.html',390),('org/index.html',1280),('com/index.html',390),('com/index.html',1280),('review.html',390),('org/projects.html',390),('com/workflow.html',390)]:
                    name=page_path.replace('/','-').replace('.html','')+f'-{width}px.png'
                    page.screenshot(path=str(PREVIEWS/name),full_page=True)
                checked+=1
            except Exception as e:
                errors.append(f'{page_path} {width}px: {e}')
            finally: page.close()
    browser.close()
print(f'Browser smoke: {checked}/{len(PAGES)*len(WIDTHS)} page-width combinations; {len(list(PREVIEWS.glob("*.png")))} screenshots.')
if errors:
    print('FAIL:');print('\n'.join(' - '+x for x in errors));sys.exit(1)
print('PASS: no overflow or script errors; responsive navigation and filters work in isolated Chromium rendering.')
