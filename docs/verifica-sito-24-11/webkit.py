"""Prove reali sul motore WebKit (WebKitGTK 2.52, MiniBrowser) con Selenium. Non è Safari iOS."""
import json, time, sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.webkitgtk.options import Options

BASE = 'http://localhost:8767'
STATE = '''return (()=>{const errs=window.__errs||[];
 const svg=document.querySelector('.cover-anim svg');
 const ban=document.querySelector('#consent');
 const r=ban&&!ban.hidden?ban.getBoundingClientRect():null;
 return {ua:navigator.userAgent.slice(0,120),htmlLang:document.documentElement.lang,vw:innerWidth,scrollW:document.documentElement.scrollWidth,
  h1:document.querySelector('#hero-title').innerText.replace(/\\n/g,' '),
  cover:!!svg, coverText:svg?svg.textContent.slice(0,0):'', coverLang:svg?(svg.getAttribute('aria-label')||'').slice(0,40):'',
  banner:r?[Math.round(r.left),Math.round(r.right)]:null,
  dur:(document.querySelector('#episode-zero-duration')||{}).textContent,
  fontsOk:document.fonts?[...document.fonts].filter(f=>f.status==='loaded').length:-1, errs}})()'''


def driver(w, h=800):
    o = Options()
    o.binary_location = '/usr/lib/x86_64-linux-gnu/webkit2gtk-4.1/MiniBrowser'
    o.add_argument('--automation')
    d = webdriver.WebKitGTK(options=o)
    d.set_window_size(w, h)
    return d

out = []
d = driver(375)
try:
    for w in (320, 360, 375, 1280):
        d.set_window_size(w, 800)
        for l in ('it', 'en', 'fr', 'es', 'de'):
            d.get(f'{BASE}/?lang={l}')
            time.sleep(1.2)
            s = d.execute_script(STATE)
            # chiude il banner
            try:
                d.find_element(By.CSS_SELECTOR, '.consent-no').click()
            except Exception as e:
                s['bannerClick'] = str(e)[:80]
            d.execute_script('document.querySelector(".cover-anim").scrollIntoView({block:"center"})')
            time.sleep(8.4)
            s['coverDone'] = d.execute_script('return document.querySelector(".cover-anim").classList.contains("is-done")')
            s['scrollW_after'] = d.execute_script('return document.documentElement.scrollWidth')
            s['w'] = w; s['lang'] = l
            if l in ('de', 'it') and w in (320, 375, 1280):
                d.save_screenshot(f'/home/claude/work/c2/webkit-{w}-{l}-copertina.png')
            # menu mobile (solo larghezze strette)
            if w < 900:
                d.execute_script('scrollTo(0,0)'); time.sleep(0.3)
                d.find_element(By.CSS_SELECTOR, '.menu-toggle').click(); time.sleep(0.5)
                s['menuOpen'] = d.execute_script("const m=document.querySelector('#mobile-menu,.mobile-menu');const st=getComputedStyle(m);return st.display!=='none'&&st.visibility!=='hidden'&&m.getBoundingClientRect().height>50")
                links = d.find_elements(By.CSS_SELECTOR, '#mobile-menu a, .mobile-menu a')
                if len(links) > 2:
                    links[2].click(); time.sleep(1)
                    s['menuClosedAfter'] = d.execute_script("const m=document.querySelector('#mobile-menu,.mobile-menu');const st=getComputedStyle(m);return st.display==='none'||st.visibility==='hidden'||m.getBoundingClientRect().height<5||m.hidden")
            # video: un solo clic sul pulsante
            d.execute_script('scrollTo(0,0)')
            d.execute_script("document.querySelector('.big-play').scrollIntoView({block:'center'})"); time.sleep(0.4)
            d.find_element(By.CSS_SELECTOR, '.big-play').click(); time.sleep(3)
            s['video'] = d.execute_script('''const v=document.querySelector('#video-embed').firstElementChild;const a=document.querySelector('#video-direct');
              return {el:v.tagName,src:(v.currentSrc||v.src||'').split('?')[0].split('/').pop(),paused:v.tagName==='VIDEO'?v.paused:null,t:v.tagName==='VIDEO'?+v.currentTime.toFixed(1):null,
              ready:v.readyState,err:v.error?v.error.code:null,link:a.getAttribute('href').split('/').pop().split('?')[0],note:document.querySelector('#video-source-note').textContent.slice(0,40)}''')
            if l == 'de' and w == 375:
                d.save_screenshot('/home/claude/work/c2/webkit-375-de-video.png')
            out.append(s)
            print(w, l, json.dumps({k: s.get(k) for k in ('htmlLang', 'scrollW', 'scrollW_after', 'h1', 'cover', 'coverDone', 'banner', 'dur', 'menuOpen', 'menuClosedAfter', 'video', 'errs')}, ensure_ascii=False), flush=True)
    print('UA:', out[0]['ua'])
finally:
    d.quit()
json.dump(out, open('/home/claude/work/c2/webkit.json', 'w'), indent=1, ensure_ascii=False)
