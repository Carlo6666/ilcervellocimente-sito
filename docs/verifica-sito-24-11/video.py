from playwright.sync_api import sync_playwright
BASE='http://localhost:8767'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--autoplay-policy=no-user-gesture-required'])
    for mode in ['normale']:
        for l in ['it','en','fr','es','de']:
            c=b.new_context(viewport={'width':360,'height':780},is_mobile=True,has_touch=True,device_scale_factor=2)
            pg=c.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
            if mode!='normale': pg.route('**/assets/video/puntata-0-*.mp4',lambda r:r.abort())
            if mode=='senza-locale-e-heygen': pg.route('**/resource2.heygen.ai/**',lambda r:r.abort())
            pg.goto(f'{BASE}/?lang={l}'); pg.wait_for_timeout(300); pg.click('.consent-no')
            pg.tap('.big-play'); pg.wait_for_timeout(2500 if mode=='normale' else 6000)
            r=pg.evaluate('''()=>{const v=document.querySelector('#video-embed').firstElementChild;const d=document.querySelector('#video-direct');return {el:v.tagName,src:(v.currentSrc||v.src||'').split('?')[0].split('/').slice(-2).join('/'),playing:v.tagName==='VIDEO'?!v.paused:null,t:v.currentTime?+v.currentTime.toFixed(1):null,link:d.getAttribute('href').split('?')[0].split('/').slice(-2).join('/'),linkText:d.textContent,note:document.querySelector('#video-source-note').textContent.slice(0,70)}}''')
            if mode=='normale' and l=='de': pg.screenshot(path='chrome-360-de-video.jpg',type='jpeg',quality=80)
            print(mode,l,r,errs); c.close()
    b.close()
