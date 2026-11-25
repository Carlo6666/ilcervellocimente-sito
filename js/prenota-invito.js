/* Blocco "Prenota oggi. Leggi domani." in fondo a index.html: testi nelle 5 lingue e link con la lingua scelta. */
(function () {
  var T = {
    it: { kicker: '08 / IL LIBRO · PRENOTAZIONE', title: 'Prenota oggi.<em>Leggi domani.</em>', text: 'Entra a far parte dei primi lettori. Prenota la tua copia e ricevila non appena sarà pubblicata.', button: 'PRENOTA LA TUA COPIA', note: 'GRATUITA E SENZA IMPEGNO · NESSUN PAGAMENTO' },
    en: { kicker: '08 / THE BOOK · PRE-ORDER', title: 'Pre-order today.<em>Read tomorrow.</em>', text: 'Be one of the first readers. Pre-order your copy and get it as soon as it is published.', button: 'PRE-ORDER YOUR COPY', note: 'FREE AND WITH NO OBLIGATION · NO PAYMENT' },
    fr: { kicker: '08 / LE LIVRE · PRÉCOMMANDE', title: 'Réservez aujourd’hui.<em>Lisez demain.</em>', text: 'Rejoignez les premiers lecteurs. Réservez votre exemplaire et recevez-le dès sa parution.', button: 'RÉSERVEZ VOTRE EXEMPLAIRE', note: 'GRATUIT ET SANS ENGAGEMENT · AUCUN PAIEMENT' },
    es: { kicker: '08 / EL LIBRO · RESERVA', title: 'Resérvalo hoy.<em>Léelo mañana.</em>', text: 'Únete a los primeros lectores. Reserva tu ejemplar y recíbelo en cuanto se publique.', button: 'RESERVA TU EJEMPLAR', note: 'GRATIS Y SIN COMPROMISO · SIN PAGO' },
    de: { kicker: '08 / DAS BUCH · VORBESTELLUNG', title: 'Heute vorbestellen.<em>Morgen lesen.</em>', text: 'Gehöre zu den ersten Leserinnen und Lesern. Bestelle dein Exemplar vor und erhalte es, sobald es erscheint.', button: 'EXEMPLAR VORBESTELLEN', note: 'KOSTENLOS UND UNVERBINDLICH · KEINE ZAHLUNG' }
  };
  var lang = window.NORA_LANG || document.documentElement.lang || 'it';
  var t = T[lang] || T.it;
  var box = document.getElementById('prenota');
  if (!box) return;
  box.querySelectorAll('[data-pr]').forEach(function (el) { var k = el.getAttribute('data-pr'); if (t[k]) el.innerHTML = t[k]; });
  var link = document.getElementById('prenota-link');
  if (link) link.href = 'prenota.html?lang=' + encodeURIComponent(T[lang] ? lang : 'it');
})();
