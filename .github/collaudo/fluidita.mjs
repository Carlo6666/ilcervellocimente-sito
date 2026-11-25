// Diagnosi fluidità 25/11/2026: telefono simulato (Pixel 7, CPU rallentata 4x) e reti diverse.
// Misura sul video reale: blocchi per buffering (evento waiting), pause visibili tra fotogrammi
// mostrati (requestVideoFrameCallback, intervallo > 120 ms) e fotogrammi persi.
import {chromium, devices} from 'playwright';
const SITES = JSON.parse(process.env.SITI);
const NETS = {
  'senza limiti': null,
  '4G medio (4 Mbit/s, 70 ms)': {latency: 70, downloadThroughput: 4e6 / 8, uploadThroughput: 1e6 / 8},
  '4G debole (1,6 Mbit/s, 150 ms)': {latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 0.75e6 / 8},
};
const VIDEOS = [['presentazione IT', '.hero-video-wrap > .big-play', '.hero-video-wrap', 'it'], ['presentazione EN', '.hero-video-wrap > .big-play', '.hero-video-wrap', 'en']];
const SECONDS = +process.env.SECONDI || 40;
const br = await chromium.launch({headless: true, channel: 'chrome'});
const rows = [];
for (const [siteName, base] of Object.entries(SITES)) for (const [netName, net] of Object.entries(NETS)) for (const [vName, btn, host, lang] of VIDEOS) {
  const ctx = await br.newContext({...devices['Pixel 7']});
  const p = await ctx.newPage();
  await p.route('**/*', r => { const u = r.request().url(); return (u.startsWith('http://127.0.0.1') || u.includes('ilcervellocimente.com')) ? r.continue() : r.abort(); });
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});
  await p.goto(base + '?lang=' + lang + '&v=' + Date.now(), {waitUntil: 'load'});
  await p.evaluate(() => { try { localStorage.setItem('icc_metricool_consent_v1', 'no'); } catch (e) {} });
  if (net) { await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', {offline: false, ...net}); }
  await p.locator(btn).evaluate(e => e.scrollIntoView({block: 'center', behavior: 'instant'}));
  await p.locator(btn).click();
  const sel = host + ' > #video-inline video';
  await p.locator(sel).waitFor();
  const m = await p.locator(sel).evaluate((v, secs) => new Promise(res => {
    const t0 = performance.now(); let first = null, waits = 0, waitStart = null, waitMs = 0, last = null, gaps = [], frames = 0;
    v.addEventListener('waiting', () => { waits++; waitStart = performance.now(); });
    v.addEventListener('playing', () => { if (first === null) first = performance.now() - t0; if (waitStart) { waitMs += performance.now() - waitStart; waitStart = null; } });
    const cb = (now, md) => { frames++; if (last !== null && waitStart === null) { const g = now - last; if (g > 120) gaps.push(Math.round(g)); } last = now; v.requestVideoFrameCallback(cb); };
    v.requestVideoFrameCallback(cb);
    setTimeout(() => { if (waitStart) waitMs += performance.now() - waitStart; const q = v.getVideoPlaybackQuality();
      res({avvio_ms: first && Math.round(first), secondi_riprodotti: +v.currentTime.toFixed(1), blocchi_buffering: waits, ms_in_blocco: Math.round(waitMs), pause_visibili_120ms: gaps.length, pausa_max_ms: gaps.length ? Math.max(...gaps) : 0, fotogrammi_mostrati: frames, fotogrammi_persi: q.droppedVideoFrames, fotogrammi_totali: q.totalVideoFrames}); }, secs * 1000);
  }), SECONDS);
  rows.push({sito: siteName, rete: netName, video: vName, ...m});
  console.log('RIGA', JSON.stringify(rows.at(-1)));
  await ctx.close();
}
await br.close();
