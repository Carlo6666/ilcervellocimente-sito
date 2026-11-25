// Collaudo nel browser della prenotazione: smartphone, tablet e desktop, 5 lingue.
// Uso: node backend/prenotazioni/test/collaudo-browser.mjs <chromium|webkit|firefox> [cartella-uscita]
// Richiede il server di anteprima avviato (server-anteprima.mjs) su BASE (default http://127.0.0.1:8123)
// e, per il confronto delle regressioni, ORIGINALE impostato sul server.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const pw = createRequire(import.meta.url)('playwright');

const motore = process.argv[2] || 'chromium';
const uscita = process.argv[3] || 'collaudo-prenotazione';
const BASE = process.env.BASE || 'http://127.0.0.1:8123';
fs.mkdirSync(uscita, { recursive: true });

const dispositivi = {
  chromium: [['smartphone-android', pw.devices['Pixel 7']], ['tablet', { viewport: { width: 820, height: 1180 }, hasTouch: true }], ['desktop', { viewport: { width: 1440, height: 900 } }], ['smartphone-stretto', { viewport: { width: 320, height: 640 }, hasTouch: true, isMobile: true }]],
  webkit: [['iphone', pw.devices['iPhone 14']], ['ipad', pw.devices['iPad (gen 7)']], ['desktop-safari', { viewport: { width: 1440, height: 900 } }]],
  firefox: [['desktop-firefox', { viewport: { width: 1440, height: 900 } }], ['tablet-firefox', { viewport: { width: 820, height: 1180 } }]]
}[motore];

const attesi = {
  it: { button: 'PRENOTA LA TUA COPIA', title: 'Prenota oggi.', sep: '.', done: 'Grazie! La tua copia è prenotata.' },
  en: { button: 'PRE-ORDER YOUR COPY', title: 'Pre-order today.', sep: ',', done: 'Thank you! Your copy is reserved.' },
  fr: { button: 'RÉSERVEZ VOTRE EXEMPLAIRE', title: 'Réservez aujourd’hui.', sep: ' ', done: 'Merci ! Votre exemplaire est réservé.' },
  es: { button: 'RESERVA TU EJEMPLAR', title: 'Resérvalo hoy.', sep: '.', done: '¡Gracias! Tu ejemplar está reservado.' },
  de: { button: 'EXEMPLAR VORBESTELLEN', title: 'Heute vorbestellen.', sep: '.', done: 'Danke! Dein Exemplar ist reserviert.' }
};

const browser = await pw[motore].launch();
const risultati = [];
let progressivo = 0;

async function nuovaPagina(opts) {
  const ctx = await browser.newContext({ ...opts, reducedMotion: 'reduce' });
  // Banner dei cookie già chiuso con «Rifiuta» (come farebbe un visitatore), così non copre i pulsanti.
  await ctx.addInitScript(() => { try { if (!localStorage.getItem('icc_metricool_consent_v1')) localStorage.setItem('icc_metricool_consent_v1', 'no'); } catch (e) {} });
  const page = await ctx.newPage();
  const errori = [];
  page.on('pageerror', (e) => errori.push(e.message));
  // Nessuna richiesta esterna (YouTube, Metricool, HeyGen): solo il server locale.
  await page.route('**/*', (r) => r.request().url().startsWith(BASE) ? r.continue() : r.abort());
  return { ctx, page, errori };
}

for (const [nomeDisp, opts] of dispositivi) {
  for (const lang of Object.keys(attesi)) {
    const a = attesi[lang];
    const voce = { motore, dispositivo: nomeDisp, lingua: lang };
    const { ctx, page, errori } = await nuovaPagina(opts);
    try {
      // 1. Home: blocco in fondo, dopo «Seguici» e prima del piè di pagina.
      await page.goto(BASE + '/index.html?lang=' + lang, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelector('#prenota-link')?.getAttribute('href')?.includes('lang='));
      const ordine = await page.evaluate(() => {
        const main = document.querySelector('main');
        const sezioni = [...main.children].filter((e) => e.tagName === 'SECTION').map((e) => e.id);
        const blocco = document.getElementById('prenota');
        const footer = document.querySelector('footer');
        return { ultima: sezioni.at(-1), penultima: sezioni.at(-2), primaDelFooter: blocco.getBoundingClientRect().bottom <= footer.getBoundingClientRect().top + 1 };
      });
      assert.equal(ordine.ultima, 'prenota');
      assert.equal(ordine.penultima, 'seguici');
      assert.ok(ordine.primaDelFooter);
      const bottone = page.locator('#prenota-link');
      assert.equal((await bottone.innerText()).replace(/\s*↗\s*$/, '').trim(), a.button);
      assert.ok((await page.locator('#prenota-title').innerText()).replace(/\s+/g, ' ').toLowerCase().startsWith(a.title.toLowerCase()));
      assert.equal(await bottone.getAttribute('href'), 'prenota.html?lang=' + lang);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'nessuno scorrimento orizzontale (home)');
      await page.locator('#prenota').scrollIntoViewIfNeeded();
      await page.locator('#prenota').screenshot({ path: path.join(uscita, `home-blocco-${nomeDisp}-${lang}.png`) });

      // 2. Pagina di prenotazione.
      await bottone.click();
      await page.waitForURL(/prenota\.html\?lang=/);
      await page.waitForSelector('#pr-paese option[value="IT"]', { state: 'attached' });
      assert.equal(await page.evaluate(() => document.documentElement.lang), lang);
      assert.equal(await page.locator('#pr-submit').innerText().then((t) => t.replace(/\s*↗\s*$/, '').trim()), a.button);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'nessuno scorrimento orizzontale (prenota)');
      assert.equal(await page.locator('#pr-lingua').inputValue(), lang);
      await page.screenshot({ path: path.join(uscita, `prenota-${nomeDisp}-${lang}.png`), fullPage: true });

      // 3. Invio vuoto: errori visibili e nessuna prenotazione.
      await page.waitForTimeout(2600); // tempo minimo antispam
      await page.locator('#pr-submit').click();
      assert.equal(await page.locator('#err-nome').isVisible(), true);
      assert.equal(await page.locator('#err-privacy').isVisible(), true);
      assert.equal(await page.locator('#pr-done').isVisible(), false);

      // 4. Prenotazione completa.
      const email = `prova-${motore}-${nomeDisp}-${lang}@example.com`;
      await page.fill('#pr-nome', 'Prova ' + nomeDisp + ' ' + lang);
      await page.fill('#pr-email', email);
      await page.selectOption('#pr-paese', 'CH');
      await page.locator('input[name="formato"][value="ebook"]').check();
      await page.locator('#pr-lista').check();
      await page.locator('#pr-privacy').check();
      await page.locator('#pr-submit').click();
      await page.locator('#pr-done').waitFor({ state: 'visible', timeout: 10000 });
      const numeroTesto = await page.locator('#pr-done-number').innerText();
      const numero = Number(numeroTesto.replace(/[^\d]/g, ''));
      assert.ok(numero > 50000, 'numero assegnato > 50000');
      assert.ok(numeroTesto.includes(a.sep), 'separatore delle migliaia della lingua');
      assert.equal(await page.locator('.pr-done-title').innerText(), a.done);
      assert.ok((await page.locator('.pr-done-note').innerText()).includes(lang === 'en' ? '50,001' : lang === 'fr' ? '50 001' : '50.001'));
      await page.locator('#pr-done').screenshot({ path: path.join(uscita, `conferma-${nomeDisp}-${lang}.png`) });

      // 5. Stessa e-mail: nessun nuovo numero.
      const { page: p2, ctx: c2 } = await nuovaPagina(opts);
      await p2.goto(BASE + '/prenota.html?lang=' + lang);
      await p2.waitForTimeout(2600);
      await p2.fill('#pr-nome', 'Doppione'); await p2.fill('#pr-email', email.toUpperCase());
      await p2.selectOption('#pr-paese', 'IT'); await p2.locator('input[name="formato"][value="cartaceo"]').check(); await p2.locator('#pr-privacy').check();
      await p2.locator('#pr-submit').click();
      await p2.locator('#pr-done').waitFor({ state: 'visible', timeout: 10000 });
      assert.equal(await p2.locator('#pr-done-number').isVisible(), false);
      await c2.close();

      // 6. Registro lato servizio: riga salvata con i dati giusti, e-mail col numero.
      const reg = await (await fetch(BASE + '/api-registro')).json();
      const riga = reg.righe.find((r) => r[3] === email);
      assert.ok(riga, 'riga salvata');
      assert.equal(riga[0], numero);
      assert.deepEqual([riga[4], riga[5], riga[6], riga[7], riga[9], riga[10]], ['CH', lang, 'ebook', 'sì', lang, 'attiva']);
      assert.equal(reg.righe.filter((r) => r[3] === email).length, 1, 'nessun doppione');
      const mail = reg.email.find((m) => m.to === email);
      assert.ok(mail && mail.htmlBody.includes(numeroTesto.replace('N. ', '')), 'e-mail con il numero');

      assert.deepEqual(errori, []);
      voce.esito = 'ok'; voce.numero = numero;
      progressivo++;
    } catch (e) {
      voce.esito = 'ERRORE'; voce.errore = e.message;
      try { await page.screenshot({ path: path.join(uscita, `ERRORE-${nomeDisp}-${lang}.png`), fullPage: true }); } catch {}
    }
    risultati.push(voce);
    console.log(JSON.stringify(voce));
    await ctx.close();
  }
}

// 7. Regressioni: la home sopra il nuovo blocco è identica alla versione precedente (ORIGINALE).
const reg = [];
const haOriginale = (await fetch(BASE + '/__originale.html')).status === 200;
if (haOriginale) {
  for (const [nomeDisp, opts] of dispositivi) {
    for (const lang of ['it', 'en']) {
      const { ctx, page } = await nuovaPagina(opts);
      const foto = async (url) => {
        await page.goto(BASE + url + '?lang=' + lang, { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => document.fonts.ready);
        await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important} #consent-banner,.consent-banner{display:none!important}' });
        await page.evaluate(() => { document.querySelectorAll('video').forEach((v) => { v.pause(); v.removeAttribute('autoplay'); }); document.querySelectorAll('.reveal').forEach((e) => e.classList.add('visible')); });
        await page.waitForTimeout(400);
        const geo = await page.evaluate(() => {
          const out = {};
          document.querySelectorAll('main > section, footer, header').forEach((e, i) => { const r = e.getBoundingClientRect(); out[(e.id || e.tagName) + i] = [Math.round(r.top + scrollY), Math.round(r.height)]; });
          return out;
        });
        const altezza = await page.evaluate(() => { const s = document.getElementById('seguici'); return Math.round(s.getBoundingClientRect().bottom + scrollY); });
        return { geo, altezza };
      };
      const prima = await foto('/__originale.html');
      const dopo = await foto('/index.html');
      // Le sezioni esistenti mantengono posizione e altezza; il piè di pagina si sposta solo dell'altezza del blocco.
      const bloccoH = dopo.geo[Object.keys(dopo.geo).find((k) => k.startsWith('prenota'))][1];
      const diff = [];
      for (const k of Object.keys(prima.geo)) {
        const nuovo = k in dopo.geo && !k.startsWith('FOOTER') ? k : Object.keys(dopo.geo).find((x) => x.startsWith('FOOTER') && k.startsWith('FOOTER'));
        const atteso = k.startsWith('FOOTER') ? prima.geo[k][0] + bloccoH : prima.geo[k][0];
        if (!nuovo || Math.abs(dopo.geo[nuovo][0] - atteso) > 1 || Math.abs(dopo.geo[nuovo][1] - prima.geo[k][1]) > 1) diff.push(k);
      }
      reg.push({ motore, dispositivo: nomeDisp, lingua: lang, sezioniDiverse: diff, altezzaPrima: prima.altezza, altezzaDopo: dopo.altezza });
      console.log(JSON.stringify(reg.at(-1)));
      await ctx.close();
    }
  }
}

await browser.close();
const falliti = risultati.filter((r) => r.esito !== 'ok');
const regFallite = reg.filter((r) => r.sezioniDiverse.length || r.altezzaPrima !== r.altezzaDopo);
fs.writeFileSync(path.join(uscita, `risultati-${motore}.json`), JSON.stringify({ risultati, regressioni: reg }, null, 2));
console.log(`\n${motore}: ${risultati.length - falliti.length}/${risultati.length} combinazioni ok; regressioni ${reg.length - regFallite.length}/${reg.length} senza differenze.`);
if (falliti.length || regFallite.length) process.exit(1);
