/*
 * IL CERVELLO (CI) MENTE · SITO v3.1 (24/11/2026)
 * 1. Traduzioni mancanti della v3 (titolo in apertura, nastro, attributi per l'accessibilità, testi spezzati).
 * 2. Copertina del libro animata a livelli, nella lingua scelta (tempi dell'animazione ufficiale v1, 7,40 s).
 * 3. Consenso alle statistiche Metricool (si caricano solo dopo «Accetta») e informativa privacy in 5 lingue.
 * La lingua è decisa dallo script della v3 (window.NORA_LANG): un solo selettore aggiorna tutto.
 */
(function () {
  'use strict';
  var LANGS = ['it', 'en', 'fr', 'es', 'de'];
  var lang = LANGS.indexOf(window.NORA_LANG) >= 0 ? window.NORA_LANG : 'it';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ------------------------------------------------------------------ 1. TRADUZIONI */
  var TX = {
    hero: {
      en: 'THE BRAIN<br><span class="hero-mente">LIES</span> <span class="hero-ci">(to us)</span>',
      fr: 'LE CERVEAU<br><span class="hero-ci">(nous)</span> <span class="hero-mente">MENT<span class="hero-period">.</span></span>',
      es: 'EL CEREBRO<br><span class="hero-ci">(nos)</span> <span class="hero-mente">MIENTE<span class="hero-period">.</span></span>',
      de: 'DAS GEHIRN<br><span class="hero-mente">LÜGT</span> <span class="hero-ci">(uns an)</span>'
    },
    ticker: {
      en: 'THE BRAIN LIES TO US ✳ AND WE FALL FOR IT ✳ AND THEN WE LAUGH ABOUT IT ✳',
      fr: 'LE CERVEAU NOUS MENT ✳ ET ON TOMBE DANS LE PANNEAU ✳ ET PUIS ON EN RIT ✳',
      es: 'EL CEREBRO NOS MIENTE ✳ Y CAEMOS ✳ Y LUEGO NOS REÍMOS ✳',
      de: 'DAS GEHIRN LÜGT UNS AN ✳ UND WIR FALLEN DARAUF REIN ✳ UND DANN LACHEN WIR DARÜBER ✳'
    },
    transcript: {
      en: '▤ READ NORA’S DIALOGUE · IT / EN / FR / ES / DE',
      fr: '▤ LIRE LES DIALOGUES DE NORA · IT / EN / FR / ES / DE',
      es: '▤ LEER LOS DIÁLOGOS DE NORA · IT / EN / FR / ES / DE',
      de: '▤ NORAS DIALOGE LESEN · IT / EN / FR / ES / DE'
    },
    // testi rimasti in italiano nella v3 (nodo di testo intero → traduzione)
    text: {
      en: { 'STORIE CHE SEMBRANO VERE. CERVELLI CHE CI CASCANO.': 'STORIES THAT FEEL TRUE. BRAINS THAT FALL FOR THEM.', 'UN PROGETTO DI CARLO RIVA': 'A PROJECT BY CARLO RIVA', 'DI CARLO RIVA': 'BY CARLO RIVA', 'NORA · PUNTATA 0': 'NORA · EPISODE 0', 'PRIVACY ↗': 'PRIVACY ↗' },
      fr: { 'STORIE CHE SEMBRANO VERE. CERVELLI CHE CI CASCANO.': 'DES HISTOIRES QUI SEMBLENT VRAIES. DES CERVEAUX QUI S’Y LAISSENT PRENDRE.', 'UN PROGETTO DI CARLO RIVA': 'UN PROJET DE CARLO RIVA', 'DI CARLO RIVA': 'DE CARLO RIVA', 'NORA · PUNTATA 0': 'NORA · ÉPISODE 0', 'PRIVACY ↗': 'CONFIDENTIALITÉ ↗' },
      es: { 'STORIE CHE SEMBRANO VERE. CERVELLI CHE CI CASCANO.': 'HISTORIAS QUE PARECEN REALES. CEREBROS QUE CAEN EN ELLAS.', 'UN PROGETTO DI CARLO RIVA': 'UN PROYECTO DE CARLO RIVA', 'DI CARLO RIVA': 'DE CARLO RIVA', 'NORA · PUNTATA 0': 'NORA · EPISODIO 0', 'PRIVACY ↗': 'PRIVACIDAD ↗' },
      de: { 'STORIE CHE SEMBRANO VERE. CERVELLI CHE CI CASCANO.': 'GESCHICHTEN, DIE WAHR WIRKEN. GEHIRNE, DIE DARAUF REINFALLEN.', 'UN PROGETTO DI CARLO RIVA': 'EIN PROJEKT VON CARLO RIVA', 'DI CARLO RIVA': 'VON CARLO RIVA', 'NORA · PUNTATA 0': 'NORA · FOLGE 0', 'PRIVACY ↗': 'DATENSCHUTZ ↗' }
    },
    duration: { de: '1 MIN 38 SEK', fr: '1 MIN 38 S', es: '1 MIN 38 S' },
    noraAi: {
      en: 'She isn’t a real person or a healthcare professional: she is <strong>an AI-generated avatar</strong>. Her stories are fictional; the science is explained for a general audience.',
      fr: 'Ce n’est ni une personne réelle ni une professionnelle de santé : c’est <strong>un avatar créé par intelligence artificielle</strong>. Ses histoires sont fictives ; les notions scientifiques sont vulgarisées.',
      es: 'No es una persona real ni una profesional sanitaria: es <strong>un avatar creado con inteligencia artificial</strong>. Sus historias son ficticias; las ideas científicas se cuentan de forma divulgativa.',
      de: 'Sie ist keine reale Person und keine Fachkraft im Gesundheitswesen, sondern <strong>ein mit künstlicher Intelligenz erstellter Avatar</strong>. Ihre Geschichten sind erfunden; die Wissenschaft wird allgemein verständlich erklärt.'
    },
    bookTitle: {
      en: '«Il cervello (ci) mente» (“The Brain Lies to Us”)',
      fr: '« Il cervello (ci) mente » (« Le cerveau nous ment »)',
      es: '«Il cervello (ci) mente» («El cerebro nos miente»)',
      de: '„Il cervello (ci) mente“ („Das Gehirn lügt uns an“)'
    },
    // attributi: testo italiano → traduzione
    attr: {
      en: {
        'Un progetto editoriale di Carlo Riva': 'An editorial project by Carlo Riva',
        "Il cervello (ci) mente, torna all'inizio": 'Il cervello (ci) mente, back to top',
        'Navigazione principale': 'Main navigation', 'Apri menu': 'Open menu', 'Menu mobile': 'Mobile menu',
        'Puntata 0 — Benvenuti nella mente': 'Episode 0 — Welcome to the mind',
        'Nora, avatar IA protagonista della serie': 'Nora, the AI avatar starring in the series',
        "Breve animazione silenziosa dell'avatar Nora": 'Short silent animation of the avatar Nora',
        'Apri la Puntata 0 completa': 'Open the full Episode 0',
        'Cervello sospeso da fili come un burattino, con una corona e orbite arancioni': 'A brain hanging from strings like a puppet, with a crown and orange orbits',
        'Nora in una scena della Puntata 0': 'Nora in a scene from Episode 0', 'Riproduci la Puntata 0': 'Play Episode 0',
        'Cervello realizzato con fili neri e accenti arancioni': 'A brain made of black threads with orange accents',
        'Composizione astratta di un cervello e orbite di fili': 'Abstract composition of a brain and orbiting threads',
        'Nora, protagonista virtuale della serie, in un ambiente luminoso': 'Nora, the virtual star of the series, in a bright room',
        'Player video': 'Video player', 'Chiudi video': 'Close video', 'Chiudi storia': 'Close story', 'Chiudi privacy': 'Close privacy notice', 'Chiudi': 'Close'
      },
      fr: {
        'Un progetto editoriale di Carlo Riva': 'Un projet éditorial de Carlo Riva',
        "Il cervello (ci) mente, torna all'inizio": 'Il cervello (ci) mente, retour en haut',
        'Navigazione principale': 'Navigation principale', 'Apri menu': 'Ouvrir le menu', 'Menu mobile': 'Menu mobile',
        'Puntata 0 — Benvenuti nella mente': 'Épisode 0 — Bienvenue dans la tête',
        'Nora, avatar IA protagonista della serie': 'Nora, l’avatar IA héroïne de la série',
        "Breve animazione silenziosa dell'avatar Nora": 'Courte animation muette de l’avatar Nora',
        'Apri la Puntata 0 completa': 'Ouvrir l’épisode 0 complet',
        'Cervello sospeso da fili come un burattino, con una corona e orbite arancioni': 'Un cerveau suspendu à des fils comme une marionnette, avec une couronne et des orbites orange',
        'Nora in una scena della Puntata 0': 'Nora dans une scène de l’épisode 0', 'Riproduci la Puntata 0': 'Lire l’épisode 0',
        'Cervello realizzato con fili neri e accenti arancioni': 'Un cerveau fait de fils noirs avec des touches orange',
        'Composizione astratta di un cervello e orbite di fili': 'Composition abstraite d’un cerveau et d’orbites de fils',
        'Nora, protagonista virtuale della serie, in un ambiente luminoso': 'Nora, héroïne virtuelle de la série, dans une pièce lumineuse',
        'Player video': 'Lecteur vidéo', 'Chiudi video': 'Fermer la vidéo', 'Chiudi storia': 'Fermer l’histoire', 'Chiudi privacy': 'Fermer', 'Chiudi': 'Fermer'
      },
      es: {
        'Un progetto editoriale di Carlo Riva': 'Un proyecto editorial de Carlo Riva',
        "Il cervello (ci) mente, torna all'inizio": 'Il cervello (ci) mente, volver al inicio',
        'Navigazione principale': 'Navegación principal', 'Apri menu': 'Abrir menú', 'Menu mobile': 'Menú móvil',
        'Puntata 0 — Benvenuti nella mente': 'Episodio 0 — Bienvenidos a la mente',
        'Nora, avatar IA protagonista della serie': 'Nora, el avatar de IA protagonista de la serie',
        "Breve animazione silenziosa dell'avatar Nora": 'Breve animación sin sonido del avatar Nora',
        'Apri la Puntata 0 completa': 'Abrir el episodio 0 completo',
        'Cervello sospeso da fili come un burattino, con una corona e orbite arancioni': 'Un cerebro colgado de hilos como una marioneta, con una corona y órbitas naranjas',
        'Nora in una scena della Puntata 0': 'Nora en una escena del episodio 0', 'Riproduci la Puntata 0': 'Reproducir el episodio 0',
        'Cervello realizzato con fili neri e accenti arancioni': 'Un cerebro hecho de hilos negros con toques naranjas',
        'Composizione astratta di un cervello e orbite di fili': 'Composición abstracta de un cerebro y órbitas de hilos',
        'Nora, protagonista virtuale della serie, in un ambiente luminoso': 'Nora, protagonista virtual de la serie, en un ambiente luminoso',
        'Player video': 'Reproductor de vídeo', 'Chiudi video': 'Cerrar vídeo', 'Chiudi storia': 'Cerrar historia', 'Chiudi privacy': 'Cerrar', 'Chiudi': 'Cerrar'
      },
      de: {
        'Un progetto editoriale di Carlo Riva': 'Ein Buchprojekt von Carlo Riva',
        "Il cervello (ci) mente, torna all'inizio": 'Il cervello (ci) mente, zurück nach oben',
        'Navigazione principale': 'Hauptnavigation', 'Apri menu': 'Menü öffnen', 'Menu mobile': 'Mobiles Menü',
        'Puntata 0 — Benvenuti nella mente': 'Folge 0 — Willkommen im Kopf',
        'Nora, avatar IA protagonista della serie': 'Nora, der KI-Avatar und Star der Serie',
        "Breve animazione silenziosa dell'avatar Nora": 'Kurze stumme Animation des Avatars Nora',
        'Apri la Puntata 0 completa': 'Die ganze Folge 0 öffnen',
        'Cervello sospeso da fili come un burattino, con una corona e orbite arancioni': 'Ein Gehirn, das wie eine Marionette an Fäden hängt, mit Krone und orangefarbenen Bahnen',
        'Nora in una scena della Puntata 0': 'Nora in einer Szene aus Folge 0', 'Riproduci la Puntata 0': 'Folge 0 abspielen',
        'Cervello realizzato con fili neri e accenti arancioni': 'Ein Gehirn aus schwarzen Fäden mit orangefarbenen Akzenten',
        'Composizione astratta di un cervello e orbite di fili': 'Abstrakte Komposition aus einem Gehirn und Fadenbahnen',
        'Nora, protagonista virtuale della serie, in un ambiente luminoso': 'Nora, die virtuelle Hauptfigur der Serie, in einem hellen Raum',
        'Player video': 'Videoplayer', 'Chiudi video': 'Video schließen', 'Chiudi storia': 'Geschichte schließen', 'Chiudi privacy': 'Schließen', 'Chiudi': 'Schließen'
      }
    }
  };

  function translatePage() {
    if (lang === 'it') return;
    var h1 = $('#hero-title'); if (h1 && TX.hero[lang]) h1.innerHTML = TX.hero[lang];
    var tk = $('.ticker-track span');
    if (tk && TX.ticker[lang]) { var t = TX.ticker[lang] + '    '; tk.textContent = t + t; }
    var tb = $('#transcript-button'); if (tb) tb.textContent = TX.transcript[lang];
    $$('.featured-info .eyebrow').forEach(function (e) {
      e.childNodes.forEach(function (n) { if (n.nodeType === 3 && /1 MIN 38 SEC/.test(n.nodeValue) && TX.duration[lang]) n.nodeValue = n.nodeValue.replace('1 MIN 38 SEC', TX.duration[lang]); });
    });
    var np = $$('.nora-content p').filter(function (p) { return p.querySelector('strong'); })[0];
    if (np) np.innerHTML = TX.noraAi[lang];
    var bs = $$('.book-copy p strong')[0]; if (bs) bs.textContent = TX.bookTitle[lang];
    var tmap = TX.text[lang], w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) { var k = n.nodeValue.trim(); if (k && Object.prototype.hasOwnProperty.call(tmap, k)) n.nodeValue = n.nodeValue.replace(k, tmap[k]); }
    var map = TX.attr[lang];
    $$('[aria-label],[alt],[data-title],[title]').forEach(function (el) {
      ['aria-label', 'alt', 'data-title', 'title'].forEach(function (a) {
        var v = el.getAttribute(a); if (v && map[v]) el.setAttribute(a, map[v]);
      });
    });
  }

  /* ------------------------------------------------------------------ 2. COPERTINA ANIMATA */
  var COVER_UI = {
    it: { replay: '↺ Rivedi', sound: '🔊 Con suono', alt: 'Copertina del libro «Il cervello (ci) mente»' },
    en: { replay: '↺ Replay', sound: '🔊 With sound', alt: 'Book cover' },
    fr: { replay: '↺ Revoir', sound: '🔊 Avec le son', alt: 'Couverture du livre' },
    es: { replay: '↺ Repetir', sound: '🔊 Con sonido', alt: 'Portada del libro' },
    de: { replay: '↺ Nochmal', sound: '🔊 Mit Ton', alt: 'Buchcover' }
  };
  var COVER_LEN = 7400;
  function setupCover() {
    var host = $('[data-cover]');
    if (!host) return;
    var ui = COVER_UI[lang];
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var timer = null, audio = null, played = false;
    function finish() { host.classList.remove('is-playing'); host.classList.add('is-done', 'is-idle'); }
    function play(withSound) {
      if (reduce) { host.classList.add('is-static'); return; }
      clearTimeout(timer);
      host.classList.remove('is-playing', 'is-done', 'is-idle');
      void host.offsetWidth; // riparte da capo
      host.classList.add('is-playing');
      if (withSound) {
        if (!audio) { audio = new Audio('assets/copertina/copertina-suono.mp3'); audio.preload = 'auto'; }
        try { audio.currentTime = 0; } catch (e) {}
        var pr = audio.play(); if (pr && pr.catch) pr.catch(function () {});
      }
      timer = setTimeout(finish, COVER_LEN + 200);
    }
    fetch('assets/copertina/copertina-' + lang + '.svg')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (svg) {
        var fallback = host.querySelector('img');
        host.insertAdjacentHTML('afterbegin', svg);
        if (fallback) fallback.remove();
        var s = host.querySelector('svg'); if (s) s.setAttribute('focusable', 'false');
        if (reduce) { host.classList.add('is-static'); }
        var ctr = document.createElement('div');
        ctr.className = 'cover-controls';
        ctr.innerHTML = '<button type="button" data-cover-replay>' + ui.replay + '</button><button type="button" data-cover-sound>' + ui.sound + '</button>';
        host.parentNode.appendChild(ctr);
        ctr.querySelector('[data-cover-replay]').addEventListener('click', function () { if (audio) audio.pause(); play(false); });
        ctr.querySelector('[data-cover-sound]').addEventListener('click', function () { play(true); });
        if ('IntersectionObserver' in window) {
          var io = new IntersectionObserver(function (en) {
            if (en[0].isIntersecting && !played) { played = true; play(false); io.disconnect(); }
          }, { threshold: 0.35 });
          io.observe(host);
        } else { play(false); }
      })
      .catch(function () { /* resta l'immagine statica della lingua */ });
    window.NORA_COVER = { play: play, seek: function (ms) { // usato solo per esportare fotogrammi
      host.classList.remove('is-done', 'is-idle'); host.classList.add('is-playing');
      document.getAnimations().forEach(function (a) { if (host.contains(a.effect && a.effect.target)) { a.pause(); a.currentTime = ms; } });
    } };
  }

  /* ------------------------------------------------------------------ 3. CONSENSO E PRIVACY */
  var CONSENT_KEY = 'icc_metricool_consent_v1'; // stessa chiave usata dalla prova del 23/11 sul ramo main
  var METRICOOL_HASH = 'a47bb1e1ff65cac7f53021c96b1fd898';
  var P = {
    it: {
      bannerTitle: 'Statistiche, solo se vuoi', bannerText: 'Con il tuo consenso usiamo Metricool per contare le visite in forma aggregata e capire quali contenuti interessano. Se rifiuti, il sito funziona allo stesso modo. Puoi cambiare idea quando vuoi da «Preferenze privacy», in fondo alla pagina.', more: 'Informativa privacy', yes: 'Accetta statistiche', no: 'Rifiuta', footer: 'PREFERENZE PRIVACY ↗',
      title: 'Informativa privacy', status: { yes: 'Statistiche: attive', no: 'Statistiche: disattivate', none: 'Statistiche: nessuna scelta' },
      body: '<p>Questo sito presenta il progetto «Il cervello (ci) mente» di Carlo Riva. Non ci sono account, moduli o newsletter.</p>' +
        '<h3>Titolare e contatti</h3><p>Carlo Riva — <a href="mailto:ilcervellocimente@gmail.com">ilcervellocimente@gmail.com</a>.</p>' +
        '<h3>Che cosa succede quando visiti il sito</h3><ul>' +
        '<li><strong>Hosting:</strong> il sito è pubblicato con GitHub Pages (GitHub Inc.), che può registrare dati tecnici come l’indirizzo IP per sicurezza e funzionamento.</li>' +
        '<li><strong>Caratteri e immagini:</strong> sono ospitati sul sito stesso; non vengono richiesti a servizi esterni.</li>' +
        '<li><strong>Statistiche (Metricool):</strong> si attivano solo se premi «Accetta statistiche». Servono a contare le visite e le pagine viste; Metricool può usare cookie o identificatori tecnici. Senza consenso lo script non viene caricato.</li>' +
        '<li><strong>Video:</strong> la Puntata 0 in italiano viene da YouTube (modalità senza cookie di profilazione, youtube-nocookie.com); le versioni doppiate, prodotte con HeyGen, vengono riprodotte dal sito quando la copia locale è abilitata; altrimenti, o se non si carica, si usa HeyGen. Il lettore si carica solo quando premi play. Se viene contattato un servizio esterno, questo può ricevere dati tecnici (ad esempio l’indirizzo IP) e si applica la sua informativa.</li>' +
        '<li><strong>Memoria del browser:</strong> il sito ricorda la lingua scelta e la tua scelta sulle statistiche (localStorage). Restano sul tuo dispositivo.</li>' +
        '<li><strong>Link ai social</strong> (YouTube, Instagram, Facebook, Spotify): aprendoli lasci il sito e valgono le regole di quelle piattaforme.</li></ul>' +
        '<h3>I tuoi diritti</h3><p>Puoi chiedere accesso, rettifica, cancellazione o limitazione dei dati e opporti al trattamento scrivendo all’indirizzo sopra. Puoi anche presentare reclamo al Garante per la protezione dei dati personali.</p>'
    },
    en: {
      bannerTitle: 'Statistics, only if you want', bannerText: 'With your consent we use Metricool to count visits in aggregate and see which content people like. If you decline, the site works exactly the same. You can change your mind at any time from “Privacy preferences” at the bottom of the page.', more: 'Privacy notice', yes: 'Accept statistics', no: 'Decline', footer: 'PRIVACY PREFERENCES ↗',
      title: 'Privacy notice', status: { yes: 'Statistics: on', no: 'Statistics: off', none: 'Statistics: no choice yet' },
      body: '<p>This website presents Carlo Riva’s project «Il cervello (ci) mente». There are no accounts, forms or newsletters.</p>' +
        '<h3>Controller and contact</h3><p>Carlo Riva — <a href="mailto:ilcervellocimente@gmail.com">ilcervellocimente@gmail.com</a>.</p>' +
        '<h3>What happens when you visit</h3><ul>' +
        '<li><strong>Hosting:</strong> the site is published with GitHub Pages (GitHub Inc.), which may log technical data such as your IP address for security and operation.</li>' +
        '<li><strong>Fonts and images:</strong> served from this site; nothing is requested from external font services.</li>' +
        '<li><strong>Statistics (Metricool):</strong> only switched on if you press “Accept statistics”. They count visits and page views; Metricool may use cookies or technical identifiers. Without consent the script is not loaded.</li>' +
        '<li><strong>Videos:</strong> the Italian Episode 0 comes from YouTube (privacy-enhanced mode, youtube-nocookie.com); the dubbed versions, produced with HeyGen, are played from this website when a local copy is enabled; otherwise, or if loading fails, HeyGen is used. The player loads only when you press play. If an external service is contacted, it may receive technical data (such as your IP address), and its own privacy notice applies.</li>' +
        '<li><strong>Browser storage:</strong> the site remembers your language and your statistics choice (localStorage), on your device only.</li>' +
        '<li><strong>Social links</strong> (YouTube, Instagram, Facebook, Spotify): opening them takes you off this site and their rules apply.</li></ul>' +
        '<h3>Your rights</h3><p>You can ask for access, correction, deletion or restriction of your data and object to processing by writing to the address above. You can also lodge a complaint with your data protection authority.</p>'
    },
    fr: {
      bannerTitle: 'Statistiques, seulement si tu veux', bannerText: 'Avec ton accord, nous utilisons Metricool pour compter les visites de façon globale et savoir quels contenus intéressent. Si tu refuses, le site fonctionne de la même manière. Tu peux changer d’avis à tout moment via « Préférences de confidentialité », en bas de page.', more: 'Politique de confidentialité', yes: 'Accepter les statistiques', no: 'Refuser', footer: 'PRÉFÉRENCES DE CONFIDENTIALITÉ ↗',
      title: 'Confidentialité', status: { yes: 'Statistiques : activées', no: 'Statistiques : désactivées', none: 'Statistiques : aucun choix' },
      body: '<p>Ce site présente le projet « Il cervello (ci) mente » de Carlo Riva. Il n’y a ni compte, ni formulaire, ni newsletter.</p>' +
        '<h3>Responsable et contact</h3><p>Carlo Riva — <a href="mailto:ilcervellocimente@gmail.com">ilcervellocimente@gmail.com</a>.</p>' +
        '<h3>Ce qui se passe pendant ta visite</h3><ul>' +
        '<li><strong>Hébergement :</strong> le site est publié avec GitHub Pages (GitHub Inc.), qui peut enregistrer des données techniques comme l’adresse IP pour la sécurité et le fonctionnement.</li>' +
        '<li><strong>Polices et images :</strong> hébergées sur le site ; rien n’est demandé à des services de polices externes.</li>' +
        '<li><strong>Statistiques (Metricool) :</strong> activées uniquement si tu appuies sur « Accepter les statistiques ». Elles comptent les visites et les pages vues ; Metricool peut utiliser des cookies ou des identifiants techniques. Sans accord, le script n’est pas chargé.</li>' +
        '<li><strong>Vidéos :</strong> l’épisode 0 en italien vient de YouTube (mode confidentialité renforcée, youtube-nocookie.com) ; les versions doublées, produites avec HeyGen, sont lues depuis ce site lorsqu’une copie locale est activée ; sinon, ou si le chargement échoue, HeyGen est utilisé. Le lecteur ne se charge qu’au clic sur lecture. Si un service externe est contacté, il peut recevoir des données techniques (par exemple l’adresse IP) et sa politique de confidentialité s’applique.</li>' +
        '<li><strong>Mémoire du navigateur :</strong> le site retient ta langue et ton choix sur les statistiques (localStorage), uniquement sur ton appareil.</li>' +
        '<li><strong>Liens sociaux</strong> (YouTube, Instagram, Facebook, Spotify) : en les ouvrant, tu quittes le site et leurs règles s’appliquent.</li></ul>' +
        '<h3>Tes droits</h3><p>Tu peux demander l’accès, la rectification, l’effacement ou la limitation de tes données et t’opposer au traitement en écrivant à l’adresse ci-dessus. Tu peux aussi saisir l’autorité de protection des données.</p>'
    },
    es: {
      bannerTitle: 'Estadísticas, solo si quieres', bannerText: 'Con tu consentimiento usamos Metricool para contar las visitas de forma agregada y saber qué contenidos interesan. Si lo rechazas, el sitio funciona igual. Puedes cambiar de opinión cuando quieras en «Preferencias de privacidad», al final de la página.', more: 'Política de privacidad', yes: 'Aceptar estadísticas', no: 'Rechazar', footer: 'PREFERENCIAS DE PRIVACIDAD ↗',
      title: 'Privacidad', status: { yes: 'Estadísticas: activadas', no: 'Estadísticas: desactivadas', none: 'Estadísticas: sin elegir' },
      body: '<p>Este sitio presenta el proyecto «Il cervello (ci) mente» de Carlo Riva. No hay cuentas, formularios ni boletines.</p>' +
        '<h3>Responsable y contacto</h3><p>Carlo Riva — <a href="mailto:ilcervellocimente@gmail.com">ilcervellocimente@gmail.com</a>.</p>' +
        '<h3>Qué ocurre cuando visitas el sitio</h3><ul>' +
        '<li><strong>Alojamiento:</strong> el sitio se publica con GitHub Pages (GitHub Inc.), que puede registrar datos técnicos como la dirección IP por seguridad y funcionamiento.</li>' +
        '<li><strong>Tipografías e imágenes:</strong> se sirven desde el propio sitio; no se piden a servicios externos.</li>' +
        '<li><strong>Estadísticas (Metricool):</strong> solo se activan si pulsas «Aceptar estadísticas». Cuentan visitas y páginas vistas; Metricool puede usar cookies o identificadores técnicos. Sin consentimiento el script no se carga.</li>' +
        '<li><strong>Vídeos:</strong> el episodio 0 en italiano viene de YouTube (modo de privacidad mejorada, youtube-nocookie.com); las versiones dobladas, producidas con HeyGen, se reproducen desde este sitio cuando hay una copia local habilitada; de lo contrario, o si falla la carga, se utiliza HeyGen. El reproductor solo se carga al pulsar play. Si se contacta con un servicio externo, este puede recibir datos técnicos (por ejemplo, la dirección IP) y se aplica su política de privacidad.</li>' +
        '<li><strong>Memoria del navegador:</strong> el sitio recuerda tu idioma y tu elección sobre las estadísticas (localStorage), solo en tu dispositivo.</li>' +
        '<li><strong>Enlaces sociales</strong> (YouTube, Instagram, Facebook, Spotify): al abrirlos sales del sitio y se aplican sus normas.</li></ul>' +
        '<h3>Tus derechos</h3><p>Puedes pedir el acceso, la rectificación, la supresión o la limitación de tus datos y oponerte al tratamiento escribiendo a la dirección indicada. También puedes reclamar ante la autoridad de protección de datos.</p>'
    },
    de: {
      bannerTitle: 'Statistik nur, wenn du willst', bannerText: 'Mit deiner Einwilligung nutzen wir Metricool, um Besuche zusammengefasst zu zählen und zu sehen, welche Inhalte gefallen. Wenn du ablehnst, funktioniert die Website genauso. Du kannst deine Wahl jederzeit unter „Datenschutz-Einstellungen“ unten auf der Seite ändern.', more: 'Datenschutzerklärung', yes: 'Statistik erlauben', no: 'Ablehnen', footer: 'DATENSCHUTZ-EINSTELLUNGEN ↗',
      title: 'Datenschutz', status: { yes: 'Statistik: aktiv', no: 'Statistik: aus', none: 'Statistik: noch keine Wahl' },
      body: '<p>Diese Website stellt Carlo Rivas Projekt „Il cervello (ci) mente“ vor. Es gibt keine Konten, Formulare oder Newsletter.</p>' +
        '<h3>Verantwortlicher und Kontakt</h3><p>Carlo Riva — <a href="mailto:ilcervellocimente@gmail.com">ilcervellocimente@gmail.com</a>.</p>' +
        '<h3>Was bei deinem Besuch passiert</h3><ul>' +
        '<li><strong>Hosting:</strong> Die Website wird über GitHub Pages (GitHub Inc.) veröffentlicht; dabei können technische Daten wie die IP-Adresse für Sicherheit und Betrieb protokolliert werden.</li>' +
        '<li><strong>Schriften und Bilder:</strong> werden von dieser Website geladen; es werden keine externen Schriftdienste abgefragt.</li>' +
        '<li><strong>Statistik (Metricool):</strong> wird nur aktiviert, wenn du „Statistik erlauben“ drückst. Sie zählt Besuche und Seitenaufrufe; Metricool kann Cookies oder technische Kennungen verwenden. Ohne Einwilligung wird das Skript nicht geladen.</li>' +
        '<li><strong>Videos:</strong> Die italienische Folge 0 kommt von YouTube (erweiterter Datenschutzmodus, youtube-nocookie.com); die mit HeyGen erstellten Synchronfassungen werden von dieser Website abgespielt, wenn eine lokale Kopie aktiviert ist; andernfalls oder bei einem Ladefehler wird HeyGen verwendet. Der Player lädt erst, wenn du auf Play drückst. Wird ein externer Dienst kontaktiert, kann er technische Daten (etwa die IP-Adresse) erhalten; dann gelten seine Datenschutzhinweise.</li>' +
        '<li><strong>Speicher im Browser:</strong> Die Website merkt sich deine Sprache und deine Statistik-Wahl (localStorage), nur auf deinem Gerät.</li>' +
        '<li><strong>Social-Media-Links</strong> (YouTube, Instagram, Facebook, Spotify): Beim Öffnen verlässt du die Website; es gelten deren Regeln.</li></ul>' +
        '<h3>Deine Rechte</h3><p>Du kannst Auskunft, Berichtigung, Löschung oder Einschränkung deiner Daten verlangen und der Verarbeitung widersprechen, indem du an die obige Adresse schreibst. Außerdem kannst du dich bei einer Datenschutzaufsichtsbehörde beschweren.</p>'
    }
  };
  var mc = false;
  function startMetricool() {
    if (mc) return; mc = true;
    var s = document.createElement('script');
    s.src = 'https://tracker.metricool.com/resources/be.js';
    s.async = true;
    s.onload = function () { if (window.beTracker && typeof window.beTracker.t === 'function') window.beTracker.t({ hash: METRICOOL_HASH }); };
    document.head.appendChild(s);
  }
  function setupPrivacy() {
    var t = P[lang];
    // banner
    var b = document.createElement('div');
    b.className = 'consent'; b.id = 'consent'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-labelledby', 'consent-title'); b.hidden = true;
    b.innerHTML = '<h2 id="consent-title">' + t.bannerTitle + '</h2><p>' + t.bannerText + ' <a href="#privacy" data-open-privacy>' + t.more + '</a>.</p>' +
      '<div class="consent-actions"><button type="button" class="consent-yes">' + t.yes + '</button><button type="button" class="consent-no">' + t.no + '</button></div>';
    document.body.appendChild(b);
    // informativa nel riquadro esistente
    var panel = $('#privacy-modal .privacy-panel');
    if (panel) {
      var top = panel.querySelector('.modal-top');
      Array.prototype.slice.call(panel.children).forEach(function (c) { if (c !== top) c.remove(); });
      panel.insertAdjacentHTML('beforeend', '<h2 id="privacy-title">' + t.title + '</h2>' + t.body +
        '<p class="privacy-status" id="privacy-status"></p><div class="privacy-actions"><button type="button" data-consent="yes">' + t.yes + '</button><button type="button" data-consent="no">' + t.no + '</button></div>');
    }
    function refresh() {
      var c = store.get(CONSENT_KEY);
      var st = $('#privacy-status'); if (st) st.textContent = c === 'yes' ? t.status.yes : c === 'no' ? t.status.no : t.status.none;
      $$('[data-consent]').forEach(function (x) { x.classList.toggle('is-on', x.getAttribute('data-consent') === c); x.setAttribute('aria-pressed', String(x.getAttribute('data-consent') === c)); });
    }
    function choose(v) {
      var prev = store.get(CONSENT_KEY);
      store.set(CONSENT_KEY, v); b.hidden = true; refresh();
      if (v === 'yes') startMetricool();
      else if (prev === 'yes' && mc) location.reload(); // toglie lo script già caricato
    }
    b.querySelector('.consent-yes').addEventListener('click', function () { choose('yes'); });
    b.querySelector('.consent-no').addEventListener('click', function () { choose('no'); });
    $$('[data-consent]').forEach(function (x) { x.addEventListener('click', function () { choose(x.getAttribute('data-consent')); }); });
    function openPrivacy(e) { if (e) e.preventDefault(); var l = $('#privacy-link'); if (l) l.click(); }
    b.querySelector('[data-open-privacy]').addEventListener('click', openPrivacy);
    // link nel piè di pagina
    var fr = $('.footer-right');
    if (fr) {
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'footer-privacy-btn'; btn.textContent = t.footer;
      btn.addEventListener('click', openPrivacy); fr.appendChild(btn);
    }
    var c = store.get(CONSENT_KEY);
    if (c === 'yes') startMetricool();
    else if (c !== 'no') b.hidden = false;
    refresh();
  }

  function init() { translatePage(); setupCover(); setupPrivacy(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
