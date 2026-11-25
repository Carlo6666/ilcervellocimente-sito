/* IL CERVELLO (CI) MENTE — pagina di prenotazione del libro (25/11/2026)
   5 lingue, validazione, antispam (campo nascosto + tempo minimo), invio al servizio Google Apps Script. */
(function () {
  'use strict';
  var LINGUE = ['it', 'en', 'fr', 'es', 'de'];
  var LOCALI = { it: 'it-IT', en: 'en-GB', fr: 'fr-FR', es: 'es-ES', de: 'de-DE' };
  var aperta = Date.now();

  var T = {
    it: {
      pageTitle: 'Prenota il libro — Il cervello (ci) mente',
      skip: 'Vai al modulo', back: '← TORNA AL SITO', kicker: 'IL LIBRO · PRENOTAZIONE',
      title: 'Prenota oggi.<br><em>Leggi domani.</em>',
      lead: 'Entra a far parte dei primi lettori. Prenota la tua copia e ricevila non appena sarà pubblicata.',
      p1: 'Gratuita e senza impegno: nessun pagamento.', p2: 'Ricevi subito per e-mail il tuo numero di prenotazione.', p3: 'Ti scriviamo appena il libro è pubblicato.',
      numberNote: 'Ogni prenotazione riceve un numero identificativo progressivo che parte da <strong>50.001</strong>. Non è il totale delle copie prenotate.',
      formTitle: 'PRENOTA LA TUA COPIA', required: 'I campi con * sono obbligatori.',
      name: 'Nome e cognome *', email: 'Indirizzo e-mail *', country: 'Paese *', language: 'Lingua preferita *', format: 'Formato *',
      chooseCountry: 'Scegli…', print: 'Cartaceo', ebook: 'E-book',
      list: 'Sì, voglio ricevere anche le novità del progetto (mailing list). Facoltativo, puoi cancellarti quando vuoi.',
      privacy: 'Ho preso visione dell’<a href="#informativa">informativa privacy</a>. *',
      submit: 'PRENOTA LA TUA COPIA', sending: 'INVIO IN CORSO…',
      free: 'Prenotazione gratuita e senza impegno. Nessun pagamento anticipato.',
      errName: 'Scrivi nome e cognome.', errEmail: 'Inserisci un indirizzo e-mail valido.', errCountry: 'Scegli il tuo paese.',
      errLanguage: 'Scegli la lingua.', errFormat: 'Scegli il formato.', errPrivacy: 'Per prenotare conferma di aver letto l’informativa privacy.',
      errFix: 'Controlla i campi evidenziati.',
      errServer: 'Non siamo riusciti a registrare la prenotazione. Riprova tra qualche minuto o scrivici a ilcervellocimente@gmail.com.',
      errBusy: 'In questo momento arrivano molte prenotazioni. Riprova tra qualche minuto.',
      errCheck: 'Non siamo riusciti a verificare l’invio. Attendi qualche secondo e riprova.',
      notOpen: 'Le prenotazioni apriranno a breve: il modulo non è ancora attivo.',
      doneKicker: 'PRENOTAZIONE CONFERMATA', doneTitle: 'Grazie! La tua copia è prenotata.', doneLabel: 'Il tuo numero di prenotazione',
      doneNote: 'È un numero identificativo: la numerazione parte da 50.001 e non indica quante copie sono state prenotate.',
      mailSent: 'Ti abbiamo inviato un’e-mail di conferma a {email}. Se non la trovi, guarda nella posta indesiderata.',
      mailLater: 'L’e-mail di conferma a {email} partirà entro poche ore.',
      dupTitle: 'Hai già prenotato una copia.',
      dupText: 'Con l’indirizzo {email} esiste già una prenotazione: ti abbiamo rinviato per e-mail il tuo numero. Se non la ricevi entro un’ora, scrivici.',
      doneBack: 'TORNA AL SITO', privacyTitle: 'Informativa privacy sulla prenotazione', contact: 'CONTATTI ↗',
      privacyBody:
        '<p><strong>Titolare:</strong> Carlo Riva — <a href="mailto:ilcervellocimente@gmail.com">ilcervellocimente@gmail.com</a>.</p>' +
        '<p><strong>Dati raccolti:</strong> nome e cognome, indirizzo e-mail, paese, lingua preferita, formato (e-book o cartaceo), scelta sulla mailing list, data e ora della prenotazione, lingua del sito usata. Non chiediamo dati di pagamento.</p>' +
        '<p><strong>Perché:</strong> registrare la prenotazione, assegnarti il numero identificativo, inviarti l’e-mail di conferma e avvisarti quando il libro sarà pubblicato (base giuridica: la tua richiesta, art. 6.1.b GDPR). Solo se spunti la casella, anche per inviarti le novità del progetto (consenso, art. 6.1.a GDPR, revocabile in ogni momento). Le statistiche per paese, lingua e formato sono usate solo in forma aggregata.</p>' +
        '<p><strong>Dove sono conservati:</strong> in un Foglio Google dell’account del progetto; le e-mail partono da Gmail. Google agisce come fornitore del servizio e può trattare dati anche fuori dall’Unione europea, con le garanzie previste (EU-U.S. Data Privacy Framework e clausole contrattuali standard). Il sito è pubblicato con GitHub Pages. I dati non vengono venduti né ceduti ad altri.</p>' +
        '<p><strong>Per quanto tempo:</strong> i dati della prenotazione fino a 12 mesi dopo l’uscita del libro; l’iscrizione alla mailing list finché non ti cancelli.</p>' +
        '<p><strong>I tuoi diritti:</strong> accesso, rettifica, cancellazione, limitazione, portabilità, opposizione e revoca del consenso, scrivendo all’indirizzo sopra o rispondendo all’e-mail di conferma. Puoi presentare reclamo al Garante per la protezione dei dati personali.</p>' +
        '<p><strong>Facoltatività:</strong> i campi con * servono per gestire la prenotazione; la mailing list è facoltativa e non cambia nulla per la prenotazione.</p>'
    },
    en: {
      pageTitle: 'Pre-order the book — Il cervello (ci) mente',
      skip: 'Skip to the form', back: '← BACK TO THE WEBSITE', kicker: 'THE BOOK · PRE-ORDER',
      title: 'Pre-order today.<br><em>Read tomorrow.</em>',
      lead: 'Be one of the first readers. Pre-order your copy and get it as soon as it is published.',
      p1: 'Free and with no obligation: no payment.', p2: 'Get your pre-order number by e-mail right away.', p3: 'We will write to you as soon as the book is out.',
      numberNote: 'Every pre-order gets a progressive identification number starting at <strong>50,001</strong>. It is not the total number of copies pre-ordered.',
      formTitle: 'PRE-ORDER YOUR COPY', required: 'Fields marked * are required.',
      name: 'First and last name *', email: 'E-mail address *', country: 'Country *', language: 'Preferred language *', format: 'Format *',
      chooseCountry: 'Choose…', print: 'Print', ebook: 'E-book',
      list: 'Yes, I would also like to receive project news (mailing list). Optional, you can unsubscribe at any time.',
      privacy: 'I have read the <a href="#informativa">privacy notice</a>. *',
      submit: 'PRE-ORDER YOUR COPY', sending: 'SENDING…',
      free: 'Free pre-order with no obligation. No advance payment.',
      errName: 'Please enter your first and last name.', errEmail: 'Please enter a valid e-mail address.', errCountry: 'Please choose your country.',
      errLanguage: 'Please choose a language.', errFormat: 'Please choose a format.', errPrivacy: 'To pre-order, please confirm you have read the privacy notice.',
      errFix: 'Please check the highlighted fields.',
      errServer: 'We could not record your pre-order. Please try again in a few minutes or write to ilcervellocimente@gmail.com.',
      errBusy: 'Lots of pre-orders are arriving right now. Please try again in a few minutes.',
      errCheck: 'We could not verify the submission. Please wait a few seconds and try again.',
      notOpen: 'Pre-orders will open soon: the form is not active yet.',
      doneKicker: 'PRE-ORDER CONFIRMED', doneTitle: 'Thank you! Your copy is reserved.', doneLabel: 'Your pre-order number',
      doneNote: 'This is an identification number: numbering starts at 50,001 and does not show how many copies have been pre-ordered.',
      mailSent: 'We have sent a confirmation e-mail to {email}. If you cannot find it, check your spam folder.',
      mailLater: 'The confirmation e-mail to {email} will be sent within a few hours.',
      dupTitle: 'You have already pre-ordered a copy.',
      dupText: 'There is already a pre-order for {email}: we have sent your number to you again by e-mail. If it does not arrive within an hour, write to us.',
      doneBack: 'BACK TO THE WEBSITE', privacyTitle: 'Privacy notice for pre-orders', contact: 'CONTACT ↗',
      privacyBody:
        '<p><strong>Controller:</strong> Carlo Riva — <a href="mailto:ilcervellocimente@gmail.com">ilcervellocimente@gmail.com</a>.</p>' +
        '<p><strong>Data collected:</strong> first and last name, e-mail address, country, preferred language, format (e-book or print), mailing-list choice, date and time of the pre-order, website language used. We do not ask for payment details.</p>' +
        '<p><strong>Why:</strong> to record your pre-order, assign your identification number, send the confirmation e-mail and tell you when the book is published (legal basis: your request, Art. 6(1)(b) GDPR). Only if you tick the box, also to send you project news (consent, Art. 6(1)(a) GDPR, which you can withdraw at any time). Statistics by country, language and format are only used in aggregate.</p>' +
        '<p><strong>Where it is stored:</strong> in a Google Sheet of the project account; e-mails are sent through Gmail. Google acts as service provider and may process data outside the European Union with the required safeguards (EU-U.S. Data Privacy Framework and standard contractual clauses). The website is published with GitHub Pages. Data is never sold or passed on to others.</p>' +
        '<p><strong>How long:</strong> pre-order data until 12 months after the book is published; mailing-list membership until you unsubscribe.</p>' +
        '<p><strong>Your rights:</strong> access, rectification, erasure, restriction, portability, objection and withdrawal of consent, by writing to the address above or replying to the confirmation e-mail. You may lodge a complaint with a data protection authority (in Italy, the Garante per la protezione dei dati personali).</p>' +
        '<p><strong>Optional data:</strong> fields marked * are needed to manage the pre-order; the mailing list is optional and does not affect the pre-order.</p>'
    },
    fr: {
      pageTitle: 'Précommander le livre — Il cervello (ci) mente',
      skip: 'Aller au formulaire', back: '← RETOUR AU SITE', kicker: 'LE LIVRE · PRÉCOMMANDE',
      title: 'Réservez aujourd’hui.<br><em>Lisez demain.</em>',
      lead: 'Rejoignez les premiers lecteurs. Réservez votre exemplaire et recevez-le dès sa parution.',
      p1: 'Gratuit et sans engagement : aucun paiement.', p2: 'Recevez tout de suite par e-mail votre numéro de précommande.', p3: 'Nous vous écrivons dès la parution du livre.',
      numberNote: 'Chaque précommande reçoit un numéro d’identification progressif qui commence à <strong>50&#8239;001</strong>. Ce n’est pas le nombre total d’exemplaires réservés.',
      formTitle: 'RÉSERVEZ VOTRE EXEMPLAIRE', required: 'Les champs marqués * sont obligatoires.',
      name: 'Prénom et nom *', email: 'Adresse e-mail *', country: 'Pays *', language: 'Langue préférée *', format: 'Format *',
      chooseCountry: 'Choisir…', print: 'Papier', ebook: 'Livre numérique',
      list: 'Oui, je souhaite aussi recevoir les nouvelles du projet (liste de diffusion). Facultatif, désinscription possible à tout moment.',
      privacy: 'J’ai pris connaissance de la <a href="#informativa">politique de confidentialité</a>. *',
      submit: 'RÉSERVEZ VOTRE EXEMPLAIRE', sending: 'ENVOI EN COURS…',
      free: 'Précommande gratuite et sans engagement. Aucun paiement anticipé.',
      errName: 'Indiquez votre prénom et votre nom.', errEmail: 'Indiquez une adresse e-mail valide.', errCountry: 'Choisissez votre pays.',
      errLanguage: 'Choisissez la langue.', errFormat: 'Choisissez le format.', errPrivacy: 'Pour réserver, confirmez avoir lu la politique de confidentialité.',
      errFix: 'Vérifiez les champs signalés.',
      errServer: 'Nous n’avons pas pu enregistrer votre précommande. Réessayez dans quelques minutes ou écrivez à ilcervellocimente@gmail.com.',
      errBusy: 'Beaucoup de précommandes arrivent en ce moment. Réessayez dans quelques minutes.',
      errCheck: 'Nous n’avons pas pu vérifier l’envoi. Patientez quelques secondes et réessayez.',
      notOpen: 'Les précommandes ouvriront bientôt : le formulaire n’est pas encore actif.',
      doneKicker: 'PRÉCOMMANDE CONFIRMÉE', doneTitle: 'Merci ! Votre exemplaire est réservé.', doneLabel: 'Votre numéro de précommande',
      doneNote: 'C’est un numéro d’identification : la numérotation commence à 50 001 et n’indique pas le nombre d’exemplaires réservés.',
      mailSent: 'Nous avons envoyé un e-mail de confirmation à {email}. Si vous ne le trouvez pas, regardez dans les courriers indésirables.',
      mailLater: 'L’e-mail de confirmation à {email} partira d’ici quelques heures.',
      dupTitle: 'Vous avez déjà réservé un exemplaire.',
      dupText: 'Une précommande existe déjà pour {email} : nous vous avons renvoyé votre numéro par e-mail. S’il n’arrive pas d’ici une heure, écrivez-nous.',
      doneBack: 'RETOUR AU SITE', privacyTitle: 'Politique de confidentialité de la précommande', contact: 'CONTACT ↗',
      privacyBody:
        '<p><strong>Responsable du traitement :</strong> Carlo Riva — <a href="mailto:ilcervellocimente@gmail.com">ilcervellocimente@gmail.com</a>.</p>' +
        '<p><strong>Données collectées :</strong> prénom et nom, adresse e-mail, pays, langue préférée, format (livre numérique ou papier), choix concernant la liste de diffusion, date et heure de la précommande, langue du site utilisée. Aucune donnée de paiement n’est demandée.</p>' +
        '<p><strong>Finalités :</strong> enregistrer la précommande, vous attribuer le numéro d’identification, envoyer l’e-mail de confirmation et vous prévenir de la parution du livre (base légale : votre demande, art. 6.1.b RGPD). Seulement si vous cochez la case, vous envoyer aussi les nouvelles du projet (consentement, art. 6.1.a RGPD, révocable à tout moment). Les statistiques par pays, langue et format ne sont utilisées que de façon agrégée.</p>' +
        '<p><strong>Hébergement :</strong> dans une feuille Google du compte du projet ; les e-mails partent de Gmail. Google agit comme prestataire et peut traiter des données hors de l’Union européenne avec les garanties prévues (EU-U.S. Data Privacy Framework et clauses contractuelles types). Le site est publié avec GitHub Pages. Les données ne sont ni vendues ni cédées.</p>' +
        '<p><strong>Durée :</strong> données de précommande jusqu’à 12 mois après la parution du livre ; inscription à la liste de diffusion jusqu’à votre désinscription.</p>' +
        '<p><strong>Vos droits :</strong> accès, rectification, effacement, limitation, portabilité, opposition et retrait du consentement, en écrivant à l’adresse ci-dessus ou en répondant à l’e-mail de confirmation. Vous pouvez introduire une réclamation auprès d’une autorité de protection des données (en Italie, le Garante per la protezione dei dati personali).</p>' +
        '<p><strong>Caractère facultatif :</strong> les champs marqués * sont nécessaires à la précommande ; la liste de diffusion est facultative et ne change rien à la précommande.</p>'
    },
    es: {
      pageTitle: 'Reserva el libro — Il cervello (ci) mente',
      skip: 'Ir al formulario', back: '← VOLVER A LA WEB', kicker: 'EL LIBRO · RESERVA',
      title: 'Resérvalo hoy.<br><em>Léelo mañana.</em>',
      lead: 'Únete a los primeros lectores. Reserva tu ejemplar y recíbelo en cuanto se publique.',
      p1: 'Gratis y sin compromiso: no pagas nada.', p2: 'Recibe al momento por correo tu número de reserva.', p3: 'Te escribimos en cuanto se publique el libro.',
      numberNote: 'Cada reserva recibe un número identificativo progresivo que empieza en <strong>50.001</strong>. No es el total de ejemplares reservados.',
      formTitle: 'RESERVA TU EJEMPLAR', required: 'Los campos con * son obligatorios.',
      name: 'Nombre y apellidos *', email: 'Correo electrónico *', country: 'País *', language: 'Idioma preferido *', format: 'Formato *',
      chooseCountry: 'Elige…', print: 'Papel', ebook: 'Libro electrónico',
      list: 'Sí, también quiero recibir las novedades del proyecto (lista de correo). Opcional, puedes darte de baja cuando quieras.',
      privacy: 'He leído la <a href="#informativa">información sobre privacidad</a>. *',
      submit: 'RESERVA TU EJEMPLAR', sending: 'ENVIANDO…',
      free: 'Reserva gratuita y sin compromiso. Sin pago por adelantado.',
      errName: 'Escribe tu nombre y apellidos.', errEmail: 'Introduce un correo electrónico válido.', errCountry: 'Elige tu país.',
      errLanguage: 'Elige el idioma.', errFormat: 'Elige el formato.', errPrivacy: 'Para reservar, confirma que has leído la información sobre privacidad.',
      errFix: 'Revisa los campos marcados.',
      errServer: 'No hemos podido registrar la reserva. Inténtalo de nuevo en unos minutos o escríbenos a ilcervellocimente@gmail.com.',
      errBusy: 'Ahora mismo llegan muchas reservas. Inténtalo de nuevo en unos minutos.',
      errCheck: 'No hemos podido verificar el envío. Espera unos segundos e inténtalo de nuevo.',
      notOpen: 'Las reservas se abrirán pronto: el formulario aún no está activo.',
      doneKicker: 'RESERVA CONFIRMADA', doneTitle: '¡Gracias! Tu ejemplar está reservado.', doneLabel: 'Tu número de reserva',
      doneNote: 'Es un número identificativo: la numeración empieza en 50.001 y no indica cuántos ejemplares se han reservado.',
      mailSent: 'Te hemos enviado un correo de confirmación a {email}. Si no lo encuentras, mira en la carpeta de spam.',
      mailLater: 'El correo de confirmación a {email} saldrá en unas horas.',
      dupTitle: 'Ya has reservado un ejemplar.',
      dupText: 'Ya existe una reserva con {email}: te hemos reenviado tu número por correo. Si no llega en una hora, escríbenos.',
      doneBack: 'VOLVER A LA WEB', privacyTitle: 'Información sobre privacidad de la reserva', contact: 'CONTACTO ↗',
      privacyBody:
        '<p><strong>Responsable:</strong> Carlo Riva — <a href="mailto:ilcervellocimente@gmail.com">ilcervellocimente@gmail.com</a>.</p>' +
        '<p><strong>Datos recogidos:</strong> nombre y apellidos, correo electrónico, país, idioma preferido, formato (libro electrónico o papel), elección sobre la lista de correo, fecha y hora de la reserva, idioma de la web utilizado. No pedimos datos de pago.</p>' +
        '<p><strong>Para qué:</strong> registrar la reserva, asignarte el número identificativo, enviarte el correo de confirmación y avisarte cuando se publique el libro (base jurídica: tu solicitud, art. 6.1.b RGPD). Solo si marcas la casilla, también para enviarte las novedades del proyecto (consentimiento, art. 6.1.a RGPD, revocable en cualquier momento). Las estadísticas por país, idioma y formato se usan solo de forma agregada.</p>' +
        '<p><strong>Dónde se guardan:</strong> en una hoja de cálculo de Google de la cuenta del proyecto; los correos salen de Gmail. Google actúa como proveedor del servicio y puede tratar datos fuera de la Unión Europea con las garantías previstas (EU-U.S. Data Privacy Framework y cláusulas contractuales tipo). La web se publica con GitHub Pages. Los datos no se venden ni se ceden a terceros.</p>' +
        '<p><strong>Durante cuánto tiempo:</strong> los datos de la reserva hasta 12 meses después de la publicación del libro; la suscripción a la lista de correo hasta que te des de baja.</p>' +
        '<p><strong>Tus derechos:</strong> acceso, rectificación, supresión, limitación, portabilidad, oposición y retirada del consentimiento, escribiendo a la dirección indicada o respondiendo al correo de confirmación. Puedes presentar una reclamación ante una autoridad de protección de datos (en Italia, el Garante per la protezione dei dati personali).</p>' +
        '<p><strong>Carácter opcional:</strong> los campos con * son necesarios para gestionar la reserva; la lista de correo es opcional y no cambia nada en la reserva.</p>'
    },
    de: {
      pageTitle: 'Buch vorbestellen — Il cervello (ci) mente',
      skip: 'Zum Formular', back: '← ZURÜCK ZUR WEBSITE', kicker: 'DAS BUCH · VORBESTELLUNG',
      title: 'Heute vorbestellen.<br><em>Morgen lesen.</em>',
      lead: 'Gehöre zu den ersten Leserinnen und Lesern. Bestelle dein Exemplar vor und erhalte es, sobald es erscheint.',
      p1: 'Kostenlos und unverbindlich: keine Zahlung.', p2: 'Deine Vorbestellnummer kommt sofort per E-Mail.', p3: 'Wir schreiben dir, sobald das Buch erscheint.',
      numberNote: 'Jede Vorbestellung erhält eine fortlaufende Kennnummer ab <strong>50.001</strong>. Das ist nicht die Gesamtzahl der vorbestellten Exemplare.',
      formTitle: 'EXEMPLAR VORBESTELLEN', required: 'Felder mit * sind Pflichtfelder.',
      name: 'Vor- und Nachname *', email: 'E-Mail-Adresse *', country: 'Land *', language: 'Bevorzugte Sprache *', format: 'Format *',
      chooseCountry: 'Auswählen…', print: 'Gedrucktes Buch', ebook: 'E-Book',
      list: 'Ja, ich möchte auch Neuigkeiten zum Projekt erhalten (Mailingliste). Freiwillig, jederzeit abbestellbar.',
      privacy: 'Ich habe die <a href="#informativa">Datenschutzhinweise</a> gelesen. *',
      submit: 'EXEMPLAR VORBESTELLEN', sending: 'WIRD GESENDET…',
      free: 'Kostenlose und unverbindliche Vorbestellung. Keine Vorauszahlung.',
      errName: 'Bitte Vor- und Nachnamen eingeben.', errEmail: 'Bitte eine gültige E-Mail-Adresse eingeben.', errCountry: 'Bitte dein Land auswählen.',
      errLanguage: 'Bitte die Sprache auswählen.', errFormat: 'Bitte das Format auswählen.', errPrivacy: 'Zum Vorbestellen bitte bestätigen, dass du die Datenschutzhinweise gelesen hast.',
      errFix: 'Bitte die markierten Felder prüfen.',
      errServer: 'Die Vorbestellung konnte nicht gespeichert werden. Bitte in ein paar Minuten erneut versuchen oder an ilcervellocimente@gmail.com schreiben.',
      errBusy: 'Gerade kommen sehr viele Vorbestellungen an. Bitte in ein paar Minuten erneut versuchen.',
      errCheck: 'Das Absenden konnte nicht überprüft werden. Bitte ein paar Sekunden warten und erneut versuchen.',
      notOpen: 'Die Vorbestellung startet in Kürze: Das Formular ist noch nicht aktiv.',
      doneKicker: 'VORBESTELLUNG BESTÄTIGT', doneTitle: 'Danke! Dein Exemplar ist reserviert.', doneLabel: 'Deine Vorbestellnummer',
      doneNote: 'Das ist eine Kennnummer: Die Nummerierung beginnt bei 50.001 und zeigt nicht, wie viele Exemplare vorbestellt wurden.',
      mailSent: 'Wir haben eine Bestätigung an {email} geschickt. Falls du sie nicht findest, sieh im Spam-Ordner nach.',
      mailLater: 'Die Bestätigung an {email} wird in den nächsten Stunden verschickt.',
      dupTitle: 'Du hast bereits ein Exemplar vorbestellt.',
      dupText: 'Für {email} gibt es schon eine Vorbestellung: Wir haben dir deine Nummer erneut per E-Mail geschickt. Falls sie nicht innerhalb einer Stunde ankommt, schreib uns.',
      doneBack: 'ZURÜCK ZUR WEBSITE', privacyTitle: 'Datenschutzhinweise zur Vorbestellung', contact: 'KONTAKT ↗',
      privacyBody:
        '<p><strong>Verantwortlicher:</strong> Carlo Riva — <a href="mailto:ilcervellocimente@gmail.com">ilcervellocimente@gmail.com</a>.</p>' +
        '<p><strong>Erhobene Daten:</strong> Vor- und Nachname, E-Mail-Adresse, Land, bevorzugte Sprache, Format (E-Book oder gedruckt), Entscheidung zur Mailingliste, Datum und Uhrzeit der Vorbestellung, verwendete Sprache der Website. Zahlungsdaten werden nicht abgefragt.</p>' +
        '<p><strong>Zweck:</strong> Vorbestellung erfassen, Kennnummer vergeben, Bestätigung senden und dich über das Erscheinen des Buches informieren (Rechtsgrundlage: deine Anfrage, Art. 6 Abs. 1 lit. b DSGVO). Nur wenn du das Kästchen ankreuzt, auch Neuigkeiten zum Projekt (Einwilligung, Art. 6 Abs. 1 lit. a DSGVO, jederzeit widerrufbar). Statistiken nach Land, Sprache und Format werden nur zusammengefasst genutzt.</p>' +
        '<p><strong>Speicherort:</strong> in einer Google-Tabelle des Projektkontos; E-Mails werden über Gmail versendet. Google ist Dienstleister und kann Daten auch außerhalb der Europäischen Union verarbeiten, mit den vorgesehenen Garantien (EU-U.S. Data Privacy Framework und Standardvertragsklauseln). Die Website wird mit GitHub Pages veröffentlicht. Die Daten werden weder verkauft noch weitergegeben.</p>' +
        '<p><strong>Speicherdauer:</strong> Vorbestelldaten bis 12 Monate nach Erscheinen des Buches; die Mailingliste bis zur Abmeldung.</p>' +
        '<p><strong>Deine Rechte:</strong> Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch und Widerruf der Einwilligung – per E-Mail an die obige Adresse oder als Antwort auf die Bestätigung. Du kannst dich bei einer Datenschutzaufsichtsbehörde beschweren (in Italien: Garante per la protezione dei dati personali).</p>' +
        '<p><strong>Freiwilligkeit:</strong> Felder mit * werden für die Vorbestellung benötigt; die Mailingliste ist freiwillig und ändert nichts an der Vorbestellung.</p>'
    }
  };

  // Stessa logica della pagina principale: ?lang=, poi scelta salvata, poi lingua del browser.
  var q = new URLSearchParams(location.search).get('lang');
  var salvata = null; try { salvata = localStorage.getItem('nora-language'); } catch (e) {}
  var browser = (navigator.language || 'it').slice(0, 2).toLowerCase();
  var lang = LINGUE.indexOf(q) >= 0 ? q : LINGUE.indexOf(salvata) >= 0 ? salvata : LINGUE.indexOf(browser) >= 0 ? browser : 'it';
  var t = T[lang];
  var $ = function (s) { return document.querySelector(s); };

  document.documentElement.lang = lang;
  document.title = t.pageTitle;
  document.querySelectorAll('[data-t]').forEach(function (el) {
    var k = el.getAttribute('data-t');
    if (t[k] != null) el.innerHTML = t[k];
  });
  $('#pr-privacy-body').innerHTML = t.privacyBody;
  $('#pr-year').textContent = String(new Date().getFullYear());
  document.querySelectorAll('[data-href-lang]').forEach(function (a) { a.href = 'index.html?lang=' + lang; });
  var cover = $('#pr-cover-img'); if (cover) cover.src = 'assets/copertina/copertina-' + lang + '.jpg';

  var sel = $('#pr-lang');
  sel.value = lang;
  sel.addEventListener('change', function () {
    try { localStorage.setItem('nora-language', sel.value); } catch (e) {}
    var u = new URL(location.href); u.searchParams.set('lang', sel.value); u.hash = '';
    location.href = u.toString();
  });

  // Paesi (codici ISO 3166-1), nomi nella lingua della pagina.
  var CODICI = ('AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FM FR GA GB GD GE GH GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MH MK ML MM MN MO MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN VU WS XK YE ZA ZM ZW').split(' ');
  var nomi; try { nomi = new Intl.DisplayNames([LOCALI[lang]], { type: 'region' }); } catch (e) { nomi = null; }
  var nomeDi = function (c) { try { return (nomi && nomi.of(c)) || c; } catch (e) { return c; } };
  var paesi = CODICI.map(function (c) { return [c, nomeDi(c)]; }).sort(function (a, b) { return a[1].localeCompare(b[1], LOCALI[lang]); });
  var regione = ((navigator.language || '').split('-')[1] || '').toUpperCase();
  var predefinito = CODICI.indexOf(regione) >= 0 ? regione : ({ it: 'IT', fr: 'FR', es: 'ES', de: 'DE' })[lang] || '';
  var ps = $('#pr-paese');
  ps.innerHTML = '<option value="">' + t.chooseCountry + '</option>' + paesi.map(function (p) {
    return '<option value="' + p[0] + '"' + (p[0] === predefinito ? ' selected' : '') + '>' + p[1].replace(/[<>&]/g, '') + '</option>';
  }).join('');
  $('#pr-lingua').value = lang;

  // Apri l'informativa quando si segue il link.
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href="#informativa"]');
    if (a) { var d = $('#pr-privacy-details'); if (d) d.open = true; }
  });
  if (location.hash === '#informativa') $('#pr-privacy-details').open = true;

  var form = $('#pr-form'), stato = $('#pr-status'), bottone = $('#pr-submit');
  var api = (window.PRENOTA_API || '').trim();
  if (!api) { stato.textContent = t.notOpen; stato.className = 'pr-status is-info'; }

  function mostraErrore(campo, si) {
    var el = $('#err-' + campo); if (el) el.hidden = !si;
    var input = form.querySelector('[name="' + campo + '"]');
    if (input && input.type !== 'radio') input.setAttribute('aria-invalid', si ? 'true' : 'false');
    if (input && si) input.setAttribute('aria-describedby', 'err-' + campo);
  }

  function leggi() {
    var f = new FormData(form);
    return {
      nome: String(f.get('nome') || '').trim(),
      email: String(f.get('email') || '').trim(),
      paese: String(f.get('paese') || ''),
      linguaPreferita: String(f.get('linguaPreferita') || ''),
      formato: String(f.get('formato') || ''),
      mailingList: $('#pr-lista').checked,
      privacy: $('#pr-privacy').checked,
      linguaSito: lang,
      sito: String(f.get('sito') || ''),
      tempo: Date.now() - aperta
    };
  }

  function controlla(d) {
    var errati = [];
    if (d.nome.length < 2) errati.push('nome');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) errati.push('email');
    if (!d.paese) errati.push('paese');
    if (!d.linguaPreferita) errati.push('linguaPreferita');
    if (!d.formato) errati.push('formato');
    if (!d.privacy) errati.push('privacy');
    return errati;
  }

  function formattaNumero(n) {
    var s = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '|');
    return s.replace(/\|/g, lang === 'en' ? ',' : lang === 'fr' ? ' ' : '.');
  }

  function attesa(si) {
    bottone.disabled = si;
    bottone.querySelector('[data-t="submit"]').textContent = si ? t.sending : t.submit;
    form.setAttribute('aria-busy', si ? 'true' : 'false');
  }

  function successo(r, d) {
    var done = $('#pr-done');
    var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
    if (r.duplicato) {
      done.querySelector('.pr-done-title').textContent = t.dupTitle;
      done.querySelector('.pr-done-label').hidden = true;
      $('#pr-done-number').hidden = true;
      done.querySelector('.pr-done-note').hidden = true;
      $('#pr-done-mail').innerHTML = esc(t.dupText).replace('{email}', '<strong>' + esc(d.email) + '</strong>');
    } else {
      $('#pr-done-number').textContent = ({ it: 'N. ', en: 'No. ', fr: 'N° ', es: 'N.º ', de: 'Nr. ' })[lang] + formattaNumero(r.numero);
      $('#pr-done-mail').innerHTML = esc(r.email === 'inviata' ? t.mailSent : t.mailLater).replace('{email}', '<strong>' + esc(d.email) + '</strong>');
    }
    form.hidden = true;
    done.hidden = false;
    done.focus();
    done.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (bottone.disabled) return;
    var d = leggi();
    var errati = controlla(d);
    ['nome', 'email', 'paese', 'linguaPreferita', 'formato', 'privacy'].forEach(function (c) { mostraErrore(c, errati.indexOf(c) >= 0); });
    if (errati.length) {
      stato.textContent = t.errFix; stato.className = 'pr-status is-error';
      var primo = form.querySelector('[name="' + errati[0] + '"]'); if (primo) primo.focus();
      return;
    }
    if (!api) { stato.textContent = t.notOpen; stato.className = 'pr-status is-info'; return; }
    stato.textContent = ''; stato.className = 'pr-status';
    attesa(true);
    // text/plain evita la richiesta preliminare CORS, non supportata da Apps Script.
    fetch(api, { method: 'POST', body: JSON.stringify(d), redirect: 'follow' })
      .then(function (res) { return res.json(); })
      .then(function (r) {
        if (r && r.ok) { successo(r, d); return; }
        attesa(false);
        var err = r && r.errore;
        if (err === 'campi' && r.campi) { r.campi.forEach(function (c) { mostraErrore(c, true); }); stato.textContent = t.errFix; }
        else if (err === 'limite' || err === 'occupato') stato.textContent = t.errBusy;
        else if (err === 'verifica') stato.textContent = t.errCheck;
        else stato.textContent = t.errServer;
        stato.className = 'pr-status is-error';
      })
      .catch(function () {
        attesa(false);
        stato.textContent = t.errServer; stato.className = 'pr-status is-error';
      });
  });
})();
