// Collaudo della logica di Codice.gs: riferimento da 50.326, totale copie, nessun limite, doppioni, errori, area riservata.
// Codice.gs vero eseguito in un ambiente Apps Script simulato (ambiente-finto.mjs). Solo indirizzi di prova @example.com.
// Uso: node backend/prenotazioni/test/collaudo-backend.mjs
import assert from 'node:assert/strict';
import { creaAmbiente, post, stato } from './ambiente-finto.mjs';

let passati = 0;
function prova(nome, fn) { fn(); passati++; console.log('ok  ' + nome); }

let seq = 0;
const base = (x = {}) => Object.assign({ email: `prova${++seq}@example.com`, linguaSito: 'it', sito: '', tempo: 9000, richiesta: 'richiesta-prova-' + seq }, x);

const amb = creaAmbiente();
amb.g.setup();
const sh = amb.fogli['Prenotazioni libro'];
const totale = () => Number(amb.props.COPIE_PRENOTATE);

prova('setup: intestazioni, progressivo iniziale 50325, totale 0, nessuna soglia, attivatore', () => {
  assert.equal(sh.dati.length, 1);
  assert.equal(sh.dati[0][0], 'Riferimento');
  assert.equal(amb.props.RIF_ULTIMO, '50325');
  assert.equal(totale(), 0);
  assert.equal(typeof amb.g.soglia_, 'undefined');
  assert.equal(typeof amb.g.impostaSoglia, 'undefined');
  assert.equal(amb.triggers.length, 1);
  amb.g.setup();
  assert.equal(amb.triggers.length, 1, 'setup ripetuto non duplica');
  assert.deepEqual(stato(amb), { ok: true });
});

prova('prima prenotazione: riferimento 50.326, totale 1; poi 50.327 e 50.328', () => {
  const r = post(amb, base({ email: 'mario@example.com' }));
  assert.deepEqual(r, { ok: true, numero: 50326, email: 'inviata' });
  assert.equal(totale(), 1);
  assert.equal(post(amb, base({ email: 'anna@example.com', linguaSito: 'en' })).numero, 50327);
  assert.equal(post(amb, base({ email: 'Luc@Example.fr', linguaSito: 'fr' })).numero, 50328);
  assert.equal(totale(), 3);
  assert.equal(amb.props.RIF_ULTIMO, '50328');
  assert.equal(sh.dati[1][2], 'mario@example.com');
  assert.equal(sh.dati[1][4], 'attiva');
});

prova('e-mail di conferma con il riferimento nella lingua del sito', () => {
  assert.equal(amb.inviate.length, 3);
  assert.match(amb.inviate[0].subject, /Prenotazione n\. 50\.326/);
  assert.match(amb.inviate[0].htmlBody, /N\. 50\.326/);
  assert.match(amb.inviate[1].subject, /Pre-order no\. 50,327/);
  assert.match(amb.inviate[2].subject, /n° 50 328/);
  assert.equal(amb.inviate[2].to, 'luc@example.fr');
});

prova('doppio clic / tentativo ripetuto con lo stesso ID richiesta: stesso riferimento, nessuna riga nuova', () => {
  const d = base({ email: 'doppio@example.com' });
  const a = post(amb, d);
  const b = post(amb, d);
  const c = post(amb, { ...d, email: 'DOPPIO@example.com' });
  assert.equal(a.numero, 50329);
  assert.deepEqual(b, { ok: true, numero: 50329, ripetuta: true });
  assert.deepEqual(c, { ok: true, numero: 50329, ripetuta: true });
  assert.equal(totale(), 4);
  assert.equal(sh.dati.length, 5);
  assert.equal(amb.inviate.length, 4, 'nessuna e-mail in più');
});

prova('stessa e-mail da un nuovo invio: nessun nuovo riferimento, rinvio e-mail al massimo una volta all\'ora', () => {
  const r = post(amb, base({ email: 'MARIO@example.com' }));
  assert.deepEqual(r, { ok: true, duplicato: true });
  assert.equal(amb.inviate.length, 5);
  post(amb, base({ email: 'mario@example.com' }));
  assert.equal(amb.inviate.length, 5);
  assert.equal(totale(), 4);
  assert.equal(amb.props.RIF_ULTIMO, '50329');
});

prova('errore di salvataggio: nessun riferimento, contatori invariati; il nuovo tentativo riceve il riferimento successivo', () => {
  amb.stato.salvataggiFalliti = 1;
  const d = base({ email: 'guasto@example.com' });
  assert.deepEqual(post(amb, d), { ok: false, errore: 'server' });
  assert.equal(totale(), 4);
  assert.equal(amb.props.RIF_ULTIMO, '50329');
  assert.equal(sh.dati.length, 5);
  const r = post(amb, d);
  assert.equal(r.ok, true);
  assert.equal(r.numero, 50330, 'nessun numero bruciato dal tentativo fallito');
  assert.equal(totale(), 5);
});

prova('richiesta simultanea mentre un salvataggio tiene il blocco: respinta come «occupato», nessun doppione', () => {
  let interna;
  amb.stato.durante = () => { interna = post(amb, base({ email: 'simultanea-b@example.com' })); };
  const esterna = post(amb, base({ email: 'simultanea-a@example.com' }));
  assert.equal(esterna.numero, 50331);
  assert.deepEqual(interna, { ok: false, errore: 'occupato' });
  const dopo = post(amb, base({ email: 'simultanea-b@example.com' }));
  assert.equal(dopo.numero, 50332);
  const numeri = sh.dati.slice(1).map((r) => r[0]);
  assert.equal(new Set(numeri).size, numeri.length, 'riferimenti tutti diversi');
});

prova('validazione e antispam: e-mail non valida, campo nascosto, invio troppo rapido', () => {
  const n = sh.dati.length;
  assert.deepEqual(post(amb, base({ email: 'non-una-email' })), { ok: false, errore: 'campi', campi: ['email'] });
  assert.deepEqual(post(amb, base({ email: '=cmd@example.com' })), { ok: false, errore: 'campi', campi: ['email'] });
  assert.equal(post(amb, base({ sito: 'http://spam' })).errore, 'verifica');
  assert.equal(post(amb, base({ tempo: 300 })).errore, 'verifica');
  assert.equal(sh.dati.length, n);
});

prova('nessun limite: oltre 50.000 copie le prenotazioni restano aperte e i riferimenti proseguono', () => {
  const a = creaAmbiente(); a.g.setup();
  a.g.CONFIG.MAX_IN_10_MINUTI = 1e9;
  a.stato.quota = 1e9;
  // Per velocità: 49.999 prenotazioni già presenti (totale e progressivo coerenti), poi le successive vere.
  a.props.COPIE_PRENOTATE = '49999';
  a.props.RIF_ULTIMO = String(50325 + 49999);
  for (let i = 1; i <= 5; i++) {
    const r = post(a, base());
    assert.deepEqual(r, { ok: true, numero: 50325 + 49999 + i, email: 'inviata' });
  }
  assert.equal(a.props.COPIE_PRENOTATE, '50004');
  assert.deepEqual(stato(a), { ok: true });
  // Una vecchia proprietà SOGLIA_COPIE rimasta nello script non ha più effetto.
  a.props.SOGLIA_COPIE = '3';
  assert.equal(post(a, base()).ok, true);
  assert.equal(a.props.COPIE_PRENOTATE, '50005');
});

prova('area riservata: annulla libera una copia (riferimento non riassegnato), riattiva sempre possibile, nessuna soglia nei dati', () => {
  const a = creaAmbiente({ utenteAttivo: 'ilcervellocimente@gmail.com' }); a.g.setup();
  post(a, base()); post(a, base());
  assert.equal(a.g.cambiaStato(50326, 'annullata'), true);
  assert.equal(a.props.COPIE_PRENOTATE, '1');
  const r = post(a, base());
  assert.equal(r.numero, 50328, 'il 50.326 annullato non viene riassegnato');
  assert.equal(a.g.cambiaStato(50326, 'attiva'), true);
  assert.equal(a.props.COPIE_PRENOTATE, '3');
  const d = a.g.datiAdmin();
  assert.equal(d.totale, 3); assert.equal(d.ultimoNumero, 50328); assert.equal(d.numeroIniziale, 50325);
  assert.equal('soglia' in d, false);
});

prova('area riservata negata ad anonimi e ad altri account', () => {
  for (const u of ['', 'estraneo@example.com']) {
    const a = creaAmbiente({ utenteAttivo: u }); a.g.setup();
    assert.match(a.g.doGet({ parameter: {} }).html, /Accesso riservato/);
    assert.throws(() => a.g.datiAdmin(), /Accesso riservato/);
    assert.throws(() => a.g.cambiaStato(50326, 'annullata'), /Accesso riservato/);
  }
});

prova('quota Gmail esaurita: prenotazione salvata, conferma in attesa e inviata dall\'attivatore orario', () => {
  const a = creaAmbiente({ quota: 0 }); a.g.setup();
  const r = post(a, base());
  assert.equal(r.numero, 50326); assert.equal(r.email, 'in_attesa');
  a.stato.quota = 10; a.g.inviaEmailInAttesa();
  assert.equal(a.inviate.length, 1);
  assert.match(a.fogli['Prenotazioni libro'].dati[1][5], /^inviata/);
});

prova('servizio già attivato con la versione del 25/11: vecchia scheda e vecchio contatore 50.000 ignorati, primo riferimento 50.326', () => {
  const a = creaAmbiente();
  const ss = a.g.SpreadsheetApp.getActiveSpreadsheet();
  const vecchia = ss.insertSheet('Prenotazioni');
  vecchia.appendRow(['Numero', 'Data e ora', 'Nome e cognome', 'E-mail']);
  vecchia.appendRow([50001, new Date(), 'Prova', 'vecchia@example.com']);
  a.props.ULTIMO_NUMERO = '50001';
  a.props.ID_FOGLIO = 'FOGLIO-TEST';
  const r = post(a, base({ email: 'nuova@example.com' }));
  assert.equal(r.numero, 50326);
  assert.equal(a.props.COPIE_PRENOTATE, '1');
  assert.equal(vecchia.dati.length, 2, 'vecchia scheda non toccata');
  assert.equal(a.props.ULTIMO_NUMERO, '50001');
});

console.log(`\n${passati}/${passati} prove superate`);
