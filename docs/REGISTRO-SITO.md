# Il cervello (ci) mente — Registro del sito

File di coordinamento tra Claude, ChatGPT e Carlo. Si aggiunge in fondo, non si cancella niente.

---

## v3.1 — 24/11/2026, dalle 07:52 alle 09:00 circa (Claude)

**Fonte:** ordine operativo di Carlo del 24/11/2026, ore 07:52 («Nuovo ordine operativo — completamento dei siti», Fase 1).
**Ramo di lavoro:** `sito-v3-1` (anteprima, **non pubblicato**). Il sito online resta la v3 sul ramo `gh-pages` finché Carlo non approva.

### 1. Rami: cosa c'era e cosa è pubblicato

| Ramo | Contenuto | Stato |
|---|---|---|
| `gh-pages` (cd83ca5, 23/11 12:16) | v3 «Nora», grafica cinematografica crema/nero/arancione, 5 lingue, doppiaggi HeyGen | **È quello pubblicato** su www.ilcervellocimente.com (verificato il 24/11: stesso titolo, selettore lingue, nessun Metricool) |
| `main` (10851c7, 23/11 18:39) | v2 blu/giallo **scartata da Carlo il 23/11** + 4 correzioni di ChatGPT (Metricool con consenso, privacy.html, copertina e nastro tradotti, video in pagina) | **Non pubblicato**: le correzioni di ChatGPT sono finite sul ramo sbagliato e non sono mai andate online |

Conflitto: i due rami divergono da 8e68a8a. Non si fondono: la grafica di `main` è quella scartata.
Recuperato da `main` nella v3.1: la logica del consenso Metricool (stessa chiave `icc_metricool_consent_v1`, stesso hash), il link «Preferenze privacy», l'idea della riproduzione in pagina. Non recuperato: grafica, `privacy.html` (in stile v2), copertina con testo HTML.

Copie di sicurezza (nessun ramo cancellato o riscritto):
- `backup/gh-pages-pubblicato-2026-11-24` = sito online al 24/11
- `backup/main-v2-patch-chatgpt-2026-11-24` = main al 24/11

**Proposta da approvare (Carlo):** dopo l'ok, `gh-pages` = `main` = v3.1, così resta una sola versione. Nessuna fusione fatta finora.

### 2. Modifiche della v3.1 (layout, colori, caratteri e testi approvati invariati)

1. **Prestazioni:** le immagini e il video di Nora erano incollati in base64 in 3 file JS da 2,1 MB caricati prima di tutto. Ora sono file normali in `assets/`. Peso iniziale: **2.254 KB → 1.046 KB**; caricamento completo su rete 3G simulata (1,6 Mbit/s): **11,9 s → 5,6 s**.
2. **Caratteri ospitati sul sito** (`fonts/`, licenza OFL): niente più Google Fonts (più veloce e nessun indirizzo IP inviato a Google).
3. **Copertina del libro animata nelle 5 lingue** (`assets/copertina/`):
   - livelli originali da Drive «Copertina — livelli v1.svg» (2160×3840): fondo, riquadro arancione, linee, fili, corona, cervello, raggi **non ridisegnati**;
   - italiano = livelli originali intatti; EN/FR/ES/DE = solo le scritte rifatte negli stessi riquadri, con Anton e Poppins e la stessa ombra (#D9D0C1). Generatore: `tools/copertina/build.cjs` + `tools/copertina/testi.json`;
   - animazione con i tempi della «Copertina animata con suono — UFFICIALE v1» (7,40 s): parte quando la copertina entra nello schermo; pulsanti «Rivedi» e «Con suono» (suono ufficiale estratto in `copertina-suono.m4a`); marionetta che oscilla; disattivata con «riduci movimento»;
   - immagini statiche 1080×1920: `copertina-<lingua>.jpg`;
   - **video per il montaggio** (non usati dal sito): `assets/copertina/video/copertina-animata-<lingua>.mp4` (1080×1920, 25 fps, 7,40 s, suono ufficiale) e `cartello-puntata-0-<lingua>.mp4` (2 s, stesso stile del «Cartello — Puntata 0 v1»).
4. **Traduzioni mancanti completate:** titolo d'apertura, nastro scorrevole, striscia in alto, «di Carlo Riva», pulsante dei dialoghi, paragrafo su Nora (metà era in italiano), titolo del libro nella scheda, durata, titoli del lettore video, testi alternativi e etichette per l'accessibilità, messaggi d'errore del video (erano in italiano in tutte le lingue).
5. **Consenso Metricool** (banner in 5 lingue, «Accetta» e «Rifiuta» con lo stesso peso, revoca da «Preferenze privacy» in fondo alla pagina). Lo script Metricool si carica solo dopo «Accetta».
6. **Informativa privacy** riscritta in 5 lingue (hosting, caratteri, Metricool, YouTube, HeyGen, memoria del browser, diritti). Da far rileggere a un professionista prima di considerarla definitiva.
7. **Leggibilità:** i paragrafi del libro e l'introduzione delle storie erano marrone scuro su fondo quasi nero (quasi invisibili); il bollino «Dal libro allo schermo» copriva il titolo della copertina.
8. **Video della Puntata 0:** ordine di riproduzione = file sul sito (se presente) → HeyGen → avviso e link a YouTube. L'italiano resta su YouTube. Per attivare i file sul sito basta caricarli in `assets/video/puntata-0-<lingua>.mp4` e aggiungere la lingua in `LOCAL_DUBS` in `index.html`.
9. `robots.txt` con `sitemap.xml`.

File nuovi: `css/sito-v3-1.css`, `js/sito-v3-1.js`. `index.html` modificato solo nei punti sopra.

### 3. Collaudo eseguito (Chrome headless, 24/11/2026)

Smartphone Android simulato (412×915, Pixel 8) e desktop (1440×900), 5 lingue = 10 combinazioni.

| Verifica | Risultato |
|---|---|
| Errori JavaScript | 0 in tutte le combinazioni |
| Risorse del sito mancanti (404) | 0 |
| Scorrimento orizzontale indesiderato | nessuno |
| Copertina: lingua giusta e animazione completata | sì, in tutte |
| Titolo d'apertura tradotto | sì (IT, EN, FR, ES, DE) |
| Testi rimasti in italiano | nessuno, tranne parole uguali nelle due lingue (es. «LIBRO», «MEMORIA» in spagnolo) e l'etichetta bilingue «Lingua / Language» |
| Banner consenso | compare alla prima visita; «Rifiuta» lo chiude; Metricool non si carica |
| Lettore video: lingua → filmato | IT → YouTube JBoI3e8VW2g; EN/FR/ES/DE → doppiaggio HeyGen della lingua giusta |
| HTTPS | https://ilcervellocimente.com e https://www.ilcervellocimente.com rispondono (lettura del 24/11) |

**Non verificato (limiti dell'ambiente di Claude, da controllare):**
- riproduzione reale dei 4 doppiaggi HeyGen, qualità audio/video, voce e pause: i server HeyGen non sono raggiungibili da qui;
- il caricamento reale di Metricool e la comparsa delle visite nel pannello;
- un telefono Android vero (fatto solo in simulazione).

### 4. Problemi aperti (non risolvibili da Claude)

1. **ilcervellocimente.it non risponde** (nessun indirizzo DNS): il reindirizzamento al .com non c'è. Va attivato da Carlo su Register.it (servizio di reindirizzamento web verso `https://www.ilcervellocimente.com`).
2. **Doppiaggi su link HeyGen**: funzionano solo finché HeyGen tiene i file e non passano dal sito. Il link contiene un parametro di download («attachment»). Vanno scaricati e caricati sul sito (compito per ChatGPT, sotto).
3. **Titoli tradotti del libro**: Carlo non ha ancora scelto i titoli ufficiali (Passaggio media v3, 21/11). Ho usato le prime proposte già documentate: EN «The Brain (to us) Lies — User's manual to stop screwing up», FR «Le cerveau (nous) ment — Mode d'emploi pour arrêter de faire des conneries», ES «El cerebro (nos) miente — Manual de uso para dejar de cagarla» (alternativa più morbida: «meter la pata»), DE «Das Gehirn lügt (uns an) — Gebrauchsanweisung, um endlich keinen Mist zu bauen» (nuova). Si cambiano in `tools/copertina/testi.json` + `js/sito-v3-1.js`. Da far rileggere a madrelingua.
4. **Podcast Spotify**: il programma esiste ma senza episodi e senza link pubblico documentato; sul sito resta «in preparazione».
5. **Approvazione di Carlo** per pubblicare la v3.1.

### 5. Compito per ChatGPT (senza rifare il lavoro di Claude)

1. Leggi questo registro e controlla il ramo `sito-v3-1`: non modificare `gh-pages` né `main`.
2. Scarica da HeyGen i 4 doppiaggi della Puntata 0 v2.1 (EN, FR, ES, DE). Zero crediti: non rigenerare nulla.
3. Per ogni lingua monta: `copertina-animata-<lingua>.mp4` → dissolvenza 0,3 s → `cartello-puntata-0-<lingua>.mp4` → dissolvenza 0,3 s → doppiaggio → dissolvenza 0,4 s → `copertina-animata-<lingua>.mp4` (stesso montaggio standard dell'italiano v4; volume della copertina allineato alla voce).
4. Esporta per il web: 720×1280, H.264, AAC 128k, `+faststart`, meno di 25 MB per file. Nomi: `assets/video/puntata-0-en.mp4`, `-fr`, `-es`, `-de`.
5. Caricali sul ramo `sito-v3-1`, aggiungi le lingue in `LOCAL_DUBS` in `index.html` e scrivi qui sotto una sezione «v3.1-video» con: durata, dimensione, misure di volume e verifica fotogramma per fotogramma delle scritte (devono essere nella lingua del file).
6. Nessuna pubblicazione senza l'ok di Carlo.
