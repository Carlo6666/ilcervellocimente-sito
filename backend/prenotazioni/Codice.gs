/**
 * IL CERVELLO (CI) MENTE — Prenotazioni del libro (Google Apps Script)
 *
 * Servizio gratuito: i dati restano in un Foglio Google dell'account del progetto,
 * le e-mail di conferma partono da Gmail dello stesso account.
 *
 * - doPost: riceve le prenotazioni dal sito (pagina prenota.html).
 * - doGet: area amministrativa, visibile solo al proprietario dello script.
 *
 * Numerazione: identificativo progressivo che parte da 50.001 (valore iniziale 50.000).
 * È separato dal totale reale delle prenotazioni, che si calcola contando le righe "attiva".
 *
 * Istruzioni di attivazione: README-ATTIVAZIONE.md nella stessa cartella.
 */

var CONFIG = {
  NUMERO_INIZIALE: 50000,
  NOME_FOGLIO: 'Prenotazioni',
  VERSIONE_INFORMATIVA: 'prenotazione-2026-11-25',
  NOME_MITTENTE: 'Il cervello (ci) mente',
  EMAIL_RISPOSTA: 'ilcervellocimente@gmail.com',
  SITO: 'https://www.ilcervellocimente.com',
  // Antispam: massimo di prenotazioni accettate in 10 minuti da tutto il sito.
  MAX_IN_10_MINUTI: 60,
  // Tempo minimo (millisecondi) tra apertura della pagina e invio del modulo.
  TEMPO_MINIMO_MS: 2500,
  // Minuti di attesa prima di poter rinviare l'e-mail a chi ha già prenotato.
  MINUTI_TRA_RINVII: 60
};

var COLONNE = [
  'Numero', 'Data e ora', 'Nome e cognome', 'E-mail', 'Paese', 'Lingua preferita',
  'Formato', 'Mailing list', 'Informativa privacy', 'Lingua del sito', 'Stato',
  'E-mail di conferma', 'Versione informativa', 'Note'
];
var C = {}; COLONNE.forEach(function (n, i) { C[n] = i + 1; });

var LINGUE = ['it', 'en', 'fr', 'es', 'de'];
var FORMATI = ['ebook', 'cartaceo'];

/* ------------------------------------------------------------------ */
/* Installazione (da eseguire una volta dall'editor: menu Esegui > setup) */
/* ------------------------------------------------------------------ */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Apri questo script dal Foglio Google (Estensioni > Apps Script).');
  var props = PropertiesService.getScriptProperties();
  props.setProperty('ID_FOGLIO', ss.getId());
  if (!props.getProperty('ULTIMO_NUMERO')) props.setProperty('ULTIMO_NUMERO', String(CONFIG.NUMERO_INIZIALE));
  var sh = ss.getSheetByName(CONFIG.NOME_FOGLIO) || ss.insertSheet(CONFIG.NOME_FOGLIO);
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLONNE);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, COLONNE.length).setFontWeight('bold');
    sh.getRange('A:A').setNumberFormat('0');
    sh.getRange('B:B').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  }
  // Invio delle e-mail rimaste in attesa (quota Gmail esaurita o errore temporaneo).
  var esiste = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'inviaEmailInAttesa'; });
  if (!esiste) ScriptApp.newTrigger('inviaEmailInAttesa').timeBased().everyHours(1).create();
  Logger.log('Pronto. Ultimo numero assegnato: ' + props.getProperty('ULTIMO_NUMERO') +
    ' · E-mail ancora inviabili oggi: ' + MailApp.getRemainingDailyQuota());
}

function foglio_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('ID_FOGLIO');
  var ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Foglio non trovato: esegui setup() dal Foglio Google.');
  var sh = ss.getSheetByName(CONFIG.NOME_FOGLIO);
  if (!sh || sh.getLastRow() === 0) {
    // Prima esecuzione senza setup() (attivazione automatica): prepara il foglio.
    // Avviene alla prima apertura dell'area riservata; dentro prenota_ il blocco è già preso.
    {
      sh = ss.getSheetByName(CONFIG.NOME_FOGLIO) || ss.insertSheet(CONFIG.NOME_FOGLIO);
      if (sh.getLastRow() === 0) {
        sh.appendRow(COLONNE);
        sh.setFrozenRows(1);
        sh.getRange(1, 1, 1, COLONNE.length).setFontWeight('bold');
        sh.getRange('A:A').setNumberFormat('0');
        sh.getRange('B:B').setNumberFormat('dd/MM/yyyy HH:mm:ss');
      }
      if (!id) props.setProperty('ID_FOGLIO', ss.getId());
      if (!props.getProperty('ULTIMO_NUMERO')) props.setProperty('ULTIMO_NUMERO', String(CONFIG.NUMERO_INIZIALE));
    }
  }
  return sh;
}

/** Crea l'attivatore orario delle e-mail in attesa, se manca (chiamata dall'area riservata). */
function assicuraAttivatore_() {
  try {
    var esiste = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'inviaEmailInAttesa'; });
    if (!esiste) ScriptApp.newTrigger('inviaEmailInAttesa').timeBased().everyHours(1).create();
  } catch (err) { console.error(err); }
}

/* ------------------------------------------------------------------ */
/* Prenotazioni dal sito                                               */
/* ------------------------------------------------------------------ */
function doPost(e) {
  var risposta;
  try {
    var dati = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    risposta = prenota_(dati);
  } catch (err) {
    console.error(err);
    risposta = { ok: false, errore: 'server' };
  }
  return ContentService.createTextOutput(JSON.stringify(risposta)).setMimeType(ContentService.MimeType.JSON);
}

function pulisci_(v, max) {
  v = String(v == null ? '' : v).replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
  return v.slice(0, max);
}

// Un testo che inizia con = + - @ verrebbe letto come formula dal Foglio o dai programmi CSV.
function testoSicuro_(v) {
  return /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}

function valida_(d) {
  var o = {
    nome: pulisci_(d.nome, 120),
    email: pulisci_(d.email, 254).toLowerCase(),
    paese: pulisci_(d.paese, 3).toUpperCase(),
    linguaPreferita: pulisci_(d.linguaPreferita, 3).toLowerCase(),
    formato: pulisci_(d.formato, 12).toLowerCase(),
    mailingList: d.mailingList === true,
    privacy: d.privacy === true,
    linguaSito: pulisci_(d.linguaSito, 2).toLowerCase()
  };
  if (LINGUE.indexOf(o.linguaSito) < 0) o.linguaSito = 'it';
  var campi = [];
  if (o.nome.length < 2 || /https?:|www\.|<|>/i.test(o.nome)) campi.push('nome');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(o.email)) campi.push('email');
  if (!/^[A-Z]{2}$/.test(o.paese)) campi.push('paese');
  if (LINGUE.indexOf(o.linguaPreferita) < 0) campi.push('linguaPreferita');
  if (FORMATI.indexOf(o.formato) < 0) campi.push('formato');
  if (!o.privacy) campi.push('privacy');
  o.campi = campi;
  return o;
}

function prenota_(d) {
  // Antispam silenzioso: campo nascosto compilato o modulo inviato troppo in fretta.
  if (d.sito || (Number(d.tempo) || 0) < CONFIG.TEMPO_MINIMO_MS) return { ok: false, errore: 'verifica' };
  var o = valida_(d);
  if (o.campi.length) return { ok: false, errore: 'campi', campi: o.campi };

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return { ok: false, errore: 'occupato' };
  var numero, riga, sh;
  try {
    sh = foglio_();
    // Stessa e-mail: nessun nuovo numero.
    var esistente = trovaEmail_(sh, o.email);
    if (esistente) {
      lock.releaseLock();
      rinviaSePossibile_(sh, esistente);
      return { ok: true, duplicato: true };
    }
    var cache = CacheService.getScriptCache();
    var recenti = Number(cache.get('recenti') || 0);
    if (recenti >= CONFIG.MAX_IN_10_MINUTI) return { ok: false, errore: 'limite' };

    var props = PropertiesService.getScriptProperties();
    var ultimo = Number(props.getProperty('ULTIMO_NUMERO') || CONFIG.NUMERO_INIZIALE);
    var ultimaRiga = sh.getLastRow();
    if (ultimaRiga > 1) ultimo = Math.max(ultimo, Number(sh.getRange(ultimaRiga, C['Numero']).getValue()) || 0);
    numero = Math.max(ultimo, CONFIG.NUMERO_INIZIALE) + 1;

    var r = [];
    r[C['Numero'] - 1] = numero;
    r[C['Data e ora'] - 1] = new Date();
    r[C['Nome e cognome'] - 1] = testoSicuro_(o.nome);
    r[C['E-mail'] - 1] = testoSicuro_(o.email);
    r[C['Paese'] - 1] = o.paese;
    r[C['Lingua preferita'] - 1] = o.linguaPreferita;
    r[C['Formato'] - 1] = o.formato;
    r[C['Mailing list'] - 1] = o.mailingList ? 'sì' : 'no';
    r[C['Informativa privacy'] - 1] = 'presa visione';
    r[C['Lingua del sito'] - 1] = o.linguaSito;
    r[C['Stato'] - 1] = 'attiva';
    r[C['E-mail di conferma'] - 1] = 'in attesa';
    r[C['Versione informativa'] - 1] = CONFIG.VERSIONE_INFORMATIVA;
    r[C['Note'] - 1] = '';
    sh.appendRow(r);
    SpreadsheetApp.flush();
    riga = sh.getLastRow();
    props.setProperty('ULTIMO_NUMERO', String(numero));
    cache.put('recenti', String(recenti + 1), 600);
  } finally {
    try { lock.releaseLock(); } catch (x) {}
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
    ciao: 'Ciao {nome},',
    grazie: 'grazie! La tua copia di «Il cervello (ci) mente» è prenotata.',
    numero: 'Il tuo numero di prenotazione',
    spiega: 'È un numero identificativo: la numerazione delle prenotazioni parte da 50.001. Non indica quante copie sono state prenotate.',
    riepilogo: 'Riepilogo', formato: 'Formato', lingua: 'Lingua preferita', paese: 'Paese', lista: 'Mailing list',
    si: 'sì', no: 'no', ebook: 'e-book', cartaceo: 'cartaceo',
    gratis: 'La prenotazione è gratuita e senza impegno: nessun pagamento. Ti scriveremo non appena il libro sarà pubblicato.',
    annulla: 'Vuoi annullare la prenotazione, cambiare i dati o uscire dalla mailing list? Rispondi a questa e-mail.',
    firma: 'Carlo Riva e Nora'
  },
  en: {
    abbrev: 'No.',
    oggetto: 'Pre-order no. {n} — Il cervello (ci) mente',
    titolo: 'Pre-order today. Read tomorrow.',
    ciao: 'Hi {nome},',
    grazie: 'thank you! Your copy of «Il cervello (ci) mente» is reserved.',
    numero: 'Your pre-order number',
    spiega: 'This is an identification number: pre-order numbering starts at 50,001. It does not show how many copies have been pre-ordered.',
    riepilogo: 'Summary', formato: 'Format', lingua: 'Preferred language', paese: 'Country', lista: 'Mailing list',
    si: 'yes', no: 'no', ebook: 'e-book', cartaceo: 'print',
    gratis: 'Pre-ordering is free and with no obligation: no payment. We will write to you as soon as the book is published.',
    annulla: 'Want to cancel, change your details or leave the mailing list? Just reply to this e-mail.',
    firma: 'Carlo Riva and Nora'
  },
  fr: {
    abbrev: 'N°',
    oggetto: 'Précommande n° {n} — Il cervello (ci) mente',
    titolo: 'Réservez aujourd’hui. Lisez demain.',
    ciao: 'Bonjour {nome},',
    grazie: 'merci ! Votre exemplaire de « Il cervello (ci) mente » est réservé.',
    numero: 'Votre numéro de précommande',
    spiega: 'C’est un numéro d’identification : la numérotation des précommandes commence à 50 001. Il n’indique pas le nombre d’exemplaires réservés.',
    riepilogo: 'Récapitulatif', formato: 'Format', lingua: 'Langue préférée', paese: 'Pays', lista: 'Liste de diffusion',
    si: 'oui', no: 'non', ebook: 'livre numérique', cartaceo: 'papier',
    gratis: 'La précommande est gratuite et sans engagement : aucun paiement. Nous vous écrirons dès la parution du livre.',
    annulla: 'Pour annuler, modifier vos données ou quitter la liste de diffusion, répondez simplement à cet e-mail.',
    firma: 'Carlo Riva et Nora'
  },
  es: {
    abbrev: 'N.º',
    oggetto: 'Reserva n.º {n} — Il cervello (ci) mente',
    titolo: 'Resérvalo hoy. Léelo mañana.',
    ciao: 'Hola, {nome}:',
    grazie: '¡gracias! Tu ejemplar de «Il cervello (ci) mente» está reservado.',
    numero: 'Tu número de reserva',
    spiega: 'Es un número identificativo: la numeración de las reservas empieza en 50.001. No indica cuántos ejemplares se han reservado.',
    riepilogo: 'Resumen', formato: 'Formato', lingua: 'Idioma preferido', paese: 'País', lista: 'Lista de correo',
    si: 'sí', no: 'no', ebook: 'libro electrónico', cartaceo: 'papel',
    gratis: 'La reserva es gratuita y sin compromiso: no hay que pagar nada. Te escribiremos en cuanto se publique el libro.',
    annulla: '¿Quieres cancelar la reserva, cambiar tus datos o salir de la lista de correo? Responde a este correo.',
    firma: 'Carlo Riva y Nora'
  },
  de: {
    abbrev: 'Nr.',
    oggetto: 'Vorbestellung Nr. {n} — Il cervello (ci) mente',
    titolo: 'Heute vorbestellen. Morgen lesen.',
    ciao: 'Hallo {nome},',
    grazie: 'vielen Dank! Dein Exemplar von „Il cervello (ci) mente“ ist reserviert.',
    numero: 'Deine Vorbestellnummer',
    spiega: 'Das ist eine Kennnummer: Die Nummerierung der Vorbestellungen beginnt bei 50.001. Sie zeigt nicht, wie viele Exemplare vorbestellt wurden.',
    riepilogo: 'Übersicht', formato: 'Format', lingua: 'Bevorzugte Sprache', paese: 'Land', lista: 'Mailingliste',
    si: 'ja', no: 'nein', ebook: 'E-Book', cartaceo: 'gedrucktes Buch',
    gratis: 'Die Vorbestellung ist kostenlos und unverbindlich: keine Zahlung. Wir schreiben dir, sobald das Buch erscheint.',
    annulla: 'Du möchtest stornieren, deine Daten ändern oder dich von der Mailingliste abmelden? Antworte einfach auf diese E-Mail.',
    firma: 'Carlo Riva und Nora'
  }
};
var NOMI_LINGUE = { it: 'Italiano', en: 'English', fr: 'Français', es: 'Español', de: 'Deutsch' };
var LOCALI = { it: 'it-IT', en: 'en-GB', fr: 'fr-FR', es: 'es-ES', de: 'de-DE' };

function formattaNumero_(n, lingua) {
  var s = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u0001');
  var sep = lingua === 'en' ? ',' : lingua === 'fr' ? ' ' : '.';
  return s.replace(/\u0001/g, sep);
}

function esc_(s) {
  return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
}

function senzaApice_(v) { v = String(v); return v.charAt(0) === "'" ? v.slice(1) : v; }

function componiEmail_(p) {
  var t = TESTI_EMAIL[p.lingua] || TESTI_EMAIL.it;
  var n = formattaNumero_(p.numero, p.lingua);
  var nomePaese = p.paese;
  var righe = [
    [t.formato, p.formato === 'ebook' ? t.ebook : t.cartaceo],
    [t.lingua, NOMI_LINGUE[p.linguaPreferita] || p.linguaPreferita],
    [t.paese, nomePaese],
    [t.lista, p.mailingList ? t.si : t.no]
  ];
  var testo = [
    t.titolo, '', t.ciao.replace('{nome}', p.nome), t.grazie, '',
    t.numero + ': ' + n, t.spiega, '',
    t.riepilogo + ':'
  ].concat(righe.map(function (r) { return '- ' + r[0] + ': ' + r[1]; }))
    .concat(['', t.gratis, t.annulla, '', t.firma, CONFIG.SITO]).join('\n');
  var html =
    '<div style="background:#120e0c;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">' +
    '<div style="max-width:560px;margin:0 auto;background:#1c130f;border:1px solid #5d3b27;border-radius:14px;padding:28px 24px;color:#f4e4cf">' +
    '<p style="margin:0 0 6px;font:700 11px/1.4 Courier New,monospace;letter-spacing:.14em;color:#f5aa70">IL CERVELLO (CI) MENTE</p>' +
    '<h1 style="margin:0 0 18px;font:800 28px/1.05 Arial Narrow,Arial,sans-serif;color:#f4dfcc">' + esc_(t.titolo) + '</h1>' +
    '<p style="margin:0 0 6px;font-size:15px;line-height:1.6">' + esc_(t.ciao.replace('{nome}', p.nome)) + '</p>' +
    '<p style="margin:0 0 20px;font-size:15px;line-height:1.6">' + esc_(t.grazie) + '</p>' +
    '<div style="background:#ed5819;color:#fff;border-radius:10px;padding:16px 18px;margin:0 0 10px">' +
    '<div style="font:700 11px/1.3 Courier New,monospace;letter-spacing:.1em;text-transform:uppercase">' + esc_(t.numero) + '</div>' +
    '<div style="font:800 40px/1.1 Arial Narrow,Arial,sans-serif;letter-spacing:.02em">' + esc_(t.abbrev + ' ' + n) + '</div></div>' +
    '<p style="margin:0 0 22px;font-size:13px;line-height:1.55;color:#e2bea3">' + esc_(t.spiega) + '</p>' +
    '<p style="margin:0 0 6px;font:700 12px/1.3 Courier New,monospace;letter-spacing:.08em;color:#f5aa70;text-transform:uppercase">' + esc_(t.riepilogo) + '</p>' +
    '<table role="presentation" style="border-collapse:collapse;width:100%;font-size:14px;margin:0 0 20px">' +
    righe.map(function (r) {
      return '<tr><td style="padding:6px 0;border-bottom:1px solid #4c3125;color:#c9a98c">' + esc_(r[0]) +
        '</td><td style="padding:6px 0;border-bottom:1px solid #4c3125;text-align:right">' + esc_(r[1]) + '</td></tr>';
    }).join('') + '</table>' +
    '<p style="margin:0 0 10px;font-size:14px;line-height:1.6">' + esc_(t.gratis) + '</p>' +
    '<p style="margin:0 0 22px;font-size:13px;line-height:1.6;color:#e2bea3">' + esc_(t.annulla) + '</p>' +
    '<p style="margin:0;font-size:14px">' + esc_(t.firma) + '<br><a href="' + CONFIG.SITO + '" style="color:#f5aa70">www.ilcervellocimente.com</a></p>' +
    '</div></div>';
  return { oggetto: t.oggetto.replace('{n}', n), testo: testo, html: html };
}

function nomePaese_(codice, lingua) {
  // Apps Script non ha Intl.DisplayNames completo: si usa il codice ISO se manca la traduzione.
  try {
    if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
      return new Intl.DisplayNames([LOCALI[lingua] || 'it-IT'], { type: 'region' }).of(codice) || codice;
    }
  } catch (x) {}
  return codice;
}

function inviaConferma_(sh, riga) {
  var v = sh.getRange(riga, 1, 1, COLONNE.length).getValues()[0];
  var cellaStato = sh.getRange(riga, C['E-mail di conferma']);
  if (v[C['Stato'] - 1] !== 'attiva') return 'non_inviata';
  if (MailApp.getRemainingDailyQuota() < 1) { cellaStato.setValue('in attesa'); return 'in_attesa'; }
  var lingua = v[C['Lingua del sito'] - 1] || 'it';
  var m = componiEmail_({
    numero: v[C['Numero'] - 1], lingua: lingua, nome: senzaApice_(v[C['Nome e cognome'] - 1]),
    formato: v[C['Formato'] - 1], linguaPreferita: v[C['Lingua preferita'] - 1],
    paese: nomePaese_(v[C['Paese'] - 1], lingua), mailingList: v[C['Mailing list'] - 1] === 'sì'
  });
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
/* Area amministrativa                                                 */
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

function doGet() {
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
  var ultimoNumero = Number(PropertiesService.getScriptProperties().getProperty('ULTIMO_NUMERO') || CONFIG.NUMERO_INIZIALE);
  return {
    aggiornato: Utilities.formatDate(new Date(), 'Europe/Rome', 'dd/MM/yyyy HH:mm'),
    numeroIniziale: CONFIG.NUMERO_INIZIALE,
    ultimoNumero: ultimoNumero,
    quotaEmail: MailApp.getRemainingDailyQuota(),
    colonne: COLONNE,
    righe: righe.map(function (r) {
      return r.map(function (v, i) {
        if (Object.prototype.toString.call(v) === '[object Date]') return Utilities.formatDate(v, 'Europe/Rome', 'yyyy-MM-dd HH:mm:ss');
        return i === C['Numero'] - 1 ? Number(v) : senzaApice_(v);
      });
    })
  };
}

/** Annulla o riattiva una prenotazione (il numero resta assegnato e non viene riutilizzato). */
function cambiaStato(numero, stato) {
  if (!eAmministratore_()) throw new Error('Accesso riservato');
  if (['attiva', 'annullata'].indexOf(stato) < 0) throw new Error('Stato non valido');
  var sh = foglio_();
  var ultima = sh.getLastRow();
  if (ultima < 2) return false;
  var cella = sh.getRange(2, C['Numero'], ultima - 1, 1).createTextFinder(String(numero)).matchEntireCell(true).findNext();
  if (!cella) return false;
  sh.getRange(cella.getRow(), C['Stato']).setValue(stato);
  return true;
}

function include(nome) { return HtmlService.createHtmlOutputFromFile(nome).getContent(); }
