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
