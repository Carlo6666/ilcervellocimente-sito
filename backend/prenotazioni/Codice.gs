/**
 * IL CERVELLO (CI) MENTE — Prenotazioni del libro (Google Apps Script)
 *
 * Servizio gratuito: i dati restano in un Foglio Google dell'account del progetto (accesso riservato),
 * le e-mail di conferma partono da Gmail dello stesso account.
 *
 * - doPost: riceve le prenotazioni dal modulo in fondo alla pagina principale (index.html).
 * - doGet ?azione=stato: verifica tecnica che il servizio risponda (nessun dato personale).
 * - doGet senza parametri: area amministrativa, visibile solo al proprietario dello script.
 *
 * Due numeri separati:
 * - RIFERIMENTO: progressivo. Valore iniziale 50.325, la prima prenotazione riceve 50.326, poi +1.
 * - TOTALE delle copie effettivamente prenotate: parte da 0, +1 per ogni nuova prenotazione valida.
 * Nessun limite di chiusura: le prenotazioni restano sempre aperte.
 * Tutto ciò che assegna numeri avviene sotto un unico blocco (LockService):
 * due richieste simultanee non possono ricevere lo stesso riferimento.
 *
 * Contatori nelle proprietà dello script RIF_ULTIMO e COPIE_PRENOTATE (nomi nuovi: il contatore
 * ULTIMO_NUMERO della versione del 25/11, che partiva da 50.000, viene ignorato).
 *
 * Istruzioni di attivazione: README-ATTIVAZIONE.md nella stessa cartella.
 */

var CONFIG = {
  // Valore iniziale del progressivo: la prima prenotazione salvata riceve NUMERO_INIZIALE + 1 = 50.326.
  NUMERO_INIZIALE: 50325,
  // Scheda nuova: la scheda «Prenotazioni» della versione del 25/11 (colonne diverse) non viene toccata.
  NOME_FOGLIO: 'Prenotazioni libro',
  VERSIONE_INFORMATIVA: 'prenotazione-2026-11-26',
  NOME_MITTENTE: 'Il cervello (ci) mente',
  EMAIL_RISPOSTA: 'ilcervellocimente@gmail.com',
  SITO: 'https://www.ilcervellocimente.com',
  // Antispam: massimo di prenotazioni accettate in 10 minuti da tutto il sito.
  MAX_IN_10_MINUTI: 300,
  // Tempo minimo (millisecondi) tra apertura del modulo e invio.
  TEMPO_MINIMO_MS: 1500,
  // Minuti di attesa prima di poter rinviare l'e-mail a chi ha già prenotato.
  MINUTI_TRA_RINVII: 60
};

var COLONNE = [
  'Riferimento', 'Data e ora', 'E-mail', 'Lingua del sito', 'Stato',
  'E-mail di conferma', 'ID richiesta', 'Versione informativa', 'Note'
];
var C = {}; COLONNE.forEach(function (n, i) { C[n] = i + 1; });

var LINGUE = ['it', 'en', 'fr', 'es', 'de'];

/* ------------------------------------------------------------------ */
/* Installazione (da eseguire una volta dall'editor: menu Esegui > setup) */
/* ------------------------------------------------------------------ */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Apri questo script dal Foglio Google (Estensioni > Apps Script).');
  var props = PropertiesService.getScriptProperties();
  props.setProperty('ID_FOGLIO', ss.getId());
  preparaFoglio_(ss, props);
  var esiste = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'inviaEmailInAttesa'; });
  if (!esiste) ScriptApp.newTrigger('inviaEmailInAttesa').timeBased().everyHours(1).create();
  Logger.log('Pronto. Ultimo riferimento: ' + props.getProperty('RIF_ULTIMO') +
    ' · Copie prenotate: ' + props.getProperty('COPIE_PRENOTATE') +
    ' · E-mail ancora inviabili oggi: ' + MailApp.getRemainingDailyQuota());
}

function preparaFoglio_(ss, props) {
  var sh = ss.getSheetByName(CONFIG.NOME_FOGLIO) || ss.insertSheet(CONFIG.NOME_FOGLIO);
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLONNE);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COLONNE.length).setFontWeight('bold');
    sh.getRange('A:A').setNumberFormat('0');
    sh.getRange('B:B').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  }
  if (String(sh.getRange(1, 1).getValue()) !== COLONNE[0]) throw new Error('La scheda «' + CONFIG.NOME_FOGLIO + '» ha colonne diverse: non la modifico.');
  if (!props.getProperty('RIF_ULTIMO')) props.setProperty('RIF_ULTIMO', String(CONFIG.NUMERO_INIZIALE));
  if (!props.getProperty('COPIE_PRENOTATE')) props.setProperty('COPIE_PRENOTATE', String(contaAttive_(sh)));
  return sh;
}

function foglio_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('ID_FOGLIO');
  var ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Foglio non trovato: esegui setup() dal Foglio Google.');
  if (!id) props.setProperty('ID_FOGLIO', ss.getId());
  var sh = ss.getSheetByName(CONFIG.NOME_FOGLIO);
  if (!sh || sh.getLastRow() === 0 || !props.getProperty('RIF_ULTIMO') || !props.getProperty('COPIE_PRENOTATE')) sh = preparaFoglio_(ss, props);
  return sh;
}

function assicuraAttivatore_() {
  try {
    var esiste = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'inviaEmailInAttesa'; });
    if (!esiste) ScriptApp.newTrigger('inviaEmailInAttesa').timeBased().everyHours(1).create();
  } catch (err) { console.error(err); }
}

function contaAttive_(sh) {
  var ultima = sh.getLastRow();
  if (ultima < 2) return 0;
  return sh.getRange(2, C['Stato'], ultima - 1, 1).getValues().filter(function (r) { return r[0] === 'attiva'; }).length;
}

function totale_() {
  return Number(PropertiesService.getScriptProperties().getProperty('COPIE_PRENOTATE') || 0);
}

/* ------------------------------------------------------------------ */
/* Prenotazioni dal sito                                               */
/* ------------------------------------------------------------------ */
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var risposta;
  try {
    var dati = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    risposta = prenota_(dati);
  } catch (err) {
    console.error(err);
    risposta = { ok: false, errore: 'server' };
  }
  return json_(risposta);
}

function pulisci_(v, max) {
  v = String(v == null ? '' : v).replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
  return v.slice(0, max);
}

// Un testo che inizia con = + - @ verrebbe letto come formula dal Foglio o dai programmi CSV.
function testoSicuro_(v) {
  return /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}

var RE_EMAIL = /^[a-z0-9][a-z0-9._%+'-]*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i;

function valida_(d) {
  var o = {
    email: pulisci_(d.email, 254).toLowerCase(),
    linguaSito: pulisci_(d.linguaSito, 2).toLowerCase(),
    richiesta: pulisci_(d.richiesta, 64)
  };
  if (LINGUE.indexOf(o.linguaSito) < 0) o.linguaSito = 'it';
  if (!/^[A-Za-z0-9-]{8,64}$/.test(o.richiesta)) o.richiesta = '';
  o.campi = RE_EMAIL.test(o.email) ? [] : ['email'];
  return o;
}

function prenota_(d) {
  // Antispam silenzioso: campo nascosto compilato o modulo inviato troppo in fretta.
  if (d.sito || (Number(d.tempo) || 0) < CONFIG.TEMPO_MINIMO_MS) return { ok: false, errore: 'verifica' };
  var o = valida_(d);
  if (o.campi.length) return { ok: false, errore: 'campi', campi: o.campi };

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return { ok: false, errore: 'occupato' };
  var numero, riga, sh, totale, rinvio = 0;
  try {
    sh = foglio_();
    var props = PropertiesService.getScriptProperties();

    // Stessa e-mail: nessun nuovo riferimento.
    var esistente = trovaEmail_(sh, o.email);
    if (esistente) {
      var v = sh.getRange(esistente, 1, 1, COLONNE.length).getValues()[0];
      // Stesso invio ripetuto (doppio clic, rete caduta dopo il salvataggio): stessa risposta, stesso riferimento.
      if (o.richiesta && String(v[C['ID richiesta'] - 1]) === o.richiesta) {
        return { ok: true, numero: Number(v[C['Riferimento'] - 1]), ripetuta: true };
      }
      rinvio = esistente;
    } else {
      totale = totale_();

      var cache = CacheService.getScriptCache();
      var recenti = Number(cache.get('recenti') || 0);
      if (recenti >= CONFIG.MAX_IN_10_MINUTI) return { ok: false, errore: 'limite' };

      var ultimo = Number(props.getProperty('RIF_ULTIMO') || CONFIG.NUMERO_INIZIALE);
      var ultimaRiga = sh.getLastRow();
      if (ultimaRiga > 1) ultimo = Math.max(ultimo, Number(sh.getRange(ultimaRiga, C['Riferimento']).getValue()) || 0);
      numero = Math.max(ultimo, CONFIG.NUMERO_INIZIALE) + 1;

      var r = [];
      r[C['Riferimento'] - 1] = numero;
      r[C['Data e ora'] - 1] = new Date();
      r[C['E-mail'] - 1] = testoSicuro_(o.email);
      r[C['Lingua del sito'] - 1] = o.linguaSito;
      r[C['Stato'] - 1] = 'attiva';
      r[C['E-mail di conferma'] - 1] = 'in attesa';
      r[C['ID richiesta'] - 1] = o.richiesta;
      r[C['Versione informativa'] - 1] = CONFIG.VERSIONE_INFORMATIVA;
      r[C['Note'] - 1] = '';
      sh.appendRow(r);
      SpreadsheetApp.flush();
      riga = sh.getLastRow();
      // I contatori si aggiornano solo dopo il salvataggio riuscito della riga.
      props.setProperty('RIF_ULTIMO', String(numero));
      props.setProperty('COPIE_PRENOTATE', String(totale + 1));
      cache.put('recenti', String(recenti + 1), 600);
    }
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }

  if (rinvio) {
    rinviaSePossibile_(sh, rinvio);
    return { ok: true, duplicato: true };
  }
  var statoEmail = inviaConferma_(sh, riga);
  return { ok: true, numero: numero, email: statoEmail };
}

function trovaEmail_(sh, email) {
  var ultima = sh.getLastRow();
  if (ultima < 2) return 0;
  var cella = sh.getRange(2, C['E-mail'], ultima - 1, 1).createTextFinder(email)
    .matchEntireCell(true).matchCase(false).findNext();
  return cella ? cella.getRow() : 0;
}

function rinviaSePossibile_(sh, riga) {
  var cache = CacheService.getScriptCache();
  var chiave = 'rinvio-' + riga;
  if (cache.get(chiave)) return;
  cache.put(chiave, '1', CONFIG.MINUTI_TRA_RINVII * 60);
  inviaConferma_(sh, riga);
}

/* ------------------------------------------------------------------ */
/* E-mail di conferma (5 lingue)                                       */
/* ------------------------------------------------------------------ */
var TESTI_EMAIL = {
  it: {
    abbrev: 'N.',
    oggetto: 'Prenotazione n. {n} — Il cervello (ci) mente',
    titolo: 'Prenota oggi. Leggi domani.',
    ciao: 'Ciao,',
    grazie: 'grazie! La tua copia di «Il cervello (ci) mente» è prenotata.',
    numero: 'Il tuo riferimento di prenotazione',
    spiega: 'È il codice della tua prenotazione: conservalo. Non indica quante copie sono state prenotate.',
    gratis: 'La prenotazione è gratuita e senza impegno: nessun pagamento. Ti scriveremo non appena il libro sarà pubblicato.',
    annulla: 'Vuoi annullare la prenotazione? Rispondi a questa e-mail.',
    firma: 'Carlo Riva e Nora'
  },
  en: {
    abbrev: 'No.',
    oggetto: 'Pre-order no. {n} — Il cervello (ci) mente',
    titolo: 'Pre-order today. Read tomorrow.',
    ciao: 'Hello,',
    grazie: 'thank you! Your copy of «Il cervello (ci) mente» is reserved.',
    numero: 'Your pre-order reference',
    spiega: 'This is your pre-order code: please keep it. It does not show how many copies have been pre-ordered.',
    gratis: 'Pre-ordering is free and with no obligation: no payment. We will write to you as soon as the book is published.',
    annulla: 'Want to cancel your pre-order? Just reply to this e-mail.',
    firma: 'Carlo Riva and Nora'
  },
  fr: {
    abbrev: 'N°',
    oggetto: 'Réservation n° {n} — Il cervello (ci) mente',
    titolo: 'Réservez aujourd’hui. Lisez demain.',
    ciao: 'Bonjour,',
    grazie: 'merci ! Votre exemplaire de « Il cervello (ci) mente » est réservé.',
    numero: 'Votre référence de réservation',
    spiega: 'C’est le code de votre réservation : conservez-le. Il n’indique pas le nombre d’exemplaires réservés.',
    gratis: 'La réservation est gratuite et sans engagement : aucun paiement. Nous vous écrirons dès la parution du livre.',
    annulla: 'Pour annuler votre réservation, répondez simplement à cet e-mail.',
    firma: 'Carlo Riva et Nora'
  },
  es: {
    abbrev: 'N.º',
    oggetto: 'Reserva n.º {n} — Il cervello (ci) mente',
    titolo: 'Resérvalo hoy. Léelo mañana.',
    ciao: 'Hola:',
    grazie: '¡gracias! Tu ejemplar de «Il cervello (ci) mente» está reservado.',
    numero: 'Tu referencia de reserva',
    spiega: 'Es el código de tu reserva: consérvalo. No indica cuántos ejemplares se han reservado.',
    gratis: 'La reserva es gratuita y sin compromiso: no hay que pagar nada. Te escribiremos en cuanto se publique el libro.',
    annulla: '¿Quieres cancelar la reserva? Responde a este correo.',
    firma: 'Carlo Riva y Nora'
  },
  de: {
    abbrev: 'Nr.',
    oggetto: 'Vorbestellung Nr. {n} — Il cervello (ci) mente',
    titolo: 'Heute vorbestellen. Morgen lesen.',
    ciao: 'Hallo,',
    grazie: 'vielen Dank! Dein Exemplar von „Il cervello (ci) mente“ ist reserviert.',
    numero: 'Deine Vorbestellnummer',
    spiega: 'Das ist der Code deiner Vorbestellung: Bitte bewahre ihn auf. Er zeigt nicht, wie viele Exemplare vorbestellt wurden.',
    gratis: 'Die Vorbestellung ist kostenlos und unverbindlich: keine Zahlung. Wir schreiben dir, sobald das Buch erscheint.',
    annulla: 'Du möchtest stornieren? Antworte einfach auf diese E-Mail.',
    firma: 'Carlo Riva und Nora'
  }
};

function formattaNumero_(n, lingua) {
  var s = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u0001');
  var sep = lingua === 'en' ? ',' : lingua === 'fr' ? ' ' : '.';
  return s.replace(/\u0001/g, sep);
}

function esc_(s) {
  return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
}

function senzaApice_(v) { v = String(v); return v.charAt(0) === "'" ? v.slice(1) : v; }

function componiEmail_(p) {
  var t = TESTI_EMAIL[p.lingua] || TESTI_EMAIL.it;
  var n = formattaNumero_(p.numero, p.lingua);
  var testo = [
    t.titolo, '', t.ciao, t.grazie, '',
    t.numero + ': ' + t.abbrev + ' ' + n, t.spiega, '',
    t.gratis, t.annulla, '', t.firma, CONFIG.SITO
  ].join('\n');
  var html =
    '<div style="background:#120e0c;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">' +
    '<div style="max-width:560px;margin:0 auto;background:#1c130f;border:1px solid #5d3b27;border-radius:14px;padding:28px 24px;color:#f4e4cf">' +
    '<p style="margin:0 0 6px;font:700 11px/1.4 Courier New,monospace;letter-spacing:.14em;color:#f5aa70">IL CERVELLO (CI) MENTE</p>' +
    '<h1 style="margin:0 0 18px;font:800 28px/1.05 Arial Narrow,Arial,sans-serif;color:#f4dfcc">' + esc_(t.titolo) + '</h1>' +
    '<p style="margin:0 0 6px;font-size:15px;line-height:1.6">' + esc_(t.ciao) + '</p>' +
    '<p style="margin:0 0 20px;font-size:15px;line-height:1.6">' + esc_(t.grazie) + '</p>' +
    '<div style="background:#ed5819;color:#fff;border-radius:10px;padding:16px 18px;margin:0 0 10px">' +
    '<div style="font:700 11px/1.3 Courier New,monospace;letter-spacing:.1em;text-transform:uppercase">' + esc_(t.numero) + '</div>' +
    '<div style="font:800 40px/1.1 Arial Narrow,Arial,sans-serif;letter-spacing:.02em">' + esc_(t.abbrev + ' ' + n) + '</div></div>' +
    '<p style="margin:0 0 22px;font-size:13px;line-height:1.55;color:#e2bea3">' + esc_(t.spiega) + '</p>' +
    '<p style="margin:0 0 10px;font-size:14px;line-height:1.6">' + esc_(t.gratis) + '</p>' +
    '<p style="margin:0 0 22px;font-size:13px;line-height:1.6;color:#e2bea3">' + esc_(t.annulla) + '</p>' +
    '<p style="margin:0;font-size:14px">' + esc_(t.firma) + '<br><a href="' + CONFIG.SITO + '" style="color:#f5aa70">www.ilcervellocimente.com</a></p>' +
    '</div></div>';
  return { oggetto: t.oggetto.replace('{n}', n), testo: testo, html: html };
}

function inviaConferma_(sh, riga) {
  var v = sh.getRange(riga, 1, 1, COLONNE.length).getValues()[0];
  var cellaStato = sh.getRange(riga, C['E-mail di conferma']);
  if (v[C['Stato'] - 1] !== 'attiva') return 'non_inviata';
  if (MailApp.getRemainingDailyQuota() < 1) { cellaStato.setValue('in attesa'); return 'in_attesa'; }
  var m = componiEmail_({ numero: v[C['Riferimento'] - 1], lingua: v[C['Lingua del sito'] - 1] || 'it' });
  try {
    MailApp.sendEmail({
      to: senzaApice_(v[C['E-mail'] - 1]), subject: m.oggetto, body: m.testo, htmlBody: m.html,
      name: CONFIG.NOME_MITTENTE, replyTo: CONFIG.EMAIL_RISPOSTA
    });
    cellaStato.setValue('inviata ' + Utilities.formatDate(new Date(), 'Europe/Rome', 'dd/MM/yyyy HH:mm'));
    return 'inviata';
  } catch (err) {
    console.error(err);
    cellaStato.setValue('in attesa');
    return 'in_attesa';
  }
}

/** Ogni ora: invia le conferme rimaste in attesa (quota giornaliera di Gmail esaurita o errore). */
function inviaEmailInAttesa() {
  var sh = foglio_();
  var ultima = sh.getLastRow();
  if (ultima < 2) return;
  var stati = sh.getRange(2, C['E-mail di conferma'], ultima - 1, 1).getValues();
  for (var i = 0; i < stati.length; i++) {
    if (stati[i][0] !== 'in attesa') continue;
    if (MailApp.getRemainingDailyQuota() < 1) return;
    inviaConferma_(sh, i + 2);
  }
}

/* ------------------------------------------------------------------ */
/* Stato pubblico e area amministrativa                                */
/* ------------------------------------------------------------------ */
function eAmministratore_() {
  var attivo = '';
  var proprietario = '';
  try { attivo = Session.getActiveUser().getEmail() || ''; } catch (x) {}
  try { proprietario = Session.getEffectiveUser().getEmail() || ''; } catch (x) {}
  var extra = (PropertiesService.getScriptProperties().getProperty('ADMIN_EXTRA') || '')
    .toLowerCase().split(',').map(function (s) { return s.trim(); }).filter(String);
  attivo = attivo.toLowerCase();
  return !!attivo && (attivo === proprietario.toLowerCase() || extra.indexOf(attivo) >= 0);
}

function doGet(e) {
  if (e && e.parameter && e.parameter.azione === 'stato') {
    // Verifica tecnica: nessun conteggio e nessun dato personale.
    try { foglio_(); return json_({ ok: true }); }
    catch (err) { console.error(err); return json_({ ok: false, errore: 'server' }); }
  }
  if (!eAmministratore_()) {
    return HtmlService.createHtmlOutput(
      '<p style="font-family:Arial,sans-serif;padding:24px">Accesso riservato. / Restricted area.</p>')
      .setTitle('Il cervello (ci) mente');
  }
  foglio_();
  assicuraAttivatore_();
  return HtmlService.createTemplateFromFile('Admin').evaluate()
    .setTitle('Prenotazioni — area riservata')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/** Dati per l'area riservata (chiamata da Admin.html). */
function datiAdmin() {
  if (!eAmministratore_()) throw new Error('Accesso riservato');
  var sh = foglio_();
  var ultima = sh.getLastRow();
  var righe = ultima > 1 ? sh.getRange(2, 1, ultima - 1, COLONNE.length).getValues() : [];
  var props = PropertiesService.getScriptProperties();
  return {
    aggiornato: Utilities.formatDate(new Date(), 'Europe/Rome', 'dd/MM/yyyy HH:mm'),
    numeroIniziale: CONFIG.NUMERO_INIZIALE,
    ultimoNumero: Number(props.getProperty('RIF_ULTIMO') || CONFIG.NUMERO_INIZIALE),
    totale: totale_(),
    quotaEmail: MailApp.getRemainingDailyQuota(),
    colonne: COLONNE,
    righe: righe.map(function (r) {
      return r.map(function (v, i) {
        if (Object.prototype.toString.call(v) === '[object Date]') return Utilities.formatDate(v, 'Europe/Rome', 'yyyy-MM-dd HH:mm:ss');
        return i === C['Riferimento'] - 1 ? Number(v) : senzaApice_(v);
      });
    })
  };
}

/** Annulla o riattiva una prenotazione. Il riferimento resta assegnato; il totale delle copie si ricalcola. */
function cambiaStato(numero, stato) {
  if (!eAmministratore_()) throw new Error('Accesso riservato');
  if (['attiva', 'annullata'].indexOf(stato) < 0) throw new Error('Stato non valido');
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) throw new Error('Servizio occupato, riprova');
  try {
    var sh = foglio_();
    var ultima = sh.getLastRow();
    if (ultima < 2) return false;
    var cella = sh.getRange(2, C['Riferimento'], ultima - 1, 1).createTextFinder(String(numero)).matchEntireCell(true).findNext();
    if (!cella) return false;
    var cellaStato = sh.getRange(cella.getRow(), C['Stato']);
    if (cellaStato.getValue() === stato) return true;
    cellaStato.setValue(stato);
    PropertiesService.getScriptProperties().setProperty('COPIE_PRENOTATE', String(contaAttive_(sh)));
    return true;
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function include(nome) { return HtmlService.createHtmlOutputFromFile(nome).getContent(); }
