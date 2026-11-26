/* IL CERVELLO (CI) MENTE — «Prenota il libro» in fondo alla pagina principale (26/11/2026)
   Pulsante → modulo nella stessa pagina (solo e-mail) → conferma con il riferimento, mostrata solo dopo il salvataggio.
   5 lingue. Protezioni: pulsante bloccato durante l'invio, stesso ID richiesta nei tentativi ripetuti
   (il servizio restituisce lo stesso riferimento invece di crearne un altro). Nessun limite: le prenotazioni restano sempre aperte. */
(function () {
  'use strict';
  var T = {
    it: {
      kicker: '08 / IL LIBRO · PRENOTAZIONE', title: 'Prenota oggi.<em>Leggi domani.</em>',
      text: 'Entra a far parte dei primi lettori. Prenota la tua copia e ricevila non appena sarà pubblicata.',
      button: 'PRENOTA IL LIBRO', note: 'GRATUITA E SENZA IMPEGNO · NESSUN PAGAMENTO',
      email: 'Il tuo indirizzo e-mail *', placeholder: 'nome@esempio.it',
      privacyLine: 'Inviando la prenotazione dichiari di aver letto l’<a href="#informativa-prenotazione">informativa privacy</a>.',
      submit: 'CONFERMA LA PRENOTAZIONE', sending: 'SALVATAGGIO IN CORSO…', retry: 'RIPROVA',
      errEmail: 'Inserisci un indirizzo e-mail valido.',
      errServer: 'Non siamo riusciti a salvare la prenotazione. Nessun dato è andato perso: premi «Riprova».',
      errBusy: 'In questo momento arrivano molte prenotazioni. Attendi qualche secondo e premi «Riprova».',
      errCheck: 'Non siamo riusciti a verificare l’invio. Attendi qualche secondo e premi «Riprova».',
      notOpen: 'Le prenotazioni apriranno a breve: il modulo non è ancora attivo.',
      doneKicker: 'PRENOTAZIONE CONFERMATA', doneTitle: 'Grazie! La tua copia è prenotata.', doneLabel: 'Il tuo riferimento',
      doneNote: 'Conserva questo riferimento. Non indica quante copie sono state prenotate.',
      mailSent: 'Ti abbiamo inviato un’e-mail di conferma a {email}. Se non la trovi, guarda nella cartella Spam e segnala «Non è spam».', mailLater: 'L’e-mail di conferma a {email} partirà entro poche ore.',
      dupTitle: 'Hai già prenotato una copia.', dupText: 'Con l’indirizzo {email} esiste già una prenotazione: ti abbiamo rinviato per e-mail il tuo riferimento.',
      privacyTitle: 'Informativa privacy sulla prenotazione',
      privacyBody:
        '<p><strong>Titolare:</strong> Carlo Riva — <a href="mailto:ilcervellocimente@gmail.com">ilcervellocimente@gmail.com</a>.</p>' +
        '<p><strong>Dati raccolti:</strong> indirizzo e-mail, riferimento della prenotazione, data e ora, lingua del sito usata e un codice tecnico dell’invio (serve a evitare prenotazioni doppie). Non chiediamo nome né dati di pagamento.</p>' +
        '<p><strong>Perché:</strong> registrare la prenotazione, assegnarti il riferimento, inviarti l’e-mail di conferma e avvisarti quando il libro sarà pubblicato (base giuridica: la tua richiesta, art. 6.1.b GDPR). Nessuna newsletter e nessun uso pubblicitario.</p>' +
        '<p><strong>Dove sono conservati:</strong> in un Foglio Google ad accesso riservato dell’account del progetto; le e-mail partono da Gmail. Google agisce come fornitore del servizio e può trattare dati anche fuori dall’Unione europea, con le garanzie previste (EU-U.S. Data Privacy Framework e clausole contrattuali standard). I dati non vengono venduti né ceduti ad altri.</p>' +
        '<p><strong>Per quanto tempo:</strong> fino a 12 mesi dopo l’uscita del libro, poi vengono cancellati.</p>' +
        '<p><strong>I tuoi diritti:</strong> accesso, rettifica, cancellazione, limitazione, portabilità e opposizione, scrivendo all’indirizzo sopra o rispondendo all’e-mail di conferma. Puoi presentare reclamo al Garante per la protezione dei dati personali.</p>'
    },
    en: {
      kicker: '08 / THE BOOK · PRE-ORDER', title: 'Pre-order today.<em>Read tomorrow.</em>',
      text: 'Be one of the first readers. Pre-order your copy and get it as soon as it is published.',
      button: 'PRE-ORDER THE BOOK', note: 'FREE AND WITH NO OBLIGATION · NO PAYMENT',
      email: 'Your e-mail address *', placeholder: 'name@example.com',
      privacyLine: 'By sending the pre-order you confirm you have read the <a href="#informativa-prenotazione">privacy notice</a>.',
      submit: 'CONFIRM PRE-ORDER', sending: 'SAVING…', retry: 'TRY AGAIN',
      errEmail: 'Please enter a valid e-mail address.',
      errServer: 'We could not save your pre-order. Nothing has been lost: press “Try again”.',
      errBusy: 'Lots of pre-orders are arriving right now. Wait a few seconds and press “Try again”.',
      errCheck: 'We could not verify the submission. Wait a few seconds and press “Try again”.',
      notOpen: 'Pre-orders will open soon: the form is not active yet.',
      doneKicker: 'PRE-ORDER CONFIRMED', doneTitle: 'Thank you! Your copy is reserved.', doneLabel: 'Your reference',
      doneNote: 'Please keep this reference. It does not show how many copies have been pre-ordered.',
      mailSent: 'We have sent a confirmation e-mail to {email}. If you can’t find it, check your Spam folder and mark it as «Not spam».', mailLater: 'The confirmation e-mail to {email} will be sent within a few hours.',
      dupTitle: 'You have already pre-ordered a copy.', dupText: 'There is already a pre-order for {email}: we have sent your reference to you again by e-mail.',
      privacyTitle: 'Privacy notice for pre-orders',
      privacyBody:
        '<p><strong>Controller:</strong> Carlo Riva — <a href="mailto:ilcervellocimente@gmail.com">ilcervellocimente@gmail.com</a>.</p>' +
        '<p><strong>Data collected:</strong> e-mail address, pre-order reference, date and time, website language used and a technical submission code (used to prevent double pre-orders). We do not ask for your name or payment details.</p>' +
        '<p><strong>Why:</strong> to record your pre-order, assign your reference, send the confirmation e-mail and tell you when the book is published (legal basis: your request, Art. 6(1)(b) GDPR). No newsletter and no advertising use.</p>' +
        '<p><strong>Where it is stored:</strong> in a restricted-access Google Sheet of the project account; e-mails are sent through Gmail. Google acts as service provider and may process data outside the European Union with the required safeguards (EU-U.S. Data Privacy Framework and standard contractual clauses). Data is never sold or passed on to others.</p>' +
        '<p><strong>How long:</strong> until 12 months after the book is published, then it is deleted.</p>' +
        '<p><strong>Your rights:</strong> access, rectification, erasure, restriction, portability and objection, by writing to the address above or replying to the confirmation e-mail. You may lodge a complaint with a data protection authority (in Italy, the Garante per la protezione dei dati personali).</p>'
    },
    fr: {
      kicker: '08 / LE LIVRE · RÉSERVATION', title: 'Réservez aujourd’hui.<em>Lisez demain.</em>',
      text: 'Rejoignez les premiers lecteurs. Réservez votre exemplaire et recevez-le dès sa parution.',
      button: 'RÉSERVER LE LIVRE', note: 'GRATUIT ET SANS ENGAGEMENT · AUCUN PAIEMENT',
      email: 'Votre adresse e-mail *', placeholder: 'nom@exemple.fr',
      privacyLine: 'En envoyant la réservation, vous confirmez avoir lu la <a href="#informativa-prenotazione">politique de confidentialité</a>.',
      submit: 'CONFIRMER LA RÉSERVATION', sending: 'ENREGISTREMENT…', retry: 'RÉESSAYER',
      errEmail: 'Indiquez une adresse e-mail valide.',
      errServer: 'Nous n’avons pas pu enregistrer votre réservation. Rien n’est perdu : appuyez sur « Réessayer ».',
      errBusy: 'Beaucoup de réservations arrivent en ce moment. Patientez quelques secondes et appuyez sur « Réessayer ».',
      errCheck: 'Nous n’avons pas pu vérifier l’envoi. Patientez quelques secondes et appuyez sur « Réessayer ».',
      notOpen: 'Les réservations ouvriront bientôt : le formulaire n’est pas encore actif.',
      doneKicker: 'RÉSERVATION CONFIRMÉE', doneTitle: 'Merci ! Votre exemplaire est réservé.', doneLabel: 'Votre référence',
      doneNote: 'Conservez cette référence. Elle n’indique pas le nombre d’exemplaires réservés.',
      mailSent: 'Nous avons envoyé un e-mail de confirmation à {email}. Si vous ne le trouvez pas, regardez dans le dossier Spam et signalez-le comme « Non-spam ».', mailLater: 'L’e-mail de confirmation à {email} partira d’ici quelques heures.',
      dupTitle: 'Vous avez déjà réservé un exemplaire.', dupText: 'Une réservation existe déjà pour {email} : nous vous avons renvoyé votre référence par e-mail.',
      privacyTitle: 'Politique de confidentialité de la réservation',
      privacyBody:
        '<p><strong>Responsable du traitement :</strong> Carlo Riva — <a href="mailto:ilcervellocimente@gmail.com">ilcervellocimente@gmail.com</a>.</p>' +
        '<p><strong>Données collectées :</strong> adresse e-mail, référence de la réservation, date et heure, langue du site utilisée et un code technique de l’envoi (pour éviter les doubles réservations). Nous ne demandons ni votre nom ni de données de paiement.</p>' +
        '<p><strong>Finalités :</strong> enregistrer la réservation, vous attribuer la référence, envoyer l’e-mail de confirmation et vous prévenir de la parution du livre (base légale : votre demande, art. 6.1.b RGPD). Pas de newsletter ni d’usage publicitaire.</p>' +
        '<p><strong>Hébergement :</strong> dans une feuille Google à accès restreint du compte du projet ; les e-mails partent de Gmail. Google agit comme prestataire et peut traiter des données hors de l’Union européenne avec les garanties prévues (EU-U.S. Data Privacy Framework et clauses contractuelles types). Les données ne sont ni vendues ni cédées.</p>' +
        '<p><strong>Durée :</strong> jusqu’à 12 mois après la parution du livre, puis elles sont effacées.</p>' +
        '<p><strong>Vos droits :</strong> accès, rectification, effacement, limitation, portabilité et opposition, en écrivant à l’adresse ci-dessus ou en répondant à l’e-mail de confirmation. Vous pouvez introduire une réclamation auprès d’une autorité de protection des données (en Italie, le Garante per la protezione dei dati personali).</p>'
    },
    es: {
      kicker: '08 / EL LIBRO · RESERVA', title: 'Resérvalo hoy.<em>Léelo mañana.</em>',
      text: 'Únete a los primeros lectores. Reserva tu ejemplar y recíbelo en cuanto se publique.',
      button: 'RESERVAR EL LIBRO', note: 'GRATIS Y SIN COMPROMISO · SIN PAGO',
      email: 'Tu dirección de correo electrónico *', placeholder: 'nombre@ejemplo.es',
      privacyLine: 'Al enviar la reserva confirmas que has leído la <a href="#informativa-prenotazione">información sobre privacidad</a>.',
      submit: 'CONFIRMAR LA RESERVA', sending: 'GUARDANDO…', retry: 'REINTENTAR',
      errEmail: 'Introduce una dirección de correo válida.',
      errServer: 'No hemos podido guardar tu reserva. No se ha perdido nada: pulsa «Reintentar».',
      errBusy: 'Ahora mismo llegan muchas reservas. Espera unos segundos y pulsa «Reintentar».',
      errCheck: 'No hemos podido verificar el envío. Espera unos segundos y pulsa «Reintentar».',
      notOpen: 'Las reservas se abrirán pronto: el formulario todavía no está activo.',
      doneKicker: 'RESERVA CONFIRMADA', doneTitle: '¡Gracias! Tu ejemplar está reservado.', doneLabel: 'Tu referencia',
      doneNote: 'Guarda esta referencia. No indica cuántos ejemplares se han reservado.',
      mailSent: 'Te hemos enviado un correo de confirmación a {email}. Si no lo encuentras, mira en la carpeta de Spam y márcalo como «No es spam».', mailLater: 'El correo de confirmación a {email} saldrá en unas horas.',
      dupTitle: 'Ya has reservado un ejemplar.', dupText: 'Ya existe una reserva para {email}: te hemos reenviado tu referencia por correo.',
      privacyTitle: 'Información sobre privacidad de la reserva',
      privacyBody:
        '<p><strong>Responsable:</strong> Carlo Riva — <a href="mailto:ilcervellocimente@gmail.com">ilcervellocimente@gmail.com</a>.</p>' +
        '<p><strong>Datos recogidos:</strong> dirección de correo, referencia de la reserva, fecha y hora, idioma del sitio usado y un código técnico del envío (sirve para evitar reservas dobles). No pedimos tu nombre ni datos de pago.</p>' +
        '<p><strong>Para qué:</strong> registrar la reserva, asignarte la referencia, enviarte el correo de confirmación y avisarte cuando se publique el libro (base jurídica: tu solicitud, art. 6.1.b RGPD). Sin boletines ni uso publicitario.</p>' +
        '<p><strong>Dónde se guardan:</strong> en una hoja de Google de acceso restringido de la cuenta del proyecto; los correos salen de Gmail. Google actúa como proveedor del servicio y puede tratar datos fuera de la Unión Europea con las garantías previstas (EU-U.S. Data Privacy Framework y cláusulas contractuales tipo). Los datos no se venden ni se ceden.</p>' +
        '<p><strong>Durante cuánto tiempo:</strong> hasta 12 meses después de la publicación del libro; después se borran.</p>' +
        '<p><strong>Tus derechos:</strong> acceso, rectificación, supresión, limitación, portabilidad y oposición, escribiendo a la dirección indicada o respondiendo al correo de confirmación. Puedes presentar una reclamación ante una autoridad de protección de datos (en Italia, el Garante per la protezione dei dati personali).</p>'
    },
    de: {
      kicker: '08 / DAS BUCH · VORBESTELLUNG', title: 'Heute vorbestellen.<em>Morgen lesen.</em>',
      text: 'Gehöre zu den ersten Leserinnen und Lesern. Bestelle dein Exemplar vor und erhalte es, sobald es erscheint.',
      button: 'BUCH VORBESTELLEN', note: 'KOSTENLOS UND UNVERBINDLICH · KEINE ZAHLUNG',
      email: 'Deine E-Mail-Adresse *', placeholder: 'name@beispiel.de',
      privacyLine: 'Mit dem Absenden bestätigst du, die <a href="#informativa-prenotazione">Datenschutzhinweise</a> gelesen zu haben.',
      submit: 'VORBESTELLUNG BESTÄTIGEN', sending: 'WIRD GESPEICHERT…', retry: 'ERNEUT VERSUCHEN',
      errEmail: 'Bitte gib eine gültige E-Mail-Adresse ein.',
      errServer: 'Deine Vorbestellung konnte nicht gespeichert werden. Es ist nichts verloren: Tippe auf „Erneut versuchen“.',
      errBusy: 'Gerade kommen sehr viele Vorbestellungen an. Warte ein paar Sekunden und tippe auf „Erneut versuchen“.',
      errCheck: 'Das Absenden konnte nicht überprüft werden. Warte ein paar Sekunden und tippe auf „Erneut versuchen“.',
      notOpen: 'Die Vorbestellung öffnet in Kürze: Das Formular ist noch nicht aktiv.',
      doneKicker: 'VORBESTELLUNG BESTÄTIGT', doneTitle: 'Danke! Dein Exemplar ist reserviert.', doneLabel: 'Deine Referenz',
      doneNote: 'Bewahre diese Referenz auf. Sie zeigt nicht, wie viele Exemplare vorbestellt wurden.',
      mailSent: 'Wir haben dir eine Bestätigung an {email} geschickt. Falls du sie nicht findest, sieh im Spam-Ordner nach und markiere sie als „Kein Spam“.', mailLater: 'Die Bestätigung an {email} wird in den nächsten Stunden verschickt.',
      dupTitle: 'Du hast bereits ein Exemplar vorbestellt.', dupText: 'Für {email} gibt es bereits eine Vorbestellung: Wir haben dir deine Referenz noch einmal per E-Mail geschickt.',
      privacyTitle: 'Datenschutzhinweise zur Vorbestellung',
      privacyBody:
        '<p><strong>Verantwortlicher:</strong> Carlo Riva — <a href="mailto:ilcervellocimente@gmail.com">ilcervellocimente@gmail.com</a>.</p>' +
        '<p><strong>Erhobene Daten:</strong> E-Mail-Adresse, Referenz der Vorbestellung, Datum und Uhrzeit, verwendete Sprache der Website und ein technischer Code des Absendens (verhindert doppelte Vorbestellungen). Wir fragen weder nach deinem Namen noch nach Zahlungsdaten.</p>' +
        '<p><strong>Zweck:</strong> die Vorbestellung zu erfassen, dir die Referenz zuzuweisen, die Bestätigung zu senden und dich bei Erscheinen des Buches zu benachrichtigen (Rechtsgrundlage: deine Anfrage, Art. 6 Abs. 1 lit. b DSGVO). Kein Newsletter, keine Werbung.</p>' +
        '<p><strong>Speicherort:</strong> in einer zugriffsbeschränkten Google-Tabelle des Projektkontos; E-Mails werden über Gmail versendet. Google handelt als Dienstleister und kann Daten auch außerhalb der Europäischen Union verarbeiten, mit den vorgesehenen Garantien (EU-U.S. Data Privacy Framework und Standardvertragsklauseln). Die Daten werden weder verkauft noch weitergegeben.</p>' +
        '<p><strong>Speicherdauer:</strong> bis 12 Monate nach Erscheinen des Buches, danach werden sie gelöscht.</p>' +
        '<p><strong>Deine Rechte:</strong> Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch – per E-Mail an die obige Adresse oder als Antwort auf die Bestätigung. Du kannst dich bei einer Datenschutzbehörde beschweren (in Italien beim Garante per la protezione dei dati personali).</p>'
    }
  };
  var PREFISSO = { it: 'N. ', en: 'No. ', fr: 'N° ', es: 'N.º ', de: 'Nr. ' };

  var lang = window.NORA_LANG || document.documentElement.lang || 'it';
  if (!T[lang]) lang = 'it';
  var t = T[lang];
  var box = document.getElementById('prenota');
  if (!box) return;
  var $ = function (s) { return box.querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  box.querySelectorAll('[data-pr]').forEach(function (el) { var k = el.getAttribute('data-pr'); if (t[k] != null) el.innerHTML = t[k]; });
  $('#pr-email').setAttribute('placeholder', t.placeholder);

  var apri = $('#prenota-apri'), modulo = $('#prenota-modulo'), form = $('#pr-form'), campo = $('#pr-email');
  var stato = $('#pr-status'), bottone = $('#pr-submit'), errEmail = $('#pr-err-email');
  var api = String(window.PRENOTA_API || '').trim();
  var trasporto = window.PRENOTA_TRASPORTO || null; // solo anteprima: servizio simulato nel browser
  var attivo = !!(api || trasporto);
  var apertoAlle = 0, inviando = false, finito = false, idRichiesta = '', emailRichiesta = '';

  function nuovoId() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    var s = ''; for (var i = 0; i < 4; i++) s += Math.random().toString(36).slice(2, 10);
    return (s + Date.now().toString(36)).slice(0, 40);
  }
  function formattaNumero(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'en' ? ',' : lang === 'fr' ? ' ' : '.');
  }
  function messaggio(testo, tipo) { stato.textContent = testo; stato.className = 'pr-status' + (tipo ? ' is-' + tipo : ''); }

  function apriModulo(focus) {
    if (apri.hidden) return;
    modulo.hidden = false;
    apri.setAttribute('aria-expanded', 'true');
    if (!apertoAlle) apertoAlle = Date.now();
    if (!attivo) messaggio(t.notOpen, 'info');
    if (focus !== false) { try { campo.focus({ preventScroll: true }); } catch (e) { campo.focus(); } modulo.scrollIntoView({ block: 'nearest' }); }
  }
  apri.addEventListener('click', function () { apriModulo(); });

  // Link «informativa privacy» (anche dall'informativa generale del sito): apre il testo dedicato.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#informativa-prenotazione"]');
    if (!a) return;
    e.preventDefault();
    var chiudiModale = document.querySelector('#privacy-modal:not([hidden]) [data-close]');
    if (chiudiModale) chiudiModale.click();
    var d = document.getElementById('informativa-prenotazione');
    d.open = true;
    setTimeout(function () { d.scrollIntoView({ block: 'start' }); }, 0);
  });
  if (location.hash === '#informativa-prenotazione') document.getElementById('informativa-prenotazione').open = true;

  function invia(dati) {
    if (trasporto) return trasporto.prenota(dati);
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 30000) : 0;
    // Corpo text/plain: evita la richiesta preliminare CORS, non supportata da Apps Script.
    return fetch(api, { method: 'POST', body: JSON.stringify(dati), redirect: 'follow', signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { clearTimeout(timer); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); },
        function (e) { clearTimeout(timer); throw e; });
  }

  function attesa(si) {
    inviando = si;
    bottone.disabled = si;
    bottone.querySelector('span').textContent = si ? t.sending : (idRichiesta ? t.retry : t.submit);
    form.setAttribute('aria-busy', si ? 'true' : 'false');
    campo.readOnly = si;
  }

  function successo(r, email) {
    finito = true;
    var done = $('#pr-done');
    if (r.duplicato) {
      $('#pr-done-title').textContent = t.dupTitle;
      $('#pr-done-ref').hidden = true;
      $('#pr-done-mail').innerHTML = esc(t.dupText).replace('{email}', '<strong>' + esc(email) + '</strong>');
    } else {
      $('#pr-done-title').textContent = t.doneTitle;
      $('#pr-done-ref').hidden = false;
      $('#pr-done-number').textContent = PREFISSO[lang] + formattaNumero(r.numero);
      $('#pr-done-mail').innerHTML = r.ripetuta ? '' : esc(r.email === 'inviata' ? t.mailSent : t.mailLater).replace('{email}', '<strong>' + esc(email) + '</strong>');
    }
    form.hidden = true;
    done.hidden = false;
    done.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (inviando || finito) return; // doppio clic, Invio ripetuto
    var email = campo.value.trim();
    var valida = /^[a-z0-9][a-z0-9._%+'-]*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i.test(email);
    errEmail.hidden = valida;
    campo.setAttribute('aria-invalid', valida ? 'false' : 'true');
    if (!valida) { messaggio(''); campo.focus(); return; }
    if (!attivo) { messaggio(t.notOpen, 'info'); return; }
    // Stesso indirizzo = stessa richiesta: se il primo tentativo era stato salvato, il servizio restituisce lo stesso riferimento.
    if (!idRichiesta || emailRichiesta !== email.toLowerCase()) { idRichiesta = nuovoId(); emailRichiesta = email.toLowerCase(); }
    messaggio('');
    attesa(true);
    var dati = { email: email, linguaSito: lang, richiesta: idRichiesta, sito: String(form.elements.sito.value || ''), tempo: Date.now() - (apertoAlle || Date.now()) };
    invia(dati).then(function (r) {
      if (r && r.ok && (r.numero || r.duplicato)) { attesa(false); successo(r, email); return; }
      attesa(false);
      var err = r && r.errore;
      if (err === 'campi') { errEmail.hidden = false; campo.setAttribute('aria-invalid', 'true'); messaggio(t.errEmail, 'error'); return; }
      messaggio(err === 'limite' || err === 'occupato' ? t.errBusy : err === 'verifica' ? t.errCheck : t.errServer, 'error');
    }).catch(function () {
      attesa(false);
      messaggio(t.errServer, 'error');
    });
  });

  if (location.hash === '#prenota-modulo') apriModulo(false);
})();
