// Collaudo della logica di Codice.gs (numerazione, antispam, e-mail, area riservata).
// Uso: node backend/prenotazioni/test/collaudo-backend.mjs
import assert from 'node:assert/strict';
import { creaAmbiente, post } from './ambiente-finto.mjs';

let passati = 0;
function prova(nome, fn) { fn(); passati++; console.log('ok  ' + nome); }

const base = (x = {}) => Object.assign({ nome: 'Mario Rossi', email: 'mario@example.com', paese: 'IT', linguaPreferita: 'it', formato: 'cartaceo', mailingList: true, privacy: true, linguaSito: 'it', sito: '', tempo: 9000 }, x);

const amb = creaAmbiente();
amb.g.setup();
const sh = amb.fogli['Prenotazioni'];

prova('setup: intestazioni, contatore 50000, attivatore orario', () => {
  assert.equal(sh.dati.length, 1);
  assert.equal(sh.dati[0][0], 'Numero');
  assert.equal(amb.props.ULTIMO_NUMERO, '50000');
  assert.equal(amb.triggers.length, 1);
  amb.g.setup();
  assert.equal(amb.triggers.length, 1, 'setup ripetuto non duplica');
  assert.equal(sh.dati.length, 1);
});

prova('prima, seconda e terza prenotazione: 50001, 50002, 50003', () => {
  assert.deepEqual(post(amb, base()), { ok: true, numero: 50001, email: 'inviata' });
  assert.equal(post(amb, base({ email: 'anna@example.com', linguaSito: 'en', paese: 'GB', formato: 'ebook', mailingList: false })).numero, 50002);
  assert.equal(post(amb, base({ email: 'Luc@Example.fr', linguaSito: 'fr', paese: 'FR' })).numero, 50003);
  assert.equal(amb.props.ULTIMO_NUMERO, '50003');
});

prova('e-mail di conferma con numero nella lingua giusta', () => {
  assert.equal(amb.inviate.length, 3);
  assert.match(amb.inviate[0].subject, /Prenotazione n\. 50\.001/);
  assert.match(amb.inviate[0].htmlBody, /N\. 50\.001/);
  assert.match(amb.inviate[0].body, /parte da 50\.001/);
  assert.match(amb.inviate[1].subject, /Pre-order no\. 50,002/);
  assert.match(amb.inviate[2].subject, /n° 50 003/);
  assert.equal(amb.inviate[2].to, 'luc@example.fr');
  assert.equal(amb.inviate[0].replyTo, 'ilcervellocimente@gmail.com');
  assert.match(amb.inviate[0].body, /gratuita e senza impegno/);
});

prova('stessa e-mail (maiuscole diverse): nessun nuovo numero, un solo rinvio all\'ora', () => {
  const r = post(amb, base({ email: 'MARIO@example.com' }));
  assert.deepEqual(r, { ok: true, duplicato: true });
  assert.equal(amb.inviate.length, 4);
  post(amb, base());
  assert.equal(amb.inviate.length, 4, 'secondo tentativo entro l\'ora: nessuna e-mail');
  assert.equal(sh.dati.length, 4);
  assert.equal(amb.props.ULTIMO_NUMERO, '50003');
});

prova('antispam: campo nascosto e invio troppo rapido rifiutati senza numero', () => {
  assert.equal(post(amb, base({ email: 'bot@example.com', sito: 'http://spam' })).errore, 'verifica');
  assert.equal(post(amb, base({ email: 'bot2@example.com', tempo: 300 })).errore, 'verifica');
  assert.equal(sh.dati.length, 4);
});

prova('validazione dei campi', () => {
  const r = post(amb, { nome: 'x', email: 'no', paese: 'Italia', linguaPreferita: 'pt', formato: 'audio', privacy: false, tempo: 9000 });
  assert.equal(r.errore, 'campi');
  assert.deepEqual(r.campi.sort(), ['email', 'formato', 'linguaPreferita', 'nome', 'paese', 'privacy'].sort());
  assert.equal(post(amb, base({ email: 'link@example.com', nome: 'Visita https://spam.example' })).errore, 'campi');
  assert.equal(post(amb, base({ email: 'np@example.com', privacy: 'true' })).errore, 'campi', 'la privacy deve essere true booleano');
});

prova('testo che inizia con = non diventa formula', () => {
  const r = post(amb, base({ email: 'f@example.com', nome: '=HYPERLINK("x")' }));
  assert.equal(r.numero, 50004);
  assert.equal(sh.dati[4][2], '\'=HYPERLINK("x")');
  assert.equal(amb.inviate.at(-1).body.includes("Ciao =HYPERLINK"), true, 'nell\'e-mail il nome è senza apice');
});

prova('quota Gmail esaurita: prenotazione salvata, e-mail in attesa e inviata dopo', () => {
  amb.stato.quota = 0;
  const r = post(amb, base({ email: 'q@example.com' }));
  assert.deepEqual(r, { ok: true, numero: 50005, email: 'in_attesa' });
  assert.equal(sh.dati[5][11], 'in attesa');
  amb.stato.quota = 10;
  amb.g.inviaEmailInAttesa();
  assert.match(sh.dati[5][11], /^inviata /);
  assert.match(amb.inviate.at(-1).subject, /50\.005/);
});

prova('errore Gmail: la prenotazione resta valida', () => {
  amb.stato.mailFallisce = true;
  const r = post(amb, base({ email: 'err@example.com' }));
  amb.stato.mailFallisce = false;
  assert.equal(r.numero, 50006);
  assert.equal(r.email, 'in_attesa');
});

prova('area riservata: visitatore anonimo respinto', () => {
  amb.stato.utenteAttivo = '';
  assert.match(amb.g.doGet().html, /Accesso riservato/);
  assert.throws(() => amb.g.datiAdmin(), /Accesso riservato/);
  amb.stato.utenteAttivo = 'altro@gmail.com';
  assert.match(amb.g.doGet().html, /Accesso riservato/);
  assert.throws(() => amb.g.cambiaStato(50001, 'annullata'), /Accesso riservato/);
});

prova('area riservata: proprietario vede i dati; numero progressivo e totale separati', () => {
  amb.stato.utenteAttivo = 'ilcervellocimente@gmail.com';
  assert.match(amb.g.doGet().html, /Prenotazioni del libro/);
  assert.equal(amb.g.cambiaStato(50002, 'annullata'), true);
  const d = amb.g.datiAdmin();
  assert.equal(d.ultimoNumero, 50006);
  assert.equal(d.righe.length, 6);
  assert.equal(d.righe.filter((r) => r[10] === 'attiva').length, 5);
  assert.equal(d.righe[3][2], '=HYPERLINK("x")', 'il pannello mostra il testo originale');
});

prova('dopo un annullamento il numero non viene riutilizzato', () => {
  assert.equal(post(amb, base({ email: 'nuovo@example.com' })).numero, 50007);
});

prova('contatore perso: riparte dall\'ultimo numero nel Foglio, mai duplicati', () => {
  delete amb.props.ULTIMO_NUMERO;
  assert.equal(post(amb, base({ email: 'dopo@example.com' })).numero, 50008);
});

prova('limite antispam: oltre 60 prenotazioni in 10 minuti', () => {
  amb.cache.recenti = '60';
  assert.equal(post(amb, base({ email: 'tanti@example.com' })).errore, 'limite');
  amb.svuotaCache();
});

prova('numeri univoci e consecutivi su 500 prenotazioni', () => {
  const a = creaAmbiente({ quota: 1000 });
  a.g.setup();
  const nums = [];
  for (let i = 0; i < 500; i++) { if (i % 50 === 0) a.svuotaCache(); nums.push(post(a, base({ email: 'u' + i + '@example.com' })).numero); }
  assert.equal(new Set(nums).size, 500);
  assert.equal(nums[0], 50001);
  assert.equal(nums[499], 50500);
});

prova('servizio occupato (blocco non ottenuto): nessun numero assegnato', () => {
  const a = creaAmbiente();
  a.g.setup();
  a.g.LockService.getScriptLock = () => ({ tryLock: () => false, releaseLock() {} });
  assert.equal(post(a, base()).errore, 'occupato');
  assert.equal(a.fogli['Prenotazioni'].dati.length, 1);
});

console.log(`\n${passati} prove superate.`);
