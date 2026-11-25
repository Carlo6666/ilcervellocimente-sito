# Prenotazioni del libro — attivazione (gratuita, circa 10 minuti)

Servizio usato: **Google Fogli + Google Apps Script**, con l'account Google del progetto
(**ilcervellocimente@gmail.com**, consigliato: le e-mail di conferma partono da questo indirizzo).
Nessun costo, nessuna carta di credito. Limite di Gmail: **100 e-mail di conferma al giorno**
(le prenotazioni oltre il limite vengono comunque registrate e la conferma parte automaticamente il giorno dopo).

## 1. Foglio e codice

1. Accedi a Google con **ilcervellocimente@gmail.com** e crea un Foglio Google vuoto, per esempio «Prenotazioni libro».
2. Nel Foglio: menu **Estensioni → Apps Script**.
3. Nel file `Codice.gs` che si apre, cancella tutto e incolla il contenuto di [`Codice.gs`](Codice.gs).
4. A sinistra, **+ → HTML**, chiamalo `Admin` (senza «.html») e incolla il contenuto di [`Admin.html`](Admin.html).
5. **Impostazioni progetto** (ingranaggio) → spunta «Mostra il file manifest "appsscript.json"» → torna all'editor e incolla in `appsscript.json` il contenuto di [`appsscript.json`](appsscript.json) (fuso orario Europa/Roma).
6. Salva (icona del dischetto).

## 2. Prima esecuzione (autorizzazioni)

1. In alto scegli la funzione **`setup`** e premi **Esegui**.
2. Google chiede le autorizzazioni (Fogli, invio e-mail, attivatori): **Rivedi autorizzazioni → scegli l'account → Avanzate → Vai al progetto → Consenti**.
   È normale che compaia «Google non ha verificato questa app»: l'app è tua e la usi solo tu.
3. Nel registro di esecuzione compare «Pronto. Ultimo numero assegnato: 50000». Nel Foglio c'è la scheda **Prenotazioni** con le intestazioni.

`setup` crea anche un attivatore orario che invia le conferme rimaste in attesa.

## 3. Due pubblicazioni dello stesso progetto

**A. Servizio per il sito (pubblico)**
1. **Esegui il deployment → Nuovo deployment → tipo «App web»**.
2. Descrizione: `Sito`. Esegui come: **Me**. Chi ha accesso: **Chiunque**.
3. **Esegui il deployment** e copia l'**URL dell'app web** (finisce con `/exec`).
4. Mandalo a Claude: verrà inserito in `js/prenota-config.js` (`window.PRENOTA_API = '…/exec';`).

**B. Area amministrativa (solo tu)**
1. **Esegui il deployment → Nuovo deployment → «App web»**.
2. Descrizione: `Area riservata`. Esegui come: **Me**. Chi ha accesso: **Solo io**.
3. Copia l'URL e salvalo nei preferiti: è la tua area riservata.

Protezione dell'area riservata: Google chiede l'accesso con l'account del progetto (con la sua verifica in due passaggi,
se attiva — consigliata) e il codice controlla comunque che chi apre la pagina sia il proprietario dello script.
Aprendo l'URL pubblico (A) senza essere il proprietario si vede solo «Accesso riservato».
Per dare accesso a un'altra persona: Impostazioni progetto → Proprietà script → `ADMIN_EXTRA` = indirizzi separati da virgola
(la persona deve anche poter aprire la pubblicazione B: in quel caso scegliere «Chiunque abbia un account Google»).

## 4. Cosa c'è nell'area riservata

- **Prenotazioni effettive** (totale reale, solo le prenotazioni attive) e **numero progressivo raggiunto** (identificativo, parte da 50.001): sempre separati.
- Elenco delle richieste con ricerca; pulsante **Annulla / Riattiva** (il numero di una prenotazione annullata non viene mai riassegnato).
- Mailing list (solo chi ha dato il consenso).
- Statistiche per paese, lingua preferita, lingua del sito, cartaceo/e-book; andamento giornaliero.
- Esportazione **CSV** (prenotazioni, mailing list, statistiche), apribile con Excel o Numbers.

Il Foglio Google resta la copia completa dei dati: non modificare a mano la colonna «Numero».

## 5. Come funziona

- Numerazione: valore iniziale 50.000; la prima prenotazione riceve 50.001, poi +1 per ogni prenotazione registrata.
  Un blocco (LockService) impedisce numeri doppi anche con invii simultanei; se il contatore andasse perso riparte dall'ultimo numero nel Foglio.
- Stessa e-mail → nessun nuovo numero: la conferma con il numero già assegnato viene rinviata (al massimo una volta all'ora).
- Antispam: campo nascosto per i programmi automatici, tempo minimo di compilazione, massimo 60 prenotazioni ogni 10 minuti, controllo dei campi.
  Un testo che inizia con `=` non viene mai interpretato come formula.
- E-mail di conferma nella lingua usata sul sito (IT, EN, FR, ES, DE), con il numero e la spiegazione che non è il totale delle copie.

## 6. Aggiornare il codice

Dopo una modifica a `Codice.gs` o `Admin.html`: **Esegui il deployment → Gestisci deployment → (matita) → Versione: Nuova versione → Esegui il deployment**,
per **entrambe** le pubblicazioni. Gli URL non cambiano.

## 7. Collaudo senza account Google

- `node backend/prenotazioni/test/collaudo-backend.mjs` — logica del servizio (numerazione, antispam, e-mail, area riservata).
- `node backend/prenotazioni/test/server-anteprima.mjs` — sito con servizio simulato su http://localhost:8123 (area riservata di esempio: `/admin`).
- `node backend/prenotazioni/test/collaudo-browser.mjs chromium|webkit|firefox` — collaudo nel browser (smartphone, tablet, desktop, 5 lingue).
