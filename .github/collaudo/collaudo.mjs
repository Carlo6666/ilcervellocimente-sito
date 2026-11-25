// Collaudo pubblicazione multilingue — 25/11/2026 (Claude).
// Sola lettura: nessuna richiesta esterna, nessun credito HeyGen.
import {chromium, firefox, webkit, devices} from 'playwright';
import fs from 'node:fs';
import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';

const NEW = 'http://127.0.0.1:8765/';
const OLD = 'http://127.0.0.1:8766/';
const LANGS = ['it', 'en', 'fr', 'es', 'de'];
const OUT = 'collaudo';
fs.mkdirSync(OUT + '/schermate', {recursive: true});

const configs = [
  {name: 'chrome-desktop', engine: chromium, launch: {channel: 'chrome'}, ctx: {viewport: {width: 1440, height: 900}}},
  {name: 'chrome-android-pixel7', engine: chromium, launch: {channel: 'chrome'}, ctx: {...devices['Pixel 7']}},
  {name: 'webkit-iphone14', engine: webkit, launch: {}, ctx: {...devices['iPhone 14']}},
  {name: 'webkit-desktop', engine: webkit, launch: {}, ctx: {viewport: {width: 1280, height: 800}}},
  {name: 'firefox-desktop', engine: firefox, launch: {}, ctx: {viewport: {width: 1440, height: 900}}},
];

const results = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function localOnly(page) {
  await page.route('**/*', r => r.request().url().startsWith('http://127.0.0.1:') ? r.continue() : r.abort());
}

// Attende la riproduzione reale del video inline; restituisce misure o il motivo del mancato avvio.
async function waitPlayback(page, hostSel, seconds) {
  const sel = hostSel + ' > #video-inline video';
  const t0 = Date.now(); let lastS = null;
  while (Date.now() - t0 < 45000) {
    const s = await page.locator(sel).evaluate(v => ({
      t: v.currentTime, paused: v.paused, err: v.error ? v.error.code : 0, rs: v.readyState,
      dur: v.duration, w: v.videoWidth, h: v.videoHeight, muted: v.muted,
      q: v.getVideoPlaybackQuality ? (({totalVideoFrames, droppedVideoFrames}) => ({totalVideoFrames, droppedVideoFrames}))(v.getVideoPlaybackQuality()) : null,
      audio: (v.webkitAudioDecodedByteCount ?? null) ?? (v.mozHasAudio ?? null),
      h264: v.canPlayType('video/mp4; codecs="avc1.64001F, mp4a.40.2"'),
    })).catch(e => ({fail: String(e)}));
    if (s.fail) return {ok: false, motivo: s.fail};
    lastS = s;
    if (s.err) return {ok: false, motivo: 'errore media ' + s.err + (s.h264 ? '' : ' (H.264 non supportato da questo motore di prova)'), ...s};
    if (s.t >= seconds) return {ok: true, ...s};
    if (s.paused && Date.now() - t0 > 4000) {
      // Alcuni motori headless bloccano l'audio senza gesto reale: segnalarlo, non mascherarlo.
      return {ok: false, motivo: 'video in pausa dopo il clic', ...s};
    }
    await sleep(250);
  }
  return {ok: false, motivo: 'tempo scaduto', ...(lastS || {})};
}

async function playingUnmuted(page) {
  return page.evaluate(() => [...document.querySelectorAll('video')].filter(v => !v.paused && !v.muted).map(v => v.currentSrc.split('/').pop()));
}

async function clickPlay(page, sel) {
  const b = page.locator(sel);
  await b.evaluate(e => e.scrollIntoView({block: 'center', behavior: 'instant'}));
  await sleep(300);
  await b.click();
}

for (const cfg of configs) {
  let browser;
  try { browser = await cfg.engine.launch({headless: true, ...cfg.launch}); }
  catch (e) { results.push({config: cfg.name, lingua: '-', esito: 'NON ESEGUITO', errore: String(e).slice(0, 300)}); continue; }
  for (const [i, lang] of LANGS.entries()) {
    const ctx = await browser.newContext({...cfg.ctx});
    const page = await ctx.newPage();
    await localOnly(page);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const r = {config: cfg.name, lingua: lang, controlli: {}, avvisi: []};
    const check = (k, ok, info) => { r.controlli[k] = {ok: !!ok, ...(info !== undefined ? {info} : {})}; };
    try {
      await page.goto(NEW + '?lang=' + lang, {waitUntil: 'load'});
      check('lingua pagina', await page.evaluate(() => document.documentElement.lang) === lang);

      // 1. Pulsanti Play identici e centrati
      const st = sel => page.locator(sel).evaluate(e => { const c = getComputedStyle(e); const b = e.getBoundingClientRect();
        return {w: Math.round(b.width), h: Math.round(b.height), bg: c.backgroundColor, radius: c.borderRadius, color: c.color, font: c.fontSize, shadow: c.boxShadow, border: c.borderTopWidth}; });
      const hero = await st('.hero-video-wrap > .big-play');
      const feat = await st('.featured-media > .big-play');
      check('play presentazione identico a play Puntata 0', JSON.stringify(hero) === JSON.stringify(feat), {presentazione: hero, puntata0: feat});
      const centre = await page.locator('.hero-video-wrap').evaluate(w => { const a = w.getBoundingClientRect(); const b = w.querySelector('.big-play').getBoundingClientRect();
        return {dx: Math.round((b.left + b.width / 2) - (a.left + a.width / 2)), dy: Math.round((b.top + b.height / 2) - (a.top + a.height / 2))}; });
      check('play presentazione al centro del video', Math.abs(centre.dx) <= 2 && Math.abs(centre.dy) <= 2, centre);
      await page.locator('.hero-video-wrap > .big-play').evaluate(b => b.scrollIntoView({block: 'center', behavior: 'instant'}));
      await sleep(600);
      const onTop = await page.locator('.hero-video-wrap > .big-play').evaluate(b => { const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return {ok: !!e && (e === b || b.contains(e)), sopra: e ? (e.id || e.className || e.tagName) : null}; });
      check('play presentazione cliccabile (non coperto)', onTop.ok, onTop);
      await page.locator('.hero-visual').screenshot({path: `${OUT}/schermate/${cfg.name}-${lang}-presentazione.png`});

      // 2. Presentazione: sorgente nella lingua giusta, riproduzione nella pagina
      await clickPlay(page, '.hero-video-wrap > .big-play');
      const introSrc = await page.locator('.hero-video-wrap > #video-inline video').getAttribute('src');
      check('presentazione: file della lingua', introSrc === 'assets/video/nora-presentazione-' + lang + '-v2.mp4', introSrc);
      check('nessun popup/modale', !(await page.locator('body').evaluate(b => b.classList.contains('modal-open'))) && await page.locator('#video-modal').count() === 0);
      const p1 = await waitPlayback(page, '.hero-video-wrap', 5);
      check('presentazione: riproduzione reale ≥5 s', p1.ok, p1);
      if (p1.ok && p1.q && p1.q.totalVideoFrames > 0) check('presentazione: fotogrammi persi < 5%', p1.q.droppedVideoFrames / p1.q.totalVideoFrames < 0.05, p1.q);
      if (p1.ok) check('presentazione: un solo video con audio in riproduzione', (await playingUnmuted(page)).length === 1, await playingUnmuted(page));
      await page.screenshot({path: `${OUT}/schermate/${cfg.name}-${lang}-presentazione-in-riproduzione.png`});

      // 3. Puntata 0: distinta, nella lingua giusta, ferma la presentazione
      await clickPlay(page, '.featured-media > .big-play');
      const epSel = '.featured-media > #video-inline';
      const epSrc = await page.locator(epSel + ' video, ' + epSel + ' iframe').first().getAttribute('src');
      check('Puntata 0: sorgente della lingua', lang === 'it' ? epSrc.includes('youtube-nocookie.com/embed/JBoI3e8VW2g') : epSrc === 'assets/video/puntata-0-' + lang + '.mp4', epSrc);
      check('Puntata 0 distinta dalla presentazione', epSrc !== introSrc);
      check('presentazione chiusa quando parte la Puntata 0', await page.locator('.hero-video-wrap > #video-inline').count() === 0 && await page.locator('#video-inline').count() === 1);
      if (lang !== 'it') {
        const p2 = await waitPlayback(page, '.featured-media', 3);
        check('Puntata 0: riproduzione reale ≥3 s', p2.ok, p2);
        if (p2.ok) check('Puntata 0: un solo video con audio in riproduzione', (await playingUnmuted(page)).length === 1, await playingUnmuted(page));
      } else r.avvisi.push('Puntata 0 IT: YouTube bloccato di proposito nel collaudo (richieste esterne vietate); verificata solo la sorgente.');
      await page.locator('#inline-stop').click();
      check('chiusura lettore', await page.locator('#video-inline').isHidden());

      // 4. Cambio lingua DURANTE la riproduzione
      const other = LANGS[(i + 1) % LANGS.length];
      await clickPlay(page, '.hero-video-wrap > .big-play');
      await waitPlayback(page, '.hero-video-wrap', 1);
      await page.locator('#language-select').scrollIntoViewIfNeeded();
      await Promise.all([page.waitForEvent('load'), page.locator('#language-select').selectOption(other)]);
      await sleep(800);
      check('cambio lingua durante riproduzione: pagina nella nuova lingua', await page.evaluate(() => document.documentElement.lang) === other && new URL(page.url()).searchParams.get('lang') === other, {lingua: other, url: page.url()});
      check('cambio lingua durante riproduzione: nessun audio residuo', (await playingUnmuted(page)).length === 0, await playingUnmuted(page));
      // 5. DOPO il cambio: entrambi i video nella nuova lingua
      await clickPlay(page, '.hero-video-wrap > .big-play');
      const s3 = await page.locator('.hero-video-wrap > #video-inline video').getAttribute('src');
      check('dopo il cambio: presentazione nella nuova lingua', s3 === 'assets/video/nora-presentazione-' + other + '-v2.mp4', s3);
      await clickPlay(page, '.featured-media > .big-play');
      const s4 = await page.locator(epSel + ' video, ' + epSel + ' iframe').first().getAttribute('src');
      check('dopo il cambio: Puntata 0 nella nuova lingua', other === 'it' ? s4.includes('youtube-nocookie.com') : s4 === 'assets/video/puntata-0-' + other + '.mp4', s4);
      check('nessun errore JavaScript', errors.length === 0, errors);
    } catch (e) { r.errore = String(e).slice(0, 500); }
    const fails = Object.entries(r.controlli).filter(([, v]) => !v.ok).map(([k]) => k);
    r.esito = r.errore ? 'ERRORE' : fails.length ? 'NON SUPERATO' : 'SUPERATO';
    r.non_superati = fails;
    results.push(r);
    console.log(cfg.name, lang, r.esito, fails.join(' | '), r.errore || '');
    for (const k of fails) console.log('   dettaglio', k, JSON.stringify(r.controlli[k].info ?? null).slice(0, 300));
    for (const k of ['presentazione: riproduzione reale ≥5 s', 'Puntata 0: riproduzione reale ≥3 s']) if (r.controlli[k]) { const v = r.controlli[k].info || {}; console.log('   misura', k, JSON.stringify({t: v.t, dur: v.dur, w: v.w, h: v.h, q: v.q, audio: v.audio, h264: v.h264})); }
    await ctx.close();
  }
  await browser.close();
}

// 6. Regressioni grafiche: confronto con la versione pubblicata (gh-pages), animazioni ferme.
const regress = [];
{
  const browser = await chromium.launch({headless: true, channel: 'chrome'});
  for (const width of [1440, 412]) for (const lang of LANGS) {
    const shots = {};
    let heroBox = null;
    for (const [tag, base] of [['pubblicato', OLD], ['nuovo', NEW]]) {
      const page = await browser.newPage({viewport: {width, height: 900}, deviceScaleFactor: 1});
      await localOnly(page);
      await page.goto(base + '?lang=' + lang, {waitUntil: 'load'});
      await page.addStyleTag({content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}.reveal{opacity:1!important;transform:none!important}'});
      await page.evaluate(async () => {
        document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager');
        document.querySelectorAll('video').forEach(v => { v.pause(); v.removeAttribute('autoplay'); try { v.currentTime = 0; } catch (e) {} });
        await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
        await document.fonts.ready;
      });
      await sleep(700);
      if (tag === 'nuovo') heroBox = await page.locator('.hero-video-wrap').evaluate(e => { const b = e.getBoundingClientRect(); return {x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height}; });
      const file = `${OUT}/schermate/regressione-${width}-${lang}-${tag}.png`;
      await page.screenshot({path: file, fullPage: true});
      shots[tag] = PNG.sync.read(fs.readFileSync(file));
      await page.close();
    }
    const a = shots.pubblicato, b = shots.nuovo;
    const item = {width, lang, altezza_pubblicato: a.height, altezza_nuovo: b.height};
    if (a.width !== b.width || a.height !== b.height) { item.esito = 'NON SUPERATO'; item.motivo = 'dimensioni pagina diverse'; regress.push(item); continue; }
    const diff = new PNG({width: a.width, height: a.height});
    pixelmatch(a.data, b.data, diff.data, a.width, a.height, {threshold: 0.12});
    let n = 0, out = 0, minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
    for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) {
      const k = (y * a.width + x) * 4;
      if (diff.data[k] === 255 && diff.data[k + 1] === 0 && diff.data[k + 2] === 0) {
        n++; minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
        const inside = x >= heroBox.x - 4 && x <= heroBox.x + heroBox.w + 4 && y >= heroBox.y - 4 && y <= heroBox.y + heroBox.h + 4;
        if (!inside) out++;
      }
    }
    fs.writeFileSync(`${OUT}/schermate/regressione-${width}-${lang}-differenze.png`, PNG.sync.write(diff));
    Object.assign(item, {pixel_diversi: n, pixel_diversi_fuori_dal_video: out, riquadro_differenze: n ? {minX, minY, maxX, maxY} : null, riquadro_video: heroBox});
    item.esito = out < 50 ? 'SUPERATO' : 'NON SUPERATO';
    regress.push(item);
    console.log('regressione', width, lang, item.esito, n, out);
  }
  await browser.close();
}

const summary = {data: new Date().toISOString(), funzionali: results, regressioni: regress};
fs.writeFileSync(`${OUT}/risultati.json`, JSON.stringify(summary, null, 1));
const failed = results.filter(r => r.esito !== 'SUPERATO').length + regress.filter(r => r.esito !== 'SUPERATO').length;
console.log('Combinazioni funzionali:', results.length, '— regressioni:', regress.length, '— non superati:', failed);
process.exitCode = 0; // l'esito dettagliato è nel rapporto; il registro riporta ogni non superato.
