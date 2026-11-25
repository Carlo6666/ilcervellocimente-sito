// Verifica sul sito pubblico, 25/11/2026: cinque lingue, due video distinti, riproduzione reale.
import {chromium, webkit, devices} from 'playwright';
const B = 'https://www.ilcervellocimente.com/';
let bad = 0;
for (const [name, eng, opt, dev] of [['chrome-android', chromium, {channel: 'chrome'}, devices['Pixel 7']], ['iphone-webkit', webkit, {}, devices['iPhone 14']]]) {
  const br = await eng.launch({headless: true, ...opt});
  for (const lang of ['it', 'en', 'fr', 'es', 'de']) {
    const ctx = await br.newContext({...dev}); const p = await ctx.newPage();
    await p.route('**/*', r => /ilcervellocimente\.com/.test(r.request().url()) ? r.continue() : r.abort());
    await p.goto(B + '?lang=' + lang + '&v=' + Date.now(), {waitUntil: 'load'});
    const play = async sel => { await p.locator(sel).evaluate(e => e.scrollIntoView({block: 'center', behavior: 'instant'})); await p.locator(sel).click(); };
    const wait = async (host, s) => { for (let i = 0; i < 120; i++) { const t = await p.locator(host + ' > #video-inline video').evaluate(v => v.currentTime).catch(() => 0); if (t >= s) return t; await new Promise(r => setTimeout(r, 250)); } return 0; };
    await play('.hero-video-wrap > .big-play');
    const a = await p.locator('.hero-video-wrap > #video-inline video').getAttribute('src');
    const ta = await wait('.hero-video-wrap', 4);
    await play('.featured-media > .big-play');
    const b = await p.locator('.featured-media > #video-inline video, .featured-media > #video-inline iframe').first().getAttribute('src');
    const tb = lang === 'it' ? null : await wait('.featured-media', 3);
    const ok = a === 'assets/video/nora-presentazione-' + lang + '-v3.mp4' && ta >= 4 && (lang === 'it' ? b.includes('youtube-nocookie.com/embed/JBoI3e8VW2g') : b === 'assets/video/puntata-0-' + lang + '.mp4' && tb >= 3);
    if (!ok) bad++;
    console.log(name, lang, ok ? 'SUPERATO' : 'NON SUPERATO', JSON.stringify({presentazione: a, secondi: ta, puntata0: b, secondi_p0: tb}));
    await ctx.close();
  }
  await br.close();
}
process.exitCode = bad ? 1 : 0;
