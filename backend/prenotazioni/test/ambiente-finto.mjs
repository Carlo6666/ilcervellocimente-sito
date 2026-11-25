// Ambiente Google Apps Script simulato in memoria, per collaudare Codice.gs senza un account Google.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const qui = path.dirname(fileURLToPath(import.meta.url));

export function creaAmbiente({ utenteAttivo = '', proprietario = 'ilcervellocimente@gmail.com', quota = 100 } = {}) {
  const fogli = {};
  const props = {};
  const cache = {};
  const inviate = [];
  const triggers = [];
  const stato = { quota, utenteAttivo, mailFallisce: false };

  function creaFoglio(nome) {
    const dati = [];
    const sh = {
      dati,
      getName: () => nome,
      getLastRow: () => dati.length,
      appendRow: (r) => { dati.push(r.slice()); },
      setFrozenRows() {},
      getRange(a, b, c, d) {
        if (typeof a === 'string') return { setNumberFormat() { return this; }, setFontWeight() { return this; } };
        const r0 = a, c0 = b, nr = c || 1, nc = d || 1;
        return {
          getValue: () => (dati[r0 - 1] || [])[c0 - 1],
          getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => { const v = (dati[r0 - 1 + i] || [])[c0 - 1 + j]; return v === undefined ? '' : v; })),
          setValue: (v) => { dati[r0 - 1][c0 - 1] = v; },
          setFontWeight() { return this; }, setNumberFormat() { return this; },
          createTextFinder(testo) {
            let intera = false, maiuscole = false;
            const tf = {
              matchEntireCell(x) { intera = x; return tf; }, matchCase(x) { maiuscole = x; return tf; },
              findNext() {
                for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) {
                  let v = String((dati[r0 - 1 + i] || [])[c0 - 1 + j] ?? '');
                  let q = String(testo);
                  if (!maiuscole) { v = v.toLowerCase(); q = q.toLowerCase(); }
                  if (intera ? v === q : v.includes(q)) return { getRow: () => r0 + i };
                }
                return null;
              }
            };
            return tf;
          }
        };
      }
    };
    return sh;
  }
  const ss = {
    getId: () => 'FOGLIO-TEST',
    getSheetByName: (n) => fogli[n] || null,
    insertSheet: (n) => (fogli[n] = creaFoglio(n))
  };
  let bloccato = false;
  const g = {
    console: { error() {}, log() {} },
    Logger: { log() {} },
    Intl,
    SpreadsheetApp: { getActiveSpreadsheet: () => ss, openById: () => ss, flush() {} },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = String(v); } }) },
    CacheService: { getScriptCache: () => ({ get: (k) => cache[k] ?? null, put: (k, v) => { cache[k] = v; } }) },
    LockService: { getScriptLock: () => ({ tryLock: () => { if (bloccato) return false; bloccato = true; return true; }, waitLock() { bloccato = true; }, releaseLock: () => { bloccato = false; } }) },
    MailApp: {
      getRemainingDailyQuota: () => stato.quota,
      sendEmail: (m) => { if (stato.mailFallisce) throw new Error('errore Gmail'); stato.quota--; inviate.push(m); }
    },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ testo: t, setMimeType() { return this; } }) },
    Utilities: { formatDate: (d) => d.toISOString().replace('T', ' ').slice(0, 19) },
    Session: { getActiveUser: () => ({ getEmail: () => stato.utenteAttivo }), getEffectiveUser: () => ({ getEmail: () => proprietario }) },
    HtmlService: {
      XFrameOptionsMode: { DEFAULT: 0 },
      createHtmlOutput: (h) => ({ html: h, setTitle() { return this; } }),
      createTemplateFromFile: (n) => ({ evaluate: () => ({ html: fs.readFileSync(path.join(qui, '..', n + '.html'), 'utf8'), setTitle() { return this; }, addMetaTag() { return this; }, setXFrameOptionsMode() { return this; } }) }),
      createHtmlOutputFromFile: (n) => ({ getContent: () => fs.readFileSync(path.join(qui, '..', n + '.html'), 'utf8') })
    },
    ScriptApp: { getProjectTriggers: () => triggers, newTrigger: (f) => ({ timeBased: () => ({ everyHours: () => ({ create: () => triggers.push({ getHandlerFunction: () => f }) }) }) }) }
  };
  vm.createContext(g);
  vm.runInContext(fs.readFileSync(path.join(qui, '..', 'Codice.gs'), 'utf8'), g, { filename: 'Codice.gs' });
  return { g, fogli, props, cache, inviate, triggers, stato, svuotaCache: () => { for (const k in cache) delete cache[k]; } };
}

export function post(amb, dati) {
  const out = amb.g.doPost({ postData: { contents: JSON.stringify(dati) } });
  return JSON.parse(out.testo);
}
