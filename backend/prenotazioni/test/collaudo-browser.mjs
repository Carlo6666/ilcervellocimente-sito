// Collaudo nel browser di «Prenota il libro» (modulo nella pagina principale): smartphone, tablet e desktop, 5 lingue.
// Uso: node backend/prenotazioni/test/collaudo-browser.mjs <chromium|webkit|firefox> [cartella-uscita]
// Richiede il server di anteprima avviato (server-anteprima.mjs) su BASE (default http://127.0.0.1:8123)
// e, per il confronto delle regressioni, ORIGINALE impostato sul server. Solo indirizzi di prova @example.com.
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
  it: { button: 'PRENOTA IL LIBRO', title: 'Prenota oggi.', ref: 'N. 50.326', ref2: 'N. 50.327', done: 'Grazie! La tua copia è prenotata.', err: 'Non siamo riusciti a salvare', retry: 'RIPROVA', dup: 'Hai già prenotato una copia.', email: 'Inserisci un indirizzo e-mail valido.', privacy: 'Informativa privacy sulla prenotazione', notOpen: 'Le prenotazioni apriranno a breve' },
  en: { button: 'PRE-ORDER THE BOOK', title: 'Pre-order today.', ref: 'No. 50,326', ref2: 'No. 50,327', done: 'Thank you! Your copy is reserved.', err: 'We could not save', retry: 'TRY AGAIN', dup: 'You have already pre-ordered a copy.', email: 'Please enter a valid e-mail address.', privacy: 'Privacy notice for pre-orders', notOpen: 'Pre-orders will open soon' },
  fr: { button: 'RÉSERVER LE LIVRE', title: 'Réservez aujourd’hui.', ref: 'N° 50 326', ref2: 'N° 50 327', done: 'Merci ! Votre exemplaire est réservé.', err: 'Nous n’avons pas pu enregistrer', retry: 'RÉESSAYER', dup: 'Vous avez déjà réservé un exemplaire.', email: 'Indiquez une adresse e-mail valide.', privacy: 'Politique de confidentialité de la réservation', notOpen: 'Les réservations ouvriront bientôt' },
  es: { button: 'RESERVAR EL LIBRO', title: 'Resérvalo hoy.', ref: 'N.º 50.326', ref2: 'N.º 50.327', done: '¡Gracias! Tu ejemplar está reservado.', err: 'No hemos podido guardar', retry: 'REINTENTAR', dup: 'Ya has reservado un ejemplar.', email: 'Introduce una dirección de correo válida.', privacy: 'Información sobre privacidad de la reserva', notOpen: 'Las reservas se abrirán pronto' },
  de: { button: 'BUCH VORBESTELLEN', title: 'Heute vorbestellen.', ref: 'Nr. 50.326', ref2: 'Nr. 50.327', done: 'Danke! Dein Exemplar ist reserviert.', err: 'Deine Vorbestellung konnte nicht gespeichert', retry: 'ERNEUT VERSUCHEN', dup: 'Du hast bereits ein Exemplar vorbestellt.', email: 'Bitte gib eine gültige E-Mail-Adresse ein.', privacy: 'Datenschutzhinweise zur Vorbestellung', notOpen: 'Die Vorbestellung öffnet in Kürze' }
};

const browser = await pw[motore].launch();
const risultati = [];
const controllo = (c) => fetch(BASE + '/__controllo', { method: 'POST', body: JSON.stringify(c) });
const registro = async () => (await fetch(BASE + '/api-registro')).json();
const testo = async (loc) => (await loc.textContent()).replace(/[ \t\r\n]+/g, ' ').trim(); // testo vero (senza maiuscole da CSS)
const etichetta = async (page, sel) => (await testo(page.locator(sel + ' span').first()));

const senzaNome = ({ __nome, ...o }) => o;
async function nuovaPagina(opts) {
  const ctx = await browser.newContext({ ...senzaNome(opts), reducedMotion: 'reduce' });
  // Banner dei cookie già chiuso con «Rifiuta» (come farebbe un visitatore), così non copre i pulsanti.
  await ctx.addInitScript(() => { try { if (!localStorage.getItem('icc_metricool_consent_v1')) localStorage.setItem('icc_metricool_consent_v1', 'no'); } catch (e) {} });
  const page = await ctx.newPage();
  const errori = [];
  page.on('pageerror', (e) => errori.push(e.message));
  // Nessuna richiesta esterna (YouTube, Metricool, HeyGen): solo il server locale.
  await page.route('**/*', (r) => r.request().url().startsWith(BASE) ? r.continue() : r.abort());
  return { ctx, page, errori };
}
async function apriHome(page, lang, extra = '') {
  await page.goto(BASE + '/index.html?lang=' + lang + extra, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('#pr-privacy-line, .pr-privacy-line')?.innerHTML.includes('informativa-prenotazione'));
  await page.waitForLoadState('load');
  await page.waitForTimeout(300); // lettura dello stato aperto/chiuso
}
async function apriModulo(page) {
  await page.locator('#prenota-apri').scrollIntoViewIfNeeded();
  await page.locator('#prenota-apri').click();
  await page.locator('#pr-email').waitFor({ state: 'visible' });
}

async function scenario(nome, opts, lang, fn) {
  const voce = { motore, dispositivo: nome, lingua: lang, prova: fn.name };
  const { ctx, page, errori } = await nuovaPagina(opts);
  try {
    await fn(page, attesi[lang], lang, opts);
    assert.deepEqual(errori, [], 'nessun errore JavaScript');
    voce.esito = 'ok';
  } catch (e) {
    voce.esito = 'ERRORE'; voce.errore = e.message.replace(/\s+/g, ' ').slice(0, 300);
    try { await page.screenshot({ path: path.join(uscita, `ERRORE-${fn.name}-${nome}-${lang}.png`), fullPage: false }); } catch {}
  }
  risultati.push(voce);
  console.log(JSON.stringify(voce));
  await ctx.close();
}

/* 1. Percorso completo: sezione in fondo, apertura del modulo, errore e-mail, doppio clic, riferimento 50.326. */
async function percorso(page, a, lang, opts) {
  await controllo({ azzera: true, ritardoMs: 700 });
  await apriHome(page, lang);
  const ordine = await page.evaluate(() => {
    const sezioni = [...document.querySelector('main').children].filter((e) => e.tagName === 'SECTION').map((e) => e.id);
    const blocco = document.getElementById('prenota'), footer = document.querySelector('footer');
    return { ultima: sezioni.at(-1), penultima: sezioni.at(-2), primaDelFooter: blocco.getBoundingClientRect().bottom <= footer.getBoundingClientRect().top + 1 };
  });
  assert.deepEqual(ordine, { ultima: 'prenota', penultima: 'seguici', primaDelFooter: true });
  assert.equal(await etichetta(page, '#prenota-apri'), a.button);
  assert.ok((await testo(page.locator('#prenota-title'))).toLowerCase().startsWith(a.title.toLowerCase()));
  assert.equal(await page.locator('#prenota-modulo').isVisible(), false, 'modulo chiuso prima del clic');
  assert.equal(await page.locator('#prenota-chiuse').count(), 0, 'nessun pulsante «Prenotazioni chiuse»');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'nessuno scorrimento orizzontale');
  await page.locator('#prenota').scrollIntoViewIfNeeded();
  await page.locator('#prenota').screenshot({ path: path.join(uscita, `1-sezione-${opts.__nome}-${lang}.png`) });

  await apriModulo(page);
  assert.equal(page.url().split('?')[0], BASE + '/index.html', 'stessa pagina');
  assert.equal(await page.locator('#prenota-apri').getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('.pr-privacy-line a[href="#informativa-prenotazione"]').count(), 1, 'link all’informativa');

  // E-mail non valida: errore visibile, nessuna richiesta al servizio.
  await page.fill('#pr-email', 'non-valida');
  await page.locator('#pr-submit').click();
  assert.equal(await testo(page.locator('#pr-err-email')), a.email);
  assert.equal((await registro()).righe.length, 1, 'nessun salvataggio con e-mail non valida');

  // Doppio clic + Invio durante il salvataggio (servizio lento 0,7 s).
  const email = `prova-${motore}-${opts.__nome}-${lang}@example.com`;
  await page.fill('#pr-email', email);
  await page.waitForTimeout(1600); // tempo minimo antispam dall'apertura del modulo
  await page.locator('#pr-submit').click();
  await page.locator('#pr-submit').click({ force: true, timeout: 2000 }).catch(() => {});
  await page.locator('#pr-email').press('Enter').catch(() => {});
  assert.equal(await page.locator('#pr-done').isVisible(), false, 'nessuna conferma prima del salvataggio');
  await page.locator('#pr-done').waitFor({ state: 'visible', timeout: 10000 });
  assert.equal(await testo(page.locator('#pr-done-number')), a.ref, 'primo riferimento 50.326 nel formato della lingua');
  assert.equal(await testo(page.locator('#pr-done-title')), a.done);
  const reg = await registro();
  assert.equal(reg.righe.length, 2, 'una sola riga salvata nonostante i clic ripetuti');
  assert.equal(reg.righe[1][0], 50326);
  assert.equal(reg.righe[1][2], email);
  assert.equal(reg.righe[1][3], lang);
  assert.equal(reg.totale, '1');
  assert.ok(reg.email.length === 1 && reg.email[0].htmlBody.includes(a.ref.replace(' ', ' ')), 'e-mail di conferma con il riferimento');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'nessuno scorrimento orizzontale');
  await page.locator('#prenota').screenshot({ path: path.join(uscita, `2-conferma-${opts.__nome}-${lang}.png`) });

  // Informativa dedicata nella lingua della pagina.
  await page.locator('#informativa-prenotazione summary').click();
  assert.equal(await testo(page.locator('#informativa-prenotazione summary')), a.privacy);
  assert.equal(await page.locator('#informativa-prenotazione .pr-privacy-body').isVisible(), true);
  await controllo({ ritardoMs: 0 });
}

/* 2. Errore di salvataggio: messaggio chiaro, nessun riferimento; «Riprova» → 50.326 (nessun numero perso). */
async function erroreSalvataggio(page, a, lang, opts) {
  await controllo({ azzera: true, guasti: 1 });
  await apriHome(page, lang);
  await apriModulo(page);
  await page.fill('#pr-email', `guasto-${lang}@example.com`);
  await page.waitForTimeout(1600);
  await page.locator('#pr-submit').click();
  await page.waitForFunction(() => document.querySelector('#pr-status').classList.contains('is-error'));
  assert.ok((await testo(page.locator('#pr-status'))).startsWith(a.err));
  assert.equal(await page.locator('#pr-done').isVisible(), false);
  assert.equal(await etichetta(page, '#pr-submit'), a.retry);
  assert.equal(await page.locator('#pr-submit').isEnabled(), true);
  assert.equal((await registro()).righe.length, 1);
  await page.locator('#prenota-modulo').screenshot({ path: path.join(uscita, `3-errore-${opts.__nome}-${lang}.png`) });
  await page.locator('#pr-submit').click();
  await page.locator('#pr-done').waitFor({ state: 'visible', timeout: 10000 });
  assert.equal(await testo(page.locator('#pr-done-number')), a.ref);
}

/* 3. Risposta persa dopo il salvataggio (rete caduta): «Riprova» restituisce lo stesso riferimento, nessun doppione. */
async function rispostaPersa(page, a, lang) {
  await controllo({ azzera: true });
  let persa = false;
  await page.route(BASE + '/api', async (r) => {
    if (r.request().method() === 'POST' && !persa) { persa = true; await r.fetch(); return r.abort('connectionreset'); }
    return r.continue();
  });
  await apriHome(page, lang);
  await apriModulo(page);
  await page.fill('#pr-email', `rete-${lang}@example.com`);
  await page.waitForTimeout(1600);
  await page.locator('#pr-submit').click();
  await page.waitForFunction(() => document.querySelector('#pr-status').classList.contains('is-error'));
  assert.equal((await registro()).righe.length, 2, 'il servizio aveva salvato');
  await page.locator('#pr-submit').click();
  await page.locator('#pr-done').waitFor({ state: 'visible', timeout: 10000 });
  assert.equal(await testo(page.locator('#pr-done-number')), a.ref, 'stesso riferimento');
  const reg = await registro();
  assert.equal(reg.righe.length, 2, 'nessun doppione');
  assert.equal(reg.totale, '1');
}

/* 4. Stessa e-mail da un'altra visita: nessun nuovo riferimento. */
async function stessaEmail(page, a, lang) {
  await controllo({ azzera: true });
  for (let i = 0; i < 2; i++) {
    await apriHome(page, lang);
    await apriModulo(page);
    await page.fill('#pr-email', i ? `DOPPIA-${lang}@EXAMPLE.COM` : `doppia-${lang}@example.com`);
    await page.waitForTimeout(1600);
    await page.locator('#pr-submit').click();
    await page.locator('#pr-done').waitFor({ state: 'visible', timeout: 10000 });
  }
  assert.equal(await testo(page.locator('#pr-done-title')), a.dup);
  assert.equal(await page.locator('#pr-done-number').isVisible(), false);
  const reg = await registro();
  assert.equal(reg.righe.length, 2);
  assert.equal(reg.totale, '1');
}

/* 5. Nessun limite: oltre 50.000 copie già prenotate il modulo resta aperto; due invii simultanei ricevono riferimenti diversi. */
async function senzaLimite(page, a, lang, opts) {
  await controllo({ azzera: true, totale: 60000 });
  const ctx2 = await browser.newContext({ ...senzaNome(opts), reducedMotion: 'reduce' });
  await ctx2.addInitScript(() => { try { localStorage.setItem('icc_metricool_consent_v1', 'no'); } catch (e) {} });
  const p2 = await ctx2.newPage(); await p2.route('**/*', (r) => r.request().url().startsWith(BASE) ? r.continue() : r.abort());
  const ctx3 = await browser.newContext({ ...senzaNome(opts), reducedMotion: 'reduce' });
  await ctx3.addInitScript(() => { try { localStorage.setItem('icc_metricool_consent_v1', 'no'); } catch (e) {} });
  const p3 = await ctx3.newPage(); await p3.route('**/*', (r) => r.request().url().startsWith(BASE) ? r.continue() : r.abort());
  const pagine = [page, p2, p3];
  try {
    for (const [i, p] of pagine.entries()) { await apriHome(p, lang); await apriModulo(p); await p.fill('#pr-email', `senza-limite-${i}-${lang}@example.com`); }
    await page.waitForTimeout(1600);
    await page.locator('#pr-submit').click();
    await page.locator('#pr-done').waitFor({ state: 'visible', timeout: 10000 });
    assert.equal(await testo(page.locator('#pr-done-number')), a.ref, 'il primo riferimento resta 50.326');
    await Promise.all([p2.locator('#pr-submit').click(), p3.locator('#pr-submit').click()]);
    await Promise.all([p2, p3].map((p) => p.locator('#pr-done').waitFor({ state: 'visible', timeout: 10000 })));
    const numeri = [await testo(p2.locator('#pr-done-number')), await testo(p3.locator('#pr-done-number'))];
    assert.ok(numeri.includes(a.ref2), 'uno dei due riceve 50.327');
    assert.equal(new Set([a.ref, ...numeri]).size, 3, 'tre riferimenti diversi');
    const reg = await registro();
    assert.equal(reg.totale, '60003', 'nessun limite di copie');
    assert.equal(reg.righe.length, 4);
    // Nuova visita: il pulsante «Prenota il libro» resta disponibile.
    await apriHome(p2, lang);
    assert.equal(await etichetta(p2, '#prenota-apri'), a.button);
    assert.equal(await p2.locator('#prenota-apri').isVisible(), true);
    await p2.locator('#prenota').screenshot({ path: path.join(uscita, `4-senza-limite-${opts.__nome}-${lang}.png`) });
  } finally { await ctx2.close(); await ctx3.close(); }
}

/* 6. Servizio non ancora configurato (situazione attuale in produzione): avviso, nessun invio. */
async function nonConfigurato(page, a, lang) {
  await apriHome(page, lang, '&vuoto=1');
  await apriModulo(page);
  await page.fill('#pr-email', 'prova@example.com');
  await page.locator('#pr-submit').click();
  assert.ok((await testo(page.locator('#pr-status'))).startsWith(a.notOpen));
  assert.equal(await page.locator('#pr-done').isVisible(), false);
}

for (const [nome, opts] of dispositivi) {
  opts.__nome = nome;
  for (const lang of Object.keys(attesi)) await scenario(nome, opts, lang, percorso);
}
// Errori, doppioni e assenza di limite: smartphone e desktop di ogni motore, 5 lingue (errore e nessun limite) / IT+DE (altri).
const scelti = dispositivi.filter(([n]) => /smartphone-android|iphone|desktop/.test(n));
for (const [nome, opts] of scelti) {
  for (const lang of Object.keys(attesi)) {
    await scenario(nome, opts, lang, erroreSalvataggio);
    await scenario(nome, opts, lang, senzaLimite);
  }
  for (const lang of ['it', 'de']) {
    await scenario(nome, opts, lang, rispostaPersa);
    await scenario(nome, opts, lang, stessaEmail);
    await scenario(nome, opts, lang, nonConfigurato);
  }
}

// Regressioni: la home sopra il nuovo blocco è identica alla versione precedente (ORIGINALE).
const reg = [];
const haOriginale = (await fetch(BASE + '/__originale.html')).status === 200;
if (haOriginale) {
  for (const [nomeDisp, opts] of dispositivi) {
    for (const lang of ['it', 'en']) {
      const { ctx, page } = await nuovaPagina(opts);
      const foto = async (url) => {
        await page.goto(BASE + url + '?lang=' + lang, { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => document.fonts.ready);
        await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
        await page.evaluate(() => { document.querySelectorAll('video').forEach((v) => { v.pause(); v.removeAttribute('autoplay'); }); document.querySelectorAll('.reveal').forEach((e) => e.classList.add('visible')); });
        await page.waitForTimeout(400);
        const geo = await page.evaluate(() => {
          const out = {};
          document.querySelectorAll('main > section, footer, header').forEach((e, i) => { const r = e.getBoundingClientRect(); out[(e.id || e.tagName) + i] = [Math.round(r.top + scrollY), Math.round(r.height)]; });
          return out;
        });
        const nav = await page.evaluate(() => [...document.querySelectorAll('header a, header button, header select')].map((e) => (e.getAttribute('href') || e.id || e.tagName) + ':' + e.textContent.trim()).join('|'));
        const video = await page.evaluate(() => [...document.querySelectorAll('video, video source, iframe')].map((v) => v.getAttribute('src') || v.getAttribute('data-src') || '').join('|'));
        return { geo, nav, video };
      };
      const prima = await foto('/__originale.html');
      const dopo = await foto('/index.html');
      const bloccoH = dopo.geo[Object.keys(dopo.geo).find((k) => k.startsWith('prenota'))][1];
      const diff = [];
      for (const k of Object.keys(prima.geo)) {
        const nuovo = k in dopo.geo && !k.startsWith('FOOTER') ? k : Object.keys(dopo.geo).find((x) => x.startsWith('FOOTER') && k.startsWith('FOOTER'));
        const atteso = k.startsWith('FOOTER') ? prima.geo[k][0] + bloccoH : prima.geo[k][0];
        if (!nuovo || Math.abs(dopo.geo[nuovo][0] - atteso) > 1 || Math.abs(dopo.geo[nuovo][1] - prima.geo[k][1]) > 1) diff.push(k);
      }
      reg.push({ motore, dispositivo: nomeDisp, lingua: lang, sezioniDiverse: diff, navigazioneUguale: prima.nav === dopo.nav, videoUguali: prima.video === dopo.video });
      console.log(JSON.stringify(reg.at(-1)));
      await ctx.close();
    }
  }
}

await browser.close();
const falliti = risultati.filter((r) => r.esito !== 'ok');
const regFallite = reg.filter((r) => r.sezioniDiverse.length || !r.navigazioneUguale || !r.videoUguali);
fs.writeFileSync(path.join(uscita, `risultati-${motore}.json`), JSON.stringify({ risultati, regressioni: reg }, null, 2));
console.log(`\n${motore}: ${risultati.length - falliti.length}/${risultati.length} prove ok; regressioni ${reg.length - regFallite.length}/${reg.length} senza differenze.`);
if (falliti.length || regFallite.length) process.exit(1);
