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
   - animazione con i tempi della «Copertina animata con suono — UFFICIALE v1» (7,40 s): parte quando la copertina entra nello schermo; pulsanti «Rivedi» e «Con suono» (suono ufficiale estratto in `copertina-suono.mp3`); marionetta che oscilla; disattivata con «riduci movimento»;
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


### v3.1-video — 24/11/2026 (ChatGPT) — parziale, BLOCCATO

- Letto il collaudo della sezione 3, senza rieseguirlo; verificato in `index.html` del ramo `sito-v3-1` che `LOCAL_DUBS=[]` e il fallback HeyGen/YouTube è presente.
- HeyGen: individuati tutti e quattro i doppiaggi esistenti «Nora — Puntata 0 v2.1 — multilingua EN FR ES DE». Tutti `completed`, durata sorgente dichiarata 79,36 s ciascuno, video e non solo audio.

| Lingua | ID traduzione HeyGen | Durata sorgente | Montaggio, dimensione, volume, fotogrammi |
|---|---|---:|---|
| EN | 534d021a89df4804b6909066758b0626-en | 79,36 s | Non verificati |
| FR | 534d021a89df4804b6909066758b0626-fr | 79,36 s | Non verificati |
| ES | 534d021a89df4804b6909066758b0626-es | 79,36 s | Non verificati |
| DE | 534d021a89df4804b6909066758b0626-de | 79,36 s | Non verificati |

- Blocco: il download del primo MP4 dal dominio resource2.heygen.ai fallisce per risoluzione DNS nell'ambiente FFmpeg; il tentativo alternativo di apertura/download non restituisce il file. Gli URL originali sono già nel lettore del sito, recuperabili anche tramite i quattro ID HeyGen sopra. Non è stata verificata la riproduzione effettiva.
- Da completare esclusivamente i punti 2–5 della sezione 5 in un ambiente con accesso ai file binari HeyGen e al repository: download delle sorgenti esistenti, montaggio con le copertine e i cartelli già presenti, esportazione, controllo audio e fotogrammi, caricamento sul solo ramo `sito-v3-1`, quindi attivazione di `LOCAL_DUBS` soltanto per i file effettivamente verificati e aggiornamento delle misure nel registro.
- Nessuna generazione HeyGen, zero crediti spesi da questa operazione, nessuna pubblicazione. `index.html`, `main` e `gh-pages` non modificati da ChatGPT.

### v3.1-video — completamento — 24/11/2026, dalle 08:58 alle 09:35 circa (Claude)

**Fonte:** messaggio di Carlo del 24/11/2026, ore 08:57 («risolvi il blocco del download HeyGen e completa esclusivamente la sezione 5. Zero crediti, nessuna rigenerazione, nessuna pubblicazione»).

**Come è stato superato il blocco.** Gli ambienti di ChatGPT e di Claude non raggiungono `resource2.heygen.ai`. Il download e il montaggio sono stati eseguiti dai server di GitHub, con un flusso di lavoro nel repository:
- `.github/workflows/doppiaggi-puntata-0.yml`: parte solo sul ramo `sito-v3-1`, e solo quando cambia il flusso stesso o lo script; non tocca `gh-pages`, quindi non pubblica;
- `tools/video/monta-doppiaggi.sh`: scarica i 4 doppiaggi **già esistenti** dagli stessi indirizzi usati dal sito (nessuna generazione, zero crediti), monta, esporta e misura;
- esecuzione: run 45352397313, 24/11/2026 08:00–08:23 UTC, esito «success», commit e4f3f87.

**Montaggio** (come la versione italiana v4): `copertina-animata-<lingua>.mp4` (7,40 s) → dissolvenza 0,3 s → `cartello-puntata-0-<lingua>.mp4` (2 s, muto) → dissolvenza 0,3 s → doppiaggio HeyGen → dissolvenza 0,4 s sul crema → copertina (7,40 s). Volume della copertina portato 1,5 LU sotto la voce di Nora. Esportazione: 720×1280, 25 fps, H.264 High CRF 23, AAC 128 kbit/s 48 kHz, `+faststart` (verificato: indice del filmato all'inizio del file).

| Lingua | Sorgente HeyGen | Durata sorgente | Voce sorgente | Copertina | File sul sito | Durata finale | Dimensione | Volume finale |
|---|---|---:|---:|---:|---|---:|---:|---:|
| EN | 1080×1920, 25 fps, HTTP 200 | 83,41 s | −17,8 LUFS, picco −4,5 | −4,4 dB | `assets/video/puntata-0-en.mp4` | 99,22 s | 16,5 MB | −17,0 LUFS, picco −3,5 dBFS |
| FR | 1080×1920, 25 fps, HTTP 200 | 83,09 s | −18,0 LUFS, picco −4,3 | −4,6 dB | `assets/video/puntata-0-fr.mp4` | 98,90 s | 16,4 MB | −17,2 LUFS, picco −3,2 dBFS |
| ES | 1080×1920, 25 fps, HTTP 200 | 84,16 s | −18,0 LUFS, picco −4,5 | −4,6 dB | `assets/video/puntata-0-es.mp4` | 99,97 s | 16,5 MB | −17,2 LUFS, picco −3,5 dBFS |
| DE | 1080×1920, 25 fps, HTTP 200 | 85,80 s | −18,6 LUFS, picco −4,1 | −5,2 dB | `assets/video/puntata-0-de.mp4` | 101,61 s | 16,8 MB | −17,8 LUFS, picco −3,1 dBFS |

Correzione al dato della sezione precedente: la durata reale delle sorgenti doppiate è 83–86 s, non 79,36 s (79,36 s è la durata dell'originale italiano; il doppiaggio allunga leggermente il parlato).

**Verifica dei fotogrammi** (eseguita da Claude sulle tavole in `docs/verifica-video/`, un fotogramma ogni 2 s del filmato finale e della sorgente, più 8 fotogrammi chiave per lingua):
- copertina iniziale e finale e cartello sono nella lingua del file (EN «The Brain (to us) Lies» / «Episode 0»; FR «Le cerveau (nous) ment» / «Épisode 0»; ES «El cerebro (nos) miente» / «Episodio 0»; DE «Das Gehirn lügt (uns an)» / «Folge 0»);
- le sorgenti HeyGen non contengono scritte impresse: solo Nora, lo stesso avatar e lo stesso ambiente dell'originale. I sottotitoli HeyGen erano una traccia separata e non sono stati inclusi;
- nessuna scritta in italiano in nessun fotogramma controllato.

**Audio** (misure, non ascolto: Claude non può ascoltare):
- in ogni file ci sono solo due silenzi oltre 1,5 s: il cartello (circa 2 s, voluto) e una pausa di circa 1,85 s verso la fine del parlato. La pausa è coerente con la pausa lunga prevista dal copione prima della riga del ragioniere, ma va confermata ascoltando;
- la voce, le pause e l'interpretazione sono quelle prodotte da HeyGen, non modificate; il confronto a orecchio con l'italiano resta da fare.

**Sito.** In `index.html` (solo ramo `sito-v3-1`): `LOCAL_DUBS=['en','fr','es','de']`. Prova in Chrome (Android simulato): scegliendo EN, FR, ES o DE e premendo play, il filmato parte dal sito (`assets/video/puntata-0-<lingua>.mp4`), 720×1280, durata corretta, nessun errore e nessuna risorsa mancante. L'italiano resta su YouTube. HeyGen resta solo come riserva se il file del sito non si carica.

**Rimane da fare (non incluso nella sezione 5):**
- ascolto di controllo da parte di Carlo (voce, pause, ritmo) delle quattro versioni;
- l'informativa privacy dice ancora che le versioni doppiate vengono da HeyGen: ora vengono dal sito (HeyGen solo come riserva). Va aggiornata la frase prima della pubblicazione;
- nessuna pubblicazione: `gh-pages` e `main` non sono stati toccati.

Zero crediti HeyGen. Nessuna rigenerazione.


### v3.1-video — completamento — 24/11/2026, ore 09:25 (avvio verifica, ora italiana) (ChatGPT)

**Stato: montaggio completato; collaudo finale ancora aperto.** Verifica indipendente del ramo `sito-v3-1`, senza intervenire sul flusso o rigenerare video.

- **Verificato:** GitHub Actions run [45352397313](https://github.com/Carlo6666/ilcervellocimente-sito/actions/runs/45352397313), job 138301826431, stato completed/success; tutti gli step riusciti. Log dal 24/11/2026 08:00:29.854 UTC al 24/11/2026 08:23:19.246 UTC (22 min 49 s; 09:00–09:23 CET). Nessuna riga marcata `##[error]`. Commit di montaggio e4f3f87d2e4e1207aeef7c3fcd9072b45e5bc59b (preesistente, non creato da ChatGPT in questa sessione), confermato tramite GitHub: contiene quattro MP4, dodici tavole JPG e report.txt. Nessuna correzione o riavvio necessario.
- **Verificato dal report FFmpeg:** HTTP 200 per tutte le sorgenti, file finali sotto 25.000.000 byte, H.264 720×1280 25 fps, AAC 48 kHz. Lo script prescrive AAC 128k e +faststart; non rimisurati indipendentemente sui binari finali. Le misure sottostanti sono lette dal report, non ricalcolate da ChatGPT.

| Lingua | Download HTTP / byte | Durata finale (s) | Dimensione finale (byte) | Voce LUFS / picco dBFS | Copertina LUFS stimati dopo gain | Finale LUFS / picco dBFS | Fotogrammi | Esito finale | Commit montaggio |
|---|---|---:|---:|---|---:|---|---|---|---|
| EN | 200 / 93758102 | 99,218 | 16469586 | -17,8 / -4,5 | -19,3 | -17,0 / -3,5 | OK a campione | Audio lingua e verifica integrale non verificabili | e4f3f87 |
| FR | 200 / 93149827 | 98,898 | 16392978 | -18,0 / -4,3 | -19,5 | -17,2 / -3,2 | OK a campione | Audio lingua e verifica integrale non verificabili | e4f3f87 |
| ES | 200 / 94405572 | 99,965 | 16538735 | -18,0 / -4,5 | -19,5 | -17,2 / -3,5 | OK a campione | Audio lingua e verifica integrale non verificabili | e4f3f87 |
| DE | 200 / 95490703 | 101,608 | 16832756 | -18,6 / -4,1 | -20,1 | -17,8 / -3,1 | OK a campione | Audio lingua e verifica integrale non verificabili | e4f3f87 |

- Copertina sorgente -14,9 LUFS, gain EN -4,40 dB, FR/ES -4,60 dB, DE -5,20 dB: obiettivo voce meno 1,5 LU coerente aritmeticamente; livello della copertina nel montaggio finale non misurato separatamente.
- Silenzi rilevati (secondi, soglia -45 dB per almeno 1,5 s): EN 1,958 e 1,850; FR 2,060 e 1,868; ES 2,032 e 1,909; DE 2,046 e 1,844. Il primo coincide con il cartello; **ipotesi:** il secondo è la pausa prevista dal copione, da confermare con ascolto. Nessuna valutazione soggettiva della voce o del ritmo dichiarata.
- **Verificato visivamente da ChatGPT:** aperte tutte e dodici le tavole JPG in `docs/verifica-video/` (fotogrammi chiave, finale ogni 2 s e sorgente ogni 2 s per ogni lingua). Copertine iniziali/finali e cartelli nelle lingue attese; nessuna scritta italiana estranea rilevata nelle immagini campionate, nessuna scritta impressa durante il parlato osservata. Dissolvenze visibili nei fotogrammi di transizione. **Non verificabile:** controllo esaustivo di ogni frame a 25 fps e lingua effettivamente parlata, sincronismo audio/video, ascolto delle pause.
- All'inizio della verifica `index.html` conteneva già `LOCAL_DUBS=['en','fr','es','de']`, attivato prima di questa sessione. In applicazione del vincolo di Carlo (solo lingue integralmente verificate), ripristinato `LOCAL_DUBS=[]` in un nuovo commit separato sul solo ramo di lavoro: 5acf2858afd211fbadfadedcffb3b5339a10ab50. Rilettura del file dopo il commit conferma la lista vuota e il fallback HeyGen presente. Nessun MP4 rimosso, nessuna riscrittura della cronologia.
- Resta da ascoltare e confermare la lingua effettiva dei quattro doppiaggi e completare il controllo video integrale, quindi attivare solo le lingue approvate. Aggiornare l'informativa privacy secondo la configurazione definitiva prima dell'approvazione di pubblicazione. Nessun nuovo collaudo browser eseguito in questa sessione.
- Commit di questa sessione: 5acf2858afd211fbadfadedcffb3b5339a10ab50 (fallback prudenziale); il commit che aggiunge questa sezione è identificabile nella cronologia del registro (non può contenere il proprio hash prima della creazione).
- Zero generazioni, traduzioni o crediti HeyGen utilizzati da ChatGPT in questa sessione. Nessuna pubblicazione, fusione o modifica di main o gh-pages. Nessuna modifica alle impostazioni GitHub.



### v3.1-video — attività residue — 24/11/2026 (ChatGPT)

- **Verificato:** informativa privacy aggiornata nelle cinque lingue in `js/sito-v3-1.js`, con descrizione della copia locale quando abilitata e di HeyGen in caso di fallback; commit 1b715dc03f6c8a5c02daa714513f314a9830a059, rilettura del blob confermata. Nessuna valutazione legale definitiva.
- **Verificato:** creato un flusso distinto, `.github/workflows/collaudo-finale-doppiaggi.yml`, commit d8c679e66bc4c635dc780eb9849be6a712bffa07, limitato a push sul ramo `sito-v3-1` per il solo file del nuovo workflow. Analizza esclusivamente i quattro MP4 già montati; non contatta HeyGen, non rigenera, non modifica i filmati e non abilita automaticamente LOCAL_DUBS.
- Run [45356997559](https://github.com/Carlo6666/ilcervellocimente-sito/actions/runs/45356997559), avvio 24/11/2026 08:32:22 UTC, job 138317176599: ultima verifica in_progress, preparazione Python riuscita, installazione strumenti in corso. Nessun esito finale ancora verificato.
- Il nuovo flusso prevede decodifica integrale di audio e video, conteggio fotogrammi, controllo MP4 faststart, codec e dimensione, misure LUFS/picchi anche per le sezioni del filmato, silenzi, rilevamento non forzato della lingua e trascrizione offline con faster-whisper su CPU, e tavole di tutti i frame (artifact privato Actions). Il report JSON distinto sarà salvato dal flusso se giunge al passo di salvataggio; nessun risultato anticipato. La decodifica integrale e la produzione di tavole non equivalgono a revisione semantica di ogni frame; l'ASR non equivale a giudizio umano di voce, ritmo o sincronismo.
- **Non verificabile al momento:** esito del nuovo collaudo, lingua effettivamente rilevata e qualità all'ascolto; nessuna lingua aggiunta in LOCAL_DUBS. I quattro MP4 restano nel ramo. Nessuna pubblicazione o fusione; main e gh-pages non toccati. Zero crediti HeyGen impiegati in questa sessione. Approvazione di pubblicazione ancora necessaria.


### v3.1-video — correzione collaudo — 24/11/2026 (ChatGPT)

- Verificato nei log del run 45356997559 (job 138317176599): `ModuleNotFoundError: No module named 'requests'`, `Process completed with exit code 1.` Il report finale non è stato prodotto. Non è un errore accertato dei filmati.
- Corretto il workflow installando requests e aggiungendo `pip check` e test esplicito degli import. Commit c4fafd38b01aefedfdfde38d8a399082c1e928ca, solo sito-v3-1. Nuovo run [45357852585](https://github.com/Carlo6666/ilcervellocimente-sito/actions/runs/45357852585), avvio verificato; ultimo stato in_progress. Esito non ancora verificato.
- Riattivato il monitoraggio orario già autorizzato, indirizzato al run più recente, con completamento delle verifiche e del registro entro i limiti dell'incarico. LOCAL_DUBS resta vuoto fino al superamento dei criteri. Nessuna modifica ai video, nessuna spesa HeyGen, nessuna pubblicazione, nessuna modifica main/gh-pages.


### v3.1-video — esito collaudo automatico finale — 24/11/2026 (ChatGPT)

**Verificato:** run [45357852585](https://github.com/Carlo6666/ilcervellocimente-sito/actions/runs/45357852585) completed/success, concluso alle 08:41:06 UTC (09:41 CET). Letto il report JSON `docs/verifica-video/collaudo-finale-45357852585.json`, input commit c4fafd38b01aefedfdfde38d8a399082c1e928ca.

| Lingua | Lingua ASR / probabilità | Frame decodificati / tavole | Voce LUFS | Copertina iniziale/finale LUFS | Finale LUFS / picco | Esito automatico |
|---|---|---|---:|---:|---|---|
| EN | en / 99,62% | 2480 / 39 | -16,8 | -18,3 | -17,0 / -3,5 | PASS |
| FR | fr / 99,64% | 2472 / 39 | -17,0 | -18,5 | -17,2 / -3,2 | PASS |
| ES | es / 97,58% | 2499 / 40 | -17,0 | -18,5 | -17,2 / -3,5 | PASS |
| DE | de / 99,53% | 2540 / 40 | -17,6 | -19,1 | -17,8 / -3,1 | PASS |

Tutte le tracce: H.264 720×1280 25 fps, AAC 48 kHz, faststart true, meno di 25 MB, decodifica integrale OK; 9991 frame totali e 158 tavole previste/prodotte. Bitrate audio medio misurato EN 116604, FR 113716, ES 112265, DE 118043 bit/s (encoder impostato a 128k, non CBR). Copertine iniziali e finali a 1,5 LU sotto il parlato misurato. Trascrizioni ASR disponibili nel JSON; probabilità del modello, non garanzia di qualità linguistica. Silenzi già documentati e confermati dal report.

**Non ancora verificato:** revisione semantica di tutte le tavole integrali, ascolto umano di pronuncia/ritmo/sincronismo e controllo browser finale con video locali attivi. LOCAL_DUBS resta [] finché i criteri residui non sono soddisfatti. Richiedere a Claude supporto per le verifiche non eseguibili qui, senza generazioni HeyGen, senza pubblicare, solo sito-v3-1. Nessun intervento su main o gh-pages.



### v3.1-video — verifiche qualitative residue e attivazione — 24/11/2026, dalle 09:50 alle 10:30 circa (Claude)

**Fonte:** messaggio di Carlo del 24/11/2026, ore 09:50 («completa le verifiche qualitative audiovisive residue, attiva esclusivamente i doppiaggi che superano tutti i controlli e verifica il funzionamento finale del sito nelle cinque lingue su smartphone e desktop»).
**Base:** commit a2ba544 (ChatGPT), run 45357852585 (esito tecnico PASS per tutte e quattro le lingue). Strumenti e risultati in `docs/verifica-video/qualita-claude/`.

#### 1. Contenuto parlato (revisione semantica delle trascrizioni del run 45357852585, fatta da Claude)
Confronto riga per riga con il copione italiano approvato della Puntata 0 v2.1 (aggancio, chi sono, il concetto, che cosa succede qui, onestà, invito, ragioniere).

| Lingua | Tutte le parti del copione presenti, nell'ordine | Senso fedele | Titolo detto | Riga del ragioniere | Esito |
|---|---|---|---|---|---|
| EN | sì | sì | «the brain lies to us» | presente, completa | PASS |
| FR | sì (forma «vous») | sì | «le cerveau nous ment» | presente, completa | PASS |
| ES | sì | sì | «el cerebro nos miente» | presente, completa | PASS |
| DE | sì | sì | «Unser Gehirn belügt uns» | presente, completa | PASS |

Note editoriali (non bloccanti, da decidere con Carlo):
- In tutte e 4 le lingue Nora dice «coming soon / ça arrive bientôt / llega próximamente / es erscheint in Kürze». La nota del 21/11 («Puntata 0 in 4 lingue v1») consigliava di non promettere l'uscita all'estero. È quello che HeyGen ha tradotto dall'italiano approvato: si accetta o si cambia solo con una nuova traduzione (crediti), oggi non necessaria.
- ES: «papelón» per «figuraccia» è più sudamericano che spagnolo di Spagna; comprensibile ovunque.
- DE: il titolo detto («Unser Gehirn belügt uns») è leggermente diverso da quello della copertina tedesca proposta («Das Gehirn lügt (uns an)»); il senso è lo stesso.

#### 2. Pausa lunga
La seconda pausa (circa 1,85 s) cade in ogni lingua subito dopo «tre parole e un punto esclamativo» e prima della riga del ragioniere (EN 78,2–80,0 s; FR 79,0–80,9; ES 79,4–81,3; DE 80,8–82,6): è la pausa lunga del copione (⏸⏸). **Confermata.**

#### 3. Sincronismo voce–labbra (misure, non ascolto)
- **Allineamento del montaggio:** audio e video della parte di Nora partono entrambi a 8,80 s (dissolvenze video e audio della stessa durata). Il montaggio non introduce ritardi.
- **Attacco della voce dopo la pausa lunga** (tavola `attacco-voce-dopo-pausa.jpg`, fotogrammi ogni 80 ms): in tutte e 4 le lingue la bocca passa dal sorriso all'articolazione 80–160 ms prima che la voce diventi udibile, come nel parlato naturale; nessun ritardo visibile del labiale rispetto al suono.
- **Correlazione apertura della bocca / volume** sulla parte di Nora: picco netto a 0 ms per EN, FR, DE; per ES il segnale è debole e i tre metodi provati non concordano (inconcludente, non negativo).
- **Bocca e voce:** in tutte le lingue la bocca si muove circa il doppio durante il parlato rispetto ai silenzi (EN 5,7 vs 2,9; FR 5,8 vs 2,8; ES 5,8 vs 3,2; DE 5,9 vs 3,2): nessuno sfasamento grossolano.
- **Limite dichiarato:** la qualità del labiale fine di HeyGen si giudica guardando. Sulle misure disponibili nessuna lingua mostra un difetto.

#### 4. Immagine (tutti i fotogrammi decodificati)
- Nessun taglio, salto o cambio di scena nella parte di Nora (soglia di cambio scena 0,12), nessun fotogramma nero, nessun fermo immagine oltre 1,5 s, in tutte e 4 le lingue.
- Riconoscimento del testo (OCR) su un fotogramma al secondo della parte di Nora (81–84 per lingua): nessun testo; le 9 parole rilevate erano false letture su capelli e tessuti, controllate a vista una per una.
- Avatar, ambiente e inquadratura uguali all'originale italiano.

#### 5. Decisione
Tutte e quattro le lingue superano i controlli eseguibili → **attivate**: `LOCAL_DUBS=['en','fr','es','de']` in `index.html` (solo ramo `sito-v3-1`). L'informativa privacy aggiornata da ChatGPT (commit 1b715dc) è coerente con questa configurazione; non modificata.

#### 6. Collaudo finale del sito (Chrome; server con richieste parziali come GitHub Pages)
| Verifica | Android (412×915) | Desktop (1440×900) |
|---|---|---|
| 5 lingue: errori JavaScript / risorse mancanti / scorrimento orizzontale | 0 / 0 / no | 0 / 0 / no |
| Titolo d'apertura e copertina animata nella lingua giusta | 5/5 | 5/5 |
| Puntata 0: IT → YouTube; EN, FR, ES, DE → file del sito della lingua giusta, parte con il clic | 5/5 | 5/5 |
| Avanzamento fino alla fine del filmato (evento «fine» ricevuto, durata esatta) | EN, FR, ES, DE ok | — |
| Banner consenso: «Rifiuta» → Metricool non caricato; «Accetta» → Metricool richiesto; scelta ricordata; stato visibile in «Preferenze privacy» | ok | ok |

Nota tecnica: con il server di prova di Python l'avanzamento nel video non funzionava (non gestisce le richieste parziali); con un server che le gestisce, come GitHub Pages, funziona.

**Non verificato in questa sessione:** link esterni ai social (non ricontrollati, invariati rispetto alla v3 online), telefono Android vero, Metricool nel pannello reale, ascolto della voce da parte di Carlo (pronuncia e naturalezza: giudizio soggettivo, parte dell'approvazione finale).

#### 7. Stato
Ramo `sito-v3-1` **pronto per l'approvazione definitiva di Carlo**. Nessuna pubblicazione; `main` e `gh-pages` non toccati; zero crediti HeyGen; nessuna rigenerazione.

### 24/11/2026 — Coordinamento post-collaudo (ChatGPT)

**Data:** 24/11/2026.

**Fonte:** messaggio di Carlo del 24/11/2026, ore 11:05 circa, che riporta «Sito — Collaudo finale v3.1, rapporto v1 (24-11-2026)», base eb7ed1e; registro GitHub letto sul ramo sito-v3-1 e al commit eb7ed1e. Il documento integrale del rapporto non è stato reperito nelle fonti accessibili.

**Descrizione:** secondo il resoconto trasmesso, collaudo dei doppiaggi e collaudo Chrome (50 combinazioni dispositivo/lingua, 535 prove interattive) già eseguiti: non ripetere. Aperte le anomalie 1) overflow DE a 360–375 px, 2) contrasto icona menu mobile, 3) nota/link del lettore ancora riferiti a HeyGen con file locale attivo, 4) durata video non specifica per lingua, 5) criticità minori a 320 px, leggibilità, bersagli tattili, bollino e titolo storia, 6) ipotesi di secondo tocco iOS da verificare. Predisporre prove manuali mirate su iPhone/Safari, Android/Chrome, Samsung Internet e Firefox desktop usando un'anteprima privata della versione corretta da identificare; registrare dispositivo, versione browser, lingua, esito ed evidenze. Proposta: correggere 1–5 dopo approvazione esplicita; 6 solo dopo conferma del difetto. Nessuna prova manuale dichiarata eseguita. Attesa delle decisioni di Carlo; nessuna modifica funzionale, nessuna pubblicazione, nessun intervento su main o gh-pages e zero crediti HeyGen. Unico aggiornamento: questa annotazione documentale.

### 24/11/2026 — Correzioni autorizzate post-collaudo (ChatGPT)

**Data:** 24/11/2026.

**Fonte:** autorizzazione esplicita di Carlo in chat («Sì, ti autorizzo alle correzioni. E cerchiamo di pubblicarlo anche sto sito»); anomalie 1–5 del rapporto v1 riepilogate nell'annotazione precedente; durate dal registro di montaggio.

**Descrizione:** applicate sul solo ramo `sito-v3-1` le correzioni 1–5: regole CSS mirate al titolo tedesco su schermi stretti, contrasto menu, leggibilità e dimensioni tattili, bollino, titoli delle storie e schermi piccoli (`f266a21`); sincronizzazione della nota e del link diretto con la sorgente del lettore locale/HeyGen/YouTube (`1b24832`); durate per lingua arrotondate al secondo EN/FR 1:39, ES 1:40, DE 1:42, IT 1:38 invariato (`9f1fa7e`). Riletti i tre file via GitHub; sintassi dei quattro script inline JavaScript e dello script esterno verificata; test della logica con DOM simulato per EN/FR/ES/DE: link locale e nota coerenti, fallback HeyGen e successivo link YouTube corretti in 4/4 lingue. Non sono test di riproduzione o di impaginazione in browser. Restano da confermare visivamente l'assenza di overflow e gli altri interventi CSS, da eseguire le prove manuali su Safari iOS, Chrome Android reale, Samsung Internet e Firefox desktop, e da verificare l'ipotesi del doppio tocco su iOS (nessuna modifica preventiva a play()). Nessun nuovo collaudo dei doppiaggi o delle 50 combinazioni già testate, nessuna rigenerazione, zero crediti HeyGen. Main e gh-pages non modificati, nessuna pubblicazione. Approvazione finale della versione candidata dopo i test mirati ancora necessaria.


### 24/11/2026 — Verifica delle correzioni di ChatGPT (ae908c3) e anteprima definitiva (Claude)

**Data:** 24/11/2026, dalle 11:17 alle 12:15 circa.
**Fonte:** ordine di Carlo del 24/11/2026 ore 11:17 («Ultimo collaudo prima della pubblicazione»: solo le nuove correzioni; 320/360/375 px; tedesco; menu mobile; collegamenti video; Safari, Firefox, Android; doppio tocco su Safari). Non ripetuti: collaudo dei doppiaggi e le 535 prove del rapporto v1. Zero crediti HeyGen.
**Strumenti:** Chrome 153 con emulazione di telefono (tocco, densità 2×, user-agent Android e iPhone); **WebKitGTK 2.52 (MiniBrowser), motore WebKit reale** pilotato con WebDriver, installato per questa verifica. Server con richieste parziali come GitHub Pages. Script e risultati in `docs/verifica-sito-24-11/`.

#### 1. Esito delle correzioni di ChatGPT
| Anomalia (rapporto v1) | Verifica | Esito |
|---|---|---|
| 1. Titolo tedesco delle Storie fuori schermo a 360/375 | Chrome 320/360/375/390/412 × 5 lingue; WebKit 320/360/375 × 5 lingue | **Risolta**: larghezza pagina = larghezza schermo in 50/50 casi, nessun elemento sporgente |
| 2. Pulsante menu invisibile | Colore misurato: linee e bordo crema `#f0dbc2`, 44×44 px; menu si apre, porta alla sezione e si chiude (Chrome 25/25, WebKit 15/15) | **Risolta** |
| 3. Nota e link del lettore doppiato | EN/FR/ES/DE: video del sito, link al file del sito, nota «ospitato su questo sito» nella lingua giusta; senza file → HeyGen → avviso e link YouTube (provato bloccando i file) | **Risolta** |
| 4. Durata per lingua | IT 1:38, EN 1:39, FR 1:39, ES 1:40, DE 1:42 (Chrome e WebKit) | **Risolta** |
| 5. Pagina larga 341 px a 320 / banner che sborda | Banner a 320 px: 16–304 px in tutte le lingue | **Risolta** |
| 7. Bersagli tattili piccoli | Selettore lingua, «Rivedi», «Con suono», menu, chiudi ≥ 44 px | **Risolta in parte**: i link in fondo alla pagina (Privacy, social) restano alti 16 px (BASSA, non bloccante) |
| 8. Bollino sopra il testo (IT 375) | Nessuna sovrapposizione con il testo del libro | **Risolta** |
| 9. Titolo della storia che tocca il bordo | Nessun titolo oltre la scheda a 320–412 px | **Risolta**; nota estetica: a 320 px in tedesco «ALLES» va a capo come «AL-LES» (sillabazione automatica) |

#### 2. Problemi nuovi trovati e corretti (sul solo ramo `sito-v3-1`)
- **[ALTA, WebKit] Selettore della lingua illeggibile**: nel motore WebKit il menu a tendina veniva disegnato chiaro con testo crema (quasi invisibile). Causa: mancava `appearance:none`. Correzione in `css/sito-v3-1.css`: stesso colore scuro della grafica, freccia disegnata, opzioni leggibili. Verificato in WebKit (testo crema su fondo `#261912`) e in Chrome; il cambio di lingua dal selettore funziona in WebKit.
- **[MEDIA, Safari iOS] Doppio tocco sui doppiaggi**: il video partiva solo grazie all'attributo autoplay; Safari iOS non avvia da solo un video con audio. Aggiunta in `index.html` una chiamata `play()` nello stesso tocco del pulsante (se il browser la rifiuta non succede nulla di male: restano i comandi del video). Verificato: un solo clic avvia il video in WebKit e in Chrome con le regole normali di autoplay.

#### 3. Doppio tocco su Safari: analisi
- **Effetti al passaggio del mouse:** nessuna regola `:hover` cambia visibilità, dimensione o contenuto, e non ci sono ascoltatori `mouseover`/`mouseenter`: Safari iOS non chiederà un secondo tocco per i pulsanti e i link.
- **Doppiaggi EN/FR/ES/DE:** rischio eliminato con `play()` (sopra). Non provato su un iPhone vero.
- **Italiano (YouTube):** su iPhone YouTube di solito chiede di premere play dentro il riquadro: è il comportamento di YouTube, non del sito.

#### 4. Prove reali e prove simulate
| Prova | Tipo |
|---|---|
| Motore WebKit (come Safari): pagine, larghezze, menu, video, selettore lingua | **Reale sul motore WebKit (WebKitGTK 2.52 su Linux)**, non Safari: niente regole iOS su autoplay, nessun telefono vero |
| Chrome a 320/360/375/390/412 px con tocco | **Simulata** (emulazione di telefono nel Chrome per computer) |
| Firefox | **Non eseguita**: l'installazione di Firefox non è stata consentita in questo ambiente |
| Samsung Internet, iPhone/iPad veri, Android vero | **Non eseguite** |

#### 5. Problemi bloccanti
Nessuno tra quelli verificabili qui. Da fare con dispositivi veri prima o subito dopo l'approvazione: iPhone con Safari (EN: il video parte al primo tocco?), Android con Chrome o Samsung Internet (DE: menu e Storie), un computer con Firefox (cambio lingua, video).

**Stato:** ramo `sito-v3-1` pronto per l'approvazione definitiva. `main` e `gh-pages` non modificati; nessuna pubblicazione.


### 24/11/2026 — Nora nella stanza e riproduzione in linea (ChatGPT)

**Approvazione:** Carlo ha approvato le anteprime grafiche e autorizzato l'implementazione in chat («Ora ci siamo, approvato», «Procedi»). Commit applicativo `303b38d97a9092fb6726cd0a13020ab4a1d006e6`, solo ramo `sito-v3-1`.

- Rimossi arco, cornice, ombra e fondo separato della scena di Nora; scena più ampia su mobile con dissolvenza del video silenzioso verso lo sfondo. Rimossa anche la cornice del ritratto nella sezione Chi è Nora.
- Eliminato il modale del video: il lettore viene montato nel contenitore della scena o dell'episodio corrispondente, con comando di chiusura, ripristino dell'anteprima, pausa del loop decorativo, supporto a movimento ridotto e una sola riproduzione alla volta. Restano i modali non video (privacy, storie, trascrizione).
- Sorgenti invariate: italiano YouTube no-cookie, EN/FR/ES/DE file locali; fallback HeyGen e link all'originale invariati. Nessuna rigenerazione e zero crediti HeyGen.
- Verificato rileggendo il blob `5daea9c3dc9bb009725fccd0aad65703cc8e2801`: assenza del vecchio modale, quattro script inline sintatticamente validi. Test con DOM simulato 5/5 lingue: apertura nella scena, spostamento del lettore nella sezione puntata, arresto e ripristino; fallback HeyGen e link YouTube simulati per i quattro doppiaggi.
- **Residuo:** collaudo visivo e riproduzione effettiva su browser e smartphone, inclusa corrispondenza della scena ai mockup (riutilizzati i video originali, non ampliato digitalmente l'ambiente). L'italiano può mostrare i controlli e le limitazioni di YouTube. Il nuovo video introduttivo dedicato al progetto non è stato creato in questa modifica. Nessuna pubblicazione, nessuna modifica a main/gh-pages; nuova anteprima e approvazione operativa dopo il collaudo.


### 24/11/2026 — Presentazione generale e nuovo collaudo mirato (ChatGPT)

- Aggiunta una breve introduzione testuale al progetto prima della serie, nelle cinque lingue, commit `5c16bf6759e28c155044b281370a1d7f4349e73f`. Testo redazionale di raccordo, non trascrizione del messaggio originale; distingue libro in tre volumi, storie, video e podcast dagli sviluppi futuri.
- HeyGen: reperito il filmato completato «RivaCarlo.it — Nora · Presentazione cinematografica V3 IT», ID `bcffdc21b35239be6bc497c5774ea018`, 93 s, candidato per il riuso; contenuto parlato e corrispondenza con il messaggio originale non verificati integralmente, sottotitoli non accessibili. Non incorporato URL temporaneo né generato nuovo video. Occorre verificare e acquisire copia stabile prima di integrare, con versioni multilingue.
- Creato workflow `.github/workflows/collaudo-nora-inline.yml`, commit `80f6cea7f48f8464483ce611f8fdb2cffa61e240`, sola lettura, mirato a 15 combinazioni Chrome (360/412/1440 × 5 lingue), controlli di cornice, overflow, lingua, lettore in linea, sorgente e chiusura; screenshot e rapporto come artifact. Run [45396063844](https://github.com/Carlo6666/ilcervellocimente-sito/actions/runs/45396063844) verificato in coda, esito non ancora disponibile. Le richieste esterne sono bloccate nel collaudo: non verifica la riproduzione YouTube o HeyGen reale né l'ascolto. Non ripete il collaudo dei doppiaggi.
- Nessuna spesa HeyGen, nessuna pubblicazione, nessuna modifica a main o gh-pages. Il nuovo testo non sostituisce la presentazione audiovisiva richiesta; rimane da integrare.


### 24/11/2026 — Pubblicazione autorizzata (ChatGPT)

- Autorizzazione esplicita in chat: «Vai e pubblica subito». Collaudo mirato run 45396063844 concluso success. Pubblicazione della versione con introduzione testuale; filmato introduttivo ancora da integrare.
- Aggiornato gh-pages con commit `3520bba93977be0406f0d988fac000f071ad7327` (precedente `cd83ca52cea91337b452ae7e1185186181c026a4`, recuperabile). Copiati solo file pubblici dal candidato `4b83b890b39ca15ef575f43af21f0912f5f39b0e`; esclusi docs, tools e workflow interni. CNAME invariato. Verificato il nuovo head e l'elenco dei file. Main invariato.
- Al momento del controllo il nuovo deployment Pages non risultava ancora confermato; accesso pubblico ai due domini non verificabile tramite il browser disponibile. Nessuna spesa HeyGen.


### 24/11/2026 — Correzione associazione filmati (ChatGPT)

- Segnalazione di Carlo: i due filmati erano identici. Confermato nel codice: entrambi richiamavano la Puntata 0. Corretto su sito-v3-1 (cd6b6028) e gh-pages (c318560d): primo pulsante e play di Nora → presentazione cinematografica V3 IT (HeyGen bcffdc21b35239be6bc497c5774ea018, 93 s); secondo → Puntata 0 originale o doppiaggi già approvati. Entrambi nella pagina, nessun popup. Nessuna nuova generazione.
- La presentazione è disponibile in italiano; le quattro traduzioni non sono state generate. È stata avviata l'acquisizione della copia locale stabile (run 45398252331); in attesa, il lettore usa il link temporaneo HeyGen come fallback. La copia locale dovrà essere distribuita su gh-pages e il fallback temporaneo eliminato. Aggiornato anche il test browser per verificare che le due sorgenti siano diverse.
- Deploy correzione 45398274718 avviato; esito ancora da verificare.

- Aggiornamento: deploy correzione 45398274718 success; collaudo aggiornato 45398283052 success. Primo tentativo acquisizione 45398252331 fallito per ffprobe assente, non per download; installazione FFmpeg aggiunta, nuovo run 45398367784 in corso. Il dominio non è stato verificabile con il browser disponibile.


### 24/11/2026 — Fluidità riproduzione e copia locale (ChatGPT)
- Segnalazione di riproduzione a scatti. Verificato che gh-pages non aveva ancora il file della presentazione: il lettore tentava il percorso locale e passava a HeyGen. Questo è un possibile contributo, non prova della causa degli scatti durante il parlato.
- Run acquisizione 45398367784 success; file nora-presentazione-it.mp4 verificato dal workflow e presente (14.947.823 byte). Pubblicato atomicamente insieme a index.html su gh-pages commit 8a4de67d4233baa4f5b110e9415b913e35c587ea, eliminato il fallback temporaneo HeyGen per la presentazione, preload auto al clic. Ramo di lavoro allineato (787e7f7). Puntata 0 invariata. Deployment 45398889399 in corso all'ultimo controllo; fluidità reale non ancora verificata. Zero crediti HeyGen.


### 24/11/2026 — Doppiaggi della presentazione generale di Nora (ChatGPT)
- Autorizzazione esplicita dell'utente per i soli quattro doppiaggi EN, FR, ES, DE della presentazione generale, con mantenimento voce e sincronismo labiale e conferma dei diritti; costo in crediti non verificato.
- Fonte HeyGen bcffdc21b35239be6bc497c5774ea018 (93 s). Richiesta accettata, modalità Precision. ID f5216dbbfaf642d797e81ddab5ef7116-en, -fr, -es, -de. Prima verifica collettiva: tutti processing, nessun errore riportato. Nessuna ulteriore generazione autorizzata.
- In attesa dei file: acquisire copie locali, verificare durata, audio/video, lingue effettive, fluidità e coerenza del parlato, sincronismo e testi grafici; separare le sorgenti della presentazione dalla Puntata 0 e selezionarle per lingua; non usare fallback italiano non segnalato. Collaudare le cinque lingue prima della pubblicazione della correzione, preservando il layout e la Puntata 0, senza ulteriori crediti. In questa fase nessuna modifica ai rami pubblici.


### 24/11/2026 — Doppiaggi presentazione completati su HeyGen e integrazione in preparazione (ChatGPT)
- Verifica collettiva: tutti e quattro gli ID f5216dbbfaf642d797e81ddab5ef7116-en/fr/es/de risultano completed senza errori, durata dichiarata 93 s, video e sottotitoli disponibili. Nessuna ulteriore richiesta di generazione. Costo effettivo non verificato.
- Acquisizione copie H.264/AAC e controllo FFmpeg/FFprobe con sottotitoli di verifica avviati (run 45405050890, commit 86fe5c96). Codice selezione locale per lingua aggiornato sul ramo di lavoro (acd6664f); confronto con gh-pages conferma che è cambiato solo il blocco relativo alla presentazione. CNAME pubblico www.ilcervellocimente.com invariato. Test browser aggiornato (515e9798, run 45405090451); deve controllare due sorgenti diverse in tutte le cinque lingue. Nessun cambio al secondo filmato.
- Non pubblicare prima della presenza di tutti i quattro file, dei controlli tecnici positivi e del collaudo. Verificare inoltre testo dei sottotitoli, lingua, eventuale grafica non tradotta e qualità audiovisiva. Non dichiarare una verifica percettiva se è disponibile solo quella tecnica.


### 25/11/2026 — Presentazione di Nora in cinque lingue, Play identico, pubblicazione (Claude)

**Data:** 25/11/2026, dalle 08:29 alle 09:25 circa (ora italiana).
**Fonte:** ordine di Carlo del 25/11/2026 ore 08:29 («Pubblicazione definitiva del sito multilingue»), con autorizzazione esplicita a integrare, correggere e pubblicare dopo i controlli. Stato HeyGen riferito da Carlo: ChatGPT ha verificato la mattina del 25/11 che le quattro traduzioni risultano completate. Zero crediti HeyGen spesi, nessuna rigenerazione.

#### 1. Recupero dei video (file locali, nessun link temporaneo nel sito)
- Titolo HeyGen: «Nora — Presentazione progetto V3 — EN FR ES DE». ID: `f5216dbbfaf642d797e81ddab5ef7116-en`, `-fr`, `-es`, `-de` (fonte italiana `bcffdc21b35239be6bc497c5774ea018`).
- Causa del fallimento di ieri (run 45405050890): i download erano riusciti, ma il controllo pretendeva una durata tra 90 e 96 s e lo spagnolo dura 98,2 s. Soglia portata a 85–115 s (`2ca4602`); decodifica audio per il riconoscimento lingua via FFmpeg (`01d5ea7`).
- Acquisizione riuscita: run [45569141465](https://github.com/Carlo6666/ilcervellocimente-sito/actions/runs/45569141465), commit `4bd939c`. Ricodifica H.264 High 720×1280, 25 fps, AAC 48 kHz stereo, avvio rapido (faststart).

| Lingua | File | Durata | Dimensione | Lingua parlata (Whisper small) | Volume integrato |
|---|---|---|---|---|---|
| IT (esistente) | nora-presentazione-it.mp4 | 93,0 s | 14,9 MB | it 0,992 | −16,1 LUFS |
| EN | nora-presentazione-en.mp4 | 94,3 s | 12,8 MB | en 0,989 | −17,3 LUFS |
| FR | nora-presentazione-fr.mp4 | 93,1 s | 12,7 MB | fr 0,993 | −16,7 LUFS |
| ES | nora-presentazione-es.mp4 | 98,2 s | 13,2 MB | es 0,986 | −17,8 LUFS |
| DE | nora-presentazione-de.mp4 | 93,3 s | 12,7 MB | de 0,992 | −17,8 LUFS |

Prove in `docs/verifica-presentazione/`: sottotitoli HeyGen (.srt), ffprobe (.json), trascrizioni (`lingue-whisper.json`), fotogrammi ogni 4 s, fermi d'immagine (nessuno in 5/5), volume. Fotogrammi IT ed EN guardati da Claude: nessun testo a schermo da tradurre, inquadratura coerente con l'italiano.

#### 2. Pulsante Play della presentazione
- `index.html` (`01d5ea7`): il pulsante sul video di Nora usa la stessa classe `big-play` della Puntata 0 (arancione, 106 px, alone, ingrandimento al passaggio), al centro del video; nascosto durante la riproduzione come quello della Puntata 0. Riproduzione sempre nella pagina, senza riquadri o finestre.
- Cambio lingua: il selettore ricarica la pagina nella nuova lingua (comportamento già esistente, invariato): la riproduzione in corso si ferma e i due video, al clic successivo, partono nella nuova lingua.

#### 3. Collaudo (run [45572820296](https://github.com/Carlo6666/ilcervellocimente-sito/actions/runs/45572820296), script `.github/collaudo/collaudo.mjs`)
Motori: Google Chrome desktop 1440 px; Chrome con emulazione Pixel 7 (Android); WebKit con emulazione iPhone 14; WebKit desktop; Firefox desktop. 5 lingue per ciascuno = 25 combinazioni, server con richieste parziali.
- Pulsanti identici (dimensioni, colore, forma, ombra) e Play centrato (scarto ≤ 2 px): 25/25.
- Presentazione nel file della lingua giusta e riproduzione reale ≥ 5 s: 25/25; fotogrammi persi 0 (Chrome, WebKit), al massimo 1 su 130 (Firefox).
- Puntata 0 distinta dalla presentazione, nella lingua giusta (IT → YouTube, solo sorgente verificata perché le richieste esterne erano bloccate; EN/FR/ES/DE → file del sito, riproduzione reale ≥ 3 s): 25/25. Avviando la Puntata 0 la presentazione si chiude: un solo video con audio alla volta, 25/25.
- Cambio lingua durante la riproduzione: pagina nella nuova lingua, nessun audio residuo; dopo il cambio entrambi i video nella nuova lingua: 25/25. Nessun errore JavaScript.
- Regressioni grafiche rispetto alla versione pubblicata (1440 e 412 px × 5 lingue, animazioni ferme): 10/10, tutte le differenze sono dentro il riquadro del video di Nora (il pulsante spostato), 0 pixel diversi altrove.
- Avviso non bloccante: su iPhone (390 px) in FR e DE, con il banner dei cookie ancora aperto e il video al centro dello schermo, il banner copre il pulsante; chiuso il banner, o scorrendo, è cliccabile. Era così anche prima (il banner copre quella fascia).

#### 4. Pubblicazione
- gh-pages `bd2b095` (precedente `8a4de67`, recuperabile): copiati solo `index.html` e i quattro MP4 nuovi; CNAME, Puntata 0, copertine e animazioni invariate. Deploy Pages run 45574716138 riuscito.
- Verifica del sito pubblico (run [45574917653](https://github.com/Carlo6666/ilcervellocimente-sito/actions/runs/45574917653), `.github/workflows/verifica-sito-pubblico.yml`): www.ilcervellocimente.com risponde 200; `index.html` online identico a gh-pages; 9 video online identici byte per byte (SHA-256) e con richieste parziali (206); riproduzione reale sul sito pubblico in 5 lingue con Chrome Android e WebKit iPhone: 10/10.

#### 5. Cosa NON è stato verificato
- Sincronismo labiale: solo indizi tecnici (audio e video iniziano allo stesso istante, nessun fermo immagine, doppiaggio HeyGen in modalità Precision). Una misura automatica bocca/voce è risultata inconcludente anche sull'originale italiano e non è stata usata. Giudizio a occhio e orecchio: da fare con l'ascolto di Carlo.
- Qualità e naturalezza della voce, pronuncia di «Carlo» in inglese (la trascrizione automatica scrive «Carlos'»): ascolto umano.
- Telefoni veri (iPhone con Safari, Android), Samsung Internet; YouTube reale per la Puntata 0 italiana.

**Commit di questa sessione (ramo `sito-v3-1`):** `2ca4602`, `01d5ea7`, `4bd939c` (acquisizione, autore github-actions), `106da40`, `24640b1`, `5c28c78`, `242cba2` e questa annotazione. **gh-pages:** `bd2b095`. `main` non toccato.


### 25/11/2026 — Video a scatti: diagnosi e correzione pubblicata (Claude)

**Data:** 25/11/2026, dalle 09:28 alle 10:45 circa. **Fonte:** segnalazione di Carlo delle 09:28 («il video va a scatti, tende a bloccarsi»), nell'ambito dell'autorizzazione a correggere e pubblicare dello stesso giorno. Zero crediti HeyGen.

**Diagnosi**
- File: tempi perfettamente regolari (25 fps), indice all'inizio, nessun fermo immagine: i file non sono difettosi. Nei doppiaggi HeyGen ci sono micro-pause di 2–4 fotogrammi (0,08–0,16 s) nel contenuto, poche anche nell'originale italiano: non correggibili senza rigenerare.
- Bitrate della presentazione a tratti 1,7–1,9 Mbit/s. Misura con telefono simulato (Pixel 7, processore rallentato 4×) sul sito pubblicato (run 45588788255): nessun blocco con rete ≥ 1,6 Mbit/s; con rete scarsa (1 Mbit/s) **5 blocchi e 7,3 s di fermo in 40 s (IT), 3 blocchi e 2,5 s (EN)**: compatibile con la segnalazione.
- Pagina: sopra il video di Nora c'era il cervello decorativo animato, con fusione «screen», filtro e maschera, ricalcolato a ogni fotogramma.

**Correzioni (ramo `sito-v3-1`)**
- `index.html`: durante la riproduzione il lettore sta sopra il cervello decorativo; le animazioni decorative (cervello, nastro, marionetta della copertina) e la sfocatura dell'intestazione si fermano finché il video suona (classe `video-attivo`).
- Presentazione **v3**: nuovi file `assets/video/nora-presentazione-<lingua>-v3.mp4`, ricodificati da quelli del 25/11 (H.264 preset fast, CRF 27, massimo 900 kbit/s, audio originale copiato). Circa 9,2–10,2 MB (−27–32%); somiglianza visiva SSIM 0,983–0,985; confronto a vista fatto da Claude, indistinguibili. I file precedenti restano nel repository e online.
- Scartata la **v2** (chiave ogni 2 s, preset slow, audio ricodificato): isolata partiva sempre (prova 45584488417), ma nella pagina su WebKit a volte restava ferma a 0 s (4 casi su 20 in due collaudi). La v3 non ha mai mostrato il problema.

**Prove**
- Rete scarsa 1 Mbit/s, telefono simulato, run 45588788255: **v3 0 blocchi e 0 pause visibili** (IT ed EN); a 1,6 Mbit/s 0 pause contro 1 del pubblicato.
- Collaudo completo ripetuto 2 volte (45588788299, 45588870132): riproduzione reale 25/25 in entrambi; regressioni grafiche 10/10 senza differenze; restano solo i 2 avvisi noti del banner cookie su iPhone FR/DE.
- Prova d'avvio ripetuta (45584488417): 15/15 avvii per variante su iPhone/WebKit, WebKit desktop, Chrome Android.

**Pubblicazione:** gh-pages `89e5f93` (precedente `bd2b095`, recuperabile); deploy 45590780991 riuscito. Verifica pubblica 45591101551: index online = gh-pages; i 5 file v3 e le 4 Puntate 0 online identici (SHA-256) con richieste parziali; riproduzione reale sul sito pubblico 10/10 (Chrome Android, iPhone/WebKit).

**Non fatto / da verificare:** prova sul telefono vero di Carlo e sulla sua rete. La **Puntata 0 doppiata** (circa 1,3 Mbit/s) non è stata toccata perché approvata: con rete molto scarsa potrebbe fermarsi anch'essa; ricodificarla allo stesso modo richiede l'approvazione di Carlo.


### 25/11/2026 — Prenotazione del libro (Claude) — anteprima, NON pubblicata

**Fonte:** richiesta di Carlo del 25/11/2026, ore 20:04 («Aggiornamento sito – Il cervello (ci) mente»: prenotazione gratuita con numerazione da 50.001, modulo, e-mail di conferma, area riservata, 5 lingue). Servizio scelto da Carlo alle 20:10: **Google Fogli + Apps Script** (gratuito). Zero crediti HeyGen, nessun servizio a pagamento.
**Ramo:** `prenotazione-libro` (da `sito-v3-1` a249b1b). `gh-pages` e `main` non toccati.

**Cosa cambia sul sito**
- `index.html`: **solo aggiunte**, un blocco in fondo dopo «07 / Seguici» e prima del piè di pagina: «08 / Il libro · Prenotazione», titolo «Prenota oggi. Leggi domani.», testo «Entra a far parte dei primi lettori…», pulsante «PRENOTA LA TUA COPIA» → `prenota.html?lang=<lingua>`. Nessuna riga esistente modificata (diff: 3 righe aggiunte). Stile e testi del blocco in file nuovi: `css/prenota.css`, `js/prenota-invito.js`.
- `prenota.html` (nuova): modulo con nome e cognome, e-mail, paese (nomi nella lingua della pagina), lingua preferita, formato cartaceo/e-book, consenso facoltativo alla mailing list, presa visione dell'informativa (obbligatoria). Gratuita e senza impegno, nessun pagamento. Dopo l'invio mostra il numero («N. 50.001») e la frase che è un identificativo, non il totale delle copie. Informativa privacy specifica della prenotazione in 5 lingue (da far rileggere a un professionista). File: `js/prenota.js`, `js/prenota-config.js` (indirizzo del servizio, vuoto finché non attivato: il modulo avvisa che le prenotazioni apriranno a breve).
- 5 lingue (IT, EN, FR, ES, DE) per blocco, pagina, messaggi d'errore, informativa ed e-mail; stessa scelta di lingua del sito (`?lang=`, `nora-language`).

**Servizio prenotazioni** (`backend/prenotazioni/`: `Codice.gs`, `Admin.html`, `appsscript.json`, guida `README-ATTIVAZIONE.md`)
- Numerazione: valore iniziale 50.000, prima prenotazione 50.001, +1 a ogni prenotazione registrata; blocco LockService contro i doppioni; se il contatore si perde riparte dall'ultimo numero del Foglio; numeri annullati mai riassegnati.
- Numero progressivo e totale reale separati (totale = righe con stato «attiva»).
- E-mail di conferma automatica nella lingua del sito, con il numero; se la quota Gmail (100/giorno) è esaurita la prenotazione è salvata e la conferma parte con l'attivatore orario.
- Antispam e protezione dei dati: campo nascosto, tempo minimo 2,5 s, massimo 60 prenotazioni in 10 minuti, una sola prenotazione per e-mail (rinvio del numero al massimo 1 volta all'ora), validazione lato servizio, testi che iniziano con `=` mai trasformati in formule (Foglio e CSV).
- Area riservata (stesso progetto, pubblicazione «Solo io» + controllo del proprietario nel codice): prenotazioni effettive, numero progressivo raggiunto, elenco con ricerca e Annulla/Riattiva, mailing list, statistiche per paese/lingua/formato, andamento giornaliero, CSV (prenotazioni, mailing list, statistiche).

**Collaudo**
- Logica del servizio (`test/collaudo-backend.mjs`, Codice.gs vero in ambiente Apps Script simulato): 16/16 prove (50.001-50.002-50.003, 500 prenotazioni senza doppioni, doppioni per e-mail, antispam, quota esaurita, area riservata negata ad anonimi e ad altri account).
- Browser (`test/collaudo-browser.mjs`, sito servito in locale con Codice.gs vero dietro un servizio simulato; banner cookie chiuso con «Rifiuta» come un visitatore):
  - Chromium, 25/11 sera: smartphone Android (Pixel 7), tablet 820 px, desktop 1440 px, smartphone stretto 320 px × 5 lingue = **20/20**: blocco ultimo prima del piè di pagina, testi e link nella lingua giusta, nessuno scorrimento orizzontale, errori del modulo visibili, prenotazione con numero > 50.000 e separatore della lingua, doppione respinto senza nuovo numero, riga salvata con i dati giusti, e-mail con il numero, 0 errori JavaScript.
  - Regressioni home (Chromium, 4 dispositivi × IT/EN): posizione e altezza di tutte le sezioni esistenti identiche alla versione `sito-v3-1` (**8/8**); cambia solo il piè di pagina, spostato dell'altezza del nuovo blocco.
  - GitHub Actions, run [45686100896](https://github.com/Carlo6666/ilcervellocimente-sito/actions/runs/45686100896) (commit d9d3b9a): **WebKit** iPhone 14, iPad, Safari desktop 15/15 e regressioni 6/6; **Firefox** desktop e tablet 10/10 e regressioni 4/4; **Chromium** 20/20 e regressioni 8/8; logica del servizio 16/16 su tutti. Totale 45/45 combinazioni. Immagini scaricabili come artefatti del run.
  - Non verificato: telefoni veri, invio reale da Gmail e area riservata reale su Google (si verificano dopo l'attivazione di Carlo).
- Area riservata vista con 240 prenotazioni di esempio (desktop 1280 px e smartphone 390 px): nessun errore, nessuno scorrimento orizzontale della pagina; CSV mailing list scaricato e corretto (separatore «;», UTF-8 con BOM per Excel).

**Da fare per pubblicare (serve Carlo):** attivare Apps Script con l'account del progetto (guida `backend/prenotazioni/README-ATTIVAZIONE.md`), mandare l'URL `/exec`, approvare l'anteprima. **Da decidere:** l'informativa generale del sito dice ancora «Non ci sono account, moduli o newsletter»; con la prenotazione online non è più vero. Proposta: aggiornare quella frase nelle 5 lingue (unica modifica a un testo esistente), solo con l'ok di Carlo.
