// Avvio della riproduzione su WebKit (iPhone 14 e desktop), ripetuto: varianti di codifica a confronto.
import {webkit, chromium, devices} from 'playwright';
import fs from 'node:fs';
const VARIANTI = process.env.VARIANTI.split(',');
const REP = +process.env.RIPETIZIONI || 3;
const out = {};
fs.writeFileSync('prova/pagina.html', '<!doctype html><meta name=viewport content="width=device-width"><body style="margin:0;background:#000"><video id=v playsinline controls preload=auto style="width:100%;height:90vh"></video><button id=b style="position:fixed;top:10px;left:10px;width:80px;height:80px">play</button><script>b.onclick=()=>{v.play()};v.src=new URLSearchParams(location.search).get("f")</script>');
for (const [nome, eng, opt] of [['webkit-iphone14', webkit, {...devices['iPhone 14']}], ['webkit-desktop', webkit, {viewport: {width: 1280, height: 800}}], ['chrome-android', chromium, {...devices['Pixel 7']}]]) {
  const br = await eng.launch({headless: true, ...(eng === chromium ? {channel: 'chrome'} : {})});
  for (const v of VARIANTI) for (const l of ['it', 'en', 'fr', 'es', 'de']) for (let r = 0; r < REP; r++) {
    const ctx = await br.newContext(opt); const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:8780/pagina.html?f=' + v + '/nora-presentazione-' + l + '.mp4&r=' + r);
    await p.locator('#b').click();
    let t = 0; const t0 = Date.now();
    while (Date.now() - t0 < 30000) { t = await p.locator('#v').evaluate(x => x.currentTime); if (t >= 5) break; await new Promise(z => setTimeout(z, 250)); }
    const k = nome + ' ' + v; out[k] = out[k] || {ok: 0, ko: 0, fermi: []};
    if (t >= 5) out[k].ok++; else { out[k].ko++; out[k].fermi.push(l + '#' + r + ' t=' + t.toFixed(2)); }
    await ctx.close();
  }
  await br.close();
}
for (const [k, v] of Object.entries(out)) console.log('AVVIO', k, 'ok', v.ok, 'fermi', v.ko, v.fermi.join(' '));
