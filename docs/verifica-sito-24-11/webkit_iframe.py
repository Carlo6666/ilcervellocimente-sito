import json, time
from selenium import webdriver
from selenium.webdriver.webkitgtk.options import Options
o=Options(); o.binary_location='/usr/lib/x86_64-linux-gnu/webkit2gtk-4.1/MiniBrowser'; o.add_argument('--automation')
d=webdriver.WebKitGTK(options=o); d.set_window_size(1500,950)
res=[]
try:
  for w in (320,360,375):
    for l in ('it','en','fr','es','de'):
        d.get('http://localhost:8767/robots.txt')
        d.execute_script(f"document.documentElement.innerHTML='<body style=margin:0;background:#888><iframe id=f src=\"/?lang={l}\" style=\"width:{w}px;height:860px;border:0;display:block\"></iframe></body>'")
        time.sleep(2.5)
        r=d.execute_script('''const f=document.getElementById('f').contentWindow, doc=f.document;
          const vw=f.innerWidth; const clipped=e=>{for(let p=e.parentElement;p;p=p.parentElement){const s=f.getComputedStyle(p);if(/(hidden|clip|auto|scroll)/.test(s.overflowX))return true}return false};
          const off=[];doc.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&r.right>vw+1&&f.getComputedStyle(e).position!=='fixed'&&!clipped(e)&&e.offsetParent!==null)off.push((e.className||e.tagName)+'→'+Math.round(r.right))});
          const b=doc.querySelector('#consent'),br=b&&!b.hidden?b.getBoundingClientRect():null;
          return {vw,scrollW:doc.documentElement.scrollWidth,off:off.slice(0,5),banner:br&&[Math.round(br.left),Math.round(br.right)],h1:doc.querySelector('#hero-title').innerText.replace(/\\n/g,' ')}''')
        r['w']=w; r['lang']=l; res.append(r); print(w,l,r,flush=True)
        if l=='de':
            d.save_screenshot(f'/home/claude/work/c2/webkit-iframe-{w}-de-apertura.png')
            d.execute_script("const doc=document.getElementById('f').contentWindow.document;doc.querySelector('.consent-no').click();doc.querySelector('.stories-heading,#stories').scrollIntoView()"); time.sleep(0.8)
            d.save_screenshot(f'/home/claude/work/c2/webkit-iframe-{w}-de-storie.png')
finally: d.quit()
json.dump(res,open('webkit_iframe.json','w'),indent=1,ensure_ascii=False)
