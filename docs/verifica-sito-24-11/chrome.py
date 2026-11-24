import json
from playwright.sync_api import sync_playwright
BASE='http://localhost:8767'; OUT='/home/claude/work/c2'
IOS='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
AND='Mozilla/5.0 (Linux; Android 14; SM-A145R) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36'
W=[(320,AND),(360,AND),(375,IOS),(390,IOS),(412,AND)]
CHECK='''()=>{const vw=innerWidth,out=[];
 const clipped=e=>{for(let p=e.parentElement;p;p=p.parentElement){const s=getComputedStyle(p);if(/(hidden|clip|auto|scroll)/.test(s.overflowX))return true}return false};
 document.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&r.right>vw+1&&getComputedStyle(e).position!=='fixed'&&!clipped(e)&&e.offsetParent!==null)out.push((e.id?'#'+e.id:e.tagName.toLowerCase()+'.'+[...e.classList].join('.'))+' →'+Math.round(r.right))});
 const story=[...document.querySelectorAll('.story-card-center strong,.story-card strong')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent.slice(0,30));
 const mt=document.querySelector('.menu-toggle'), sp=mt&&mt.querySelector('span');
 const small=[...document.querySelectorAll('.language-select,.cover-controls button,.modal-close,.footer-privacy-btn,.footer-right a,.menu-toggle')].filter(e=>e.offsetParent).map(e=>[e.className||e.tagName,Math.round(e.getBoundingClientRect().height)]).filter(x=>x[1]<44);
 const st=document.querySelector('.book-stamp'), sr=st&&st.getBoundingClientRect();
 const over=[...document.querySelectorAll('.book-copy p, .book-copy .book-meta, .book-copy *')].filter(e=>{if(!sr||!e.childNodes.length)return false;const r=e.getBoundingClientRect();return r.width&&!(r.right<sr.left||r.left>sr.right||r.bottom<sr.top||r.top>sr.bottom)}).map(e=>e.tagName+':'+e.textContent.slice(0,25));
 const ban=document.querySelector('#consent'), br=ban&&!ban.hidden?ban.getBoundingClientRect():null;
 return {scrollW:document.documentElement.scrollWidth,vw,offenders:out.slice(0,8),storyOverflow:story,menuColor:sp&&getComputedStyle(sp).backgroundColor,menuBorder:mt&&getComputedStyle(mt).borderTopColor,menuSize:mt&&[mt.offsetWidth,mt.offsetHeight],small,stampOverlap:over.slice(0,4),banner:br&&[Math.round(br.left),Math.round(br.right)],dur:document.querySelector('#episode-zero-duration')?.textContent,h1:document.querySelector('#hero-title').innerText.replace(/\\n/g,' ')}}'''
rep=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome')
    for w,ua in W:
        for l in ['it','en','fr','es','de']:
            c=b.new_context(viewport={'width':w,'height':780},device_scale_factor=2,is_mobile=True,has_touch=True,user_agent=ua)
            pg=c.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
            pg.goto(f'{BASE}/?lang={l}'); pg.wait_for_timeout(500)
            r0=pg.evaluate(CHECK)  # con banner
            if w==320 and l=='de': pg.screenshot(path=f'{OUT}/chrome-320-de-banner.jpg',type='jpeg',quality=80)
            pg.click('.consent-no'); pg.evaluate('document.querySelector(".cover-anim").scrollIntoView({block:"center"})'); pg.wait_for_timeout(500)
            r=pg.evaluate(CHECK); r['banner']=r0['banner']; r['errs']=errs; r['w']=w; r['lang']=l
            # menu mobile
            pg.evaluate('scrollTo(0,0)'); pg.wait_for_timeout(200)
            pg.tap('.menu-toggle'); pg.wait_for_timeout(400)
            menu=pg.evaluate('''()=>{const m=document.querySelector('#mobile-menu,.mobile-menu');const s=m&&getComputedStyle(m);return {visible:!!m&&s.display!=='none'&&s.visibility!=='hidden'&&m.getBoundingClientRect().height>50,links:m?[...m.querySelectorAll('a')].map(a=>a.getAttribute('href')):[]}}''')
            if w==360 and l=='de': pg.screenshot(path=f'{OUT}/chrome-360-de-menu-aperto.jpg',type='jpeg',quality=80)
            tgt=menu['links'][2] if len(menu['links'])>2 else None
            if tgt:
                pg.tap(f'.mobile-menu a[href="{tgt}"], #mobile-menu a[href="{tgt}"]'); pg.wait_for_timeout(900)
                menu['after']=pg.evaluate(f'''()=>{{const m=document.querySelector('#mobile-menu,.mobile-menu');const s=getComputedStyle(m);const t=document.querySelector('{tgt}').getBoundingClientRect().top;return {{closed:s.display==='none'||s.visibility==='hidden'||m.getBoundingClientRect().height<5||m.hidden,targetTop:Math.round(t)}}}}''')
            r['menu']=menu
            rep.append(r)
            if w in (320,360,375) and l in ('de','it'):
                pg.evaluate('document.querySelector("#stories,.stories-heading")?.scrollIntoView()'); pg.wait_for_timeout(400)
                pg.screenshot(path=f'{OUT}/chrome-{w}-{l}-storie.jpg',type='jpeg',quality=80)
                pg.evaluate('document.querySelector("#libro").scrollIntoView()'); pg.wait_for_timeout(300)
                pg.screenshot(path=f'{OUT}/chrome-{w}-{l}-libro.jpg',type='jpeg',quality=80,full_page=False)
            c.close()
    b.close()
json.dump(rep,open(f'{OUT}/chrome.json','w'),indent=1,ensure_ascii=False)
for r in rep:
    print(r['w'],r['lang'],'sW',r['scrollW'],'off',r['offenders'][:3],'story',r['storyOverflow'],'ban',r['banner'],'small',r['small'],'stamp',r['stampOverlap'],'dur',r['dur'],'menu',r['menu'].get('visible'),r['menu'].get('after'),'err',len(r['errs']))
print('menu colore',rep[0]['menuColor'],rep[0]['menuBorder'],rep[0]['menuSize'])
