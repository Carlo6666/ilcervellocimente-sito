// Server locale per l'anteprima: serve il sito e simula il servizio Apps Script con Codice.gs vero.
// Uso: node backend/prenotazioni/test/server-anteprima.mjs [porta]
//  - sito:            http://localhost:PORTA/  (prenota.html punta a /api grazie a ?api=locale)
//  - area riservata:  http://localhost:PORTA/admin  (dati finti di esempio, con ?vuoto=1 senza dati)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { creaAmbiente, post } from './ambiente-finto.mjs';

const qui = path.dirname(fileURLToPath(import.meta.url));
const radice = path.resolve(qui, '../../..');
const porta = Number(process.argv[2] || 8123);

const amb = creaAmbiente({ utenteAttivo: 'ilcervellocimente@gmail.com', quota: 100000 });
amb.g.setup();
amb.g.CONFIG.MAX_IN_10_MINUTI = 1e9;

// Dati di esempio per vedere grafici e tabelle dell'area riservata.
export function popolaEsempio(a, n = 240) {
  const paesi = ['IT', 'IT', 'IT', 'IT', 'CH', 'FR', 'DE', 'ES', 'GB', 'US', 'AT', 'BE', 'AR', 'BR'];
  const lingue = { IT: 'it', CH: 'it', FR: 'fr', DE: 'de', AT: 'de', ES: 'es', AR: 'es', GB: 'en', US: 'en', BE: 'fr', BR: 'en' };
  const sh = a.fogli['Prenotazioni'];
  let seme = 7; const rnd = () => (seme = (seme * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < n; i++) {
    const p = paesi[Math.floor(rnd() * paesi.length)];
    const l = lingue[p];
    const r = post(a, { nome: 'Lettore Prova ' + (i + 1), email: `lettore${i + 1}@example.com`, paese: p, linguaPreferita: rnd() < 0.85 ? l : 'it', formato: rnd() < 0.62 ? 'cartaceo' : 'ebook', mailingList: rnd() < 0.55, privacy: true, linguaSito: l, sito: '', tempo: 9000 });
    if ((i + 1) % 50 === 0) a.svuotaCache();
    // Distribuisce le date sugli ultimi 30 giorni, con un picco dopo il lancio.
    const giorni = Math.floor(Math.pow(rnd(), 1.6) * 30);
    const d = new Date(Date.now() - giorni * 86400000 - Math.floor(rnd() * 36e6));
    sh.dati[sh.dati.length - 1][1] = d;
    if (!r.ok) throw new Error('esempio non creato');
  }
  sh.dati.splice(1, sh.dati.length - 1, ...sh.dati.slice(1).sort((x, y) => x[1] - y[1]).map((r, i) => { r[0] = 50001 + i; return r; }));
  a.g.cambiaStato(50007, 'annullata');
  a.g.cambiaStato(50019, 'annullata');
}

const esempio = creaAmbiente({ utenteAttivo: 'ilcervellocimente@gmail.com', quota: 100000 });
esempio.g.setup();
esempio.g.CONFIG.MAX_IN_10_MINUTI = 1e9;
popolaEsempio(esempio);
const vuoto = creaAmbiente({ utenteAttivo: 'ilcervellocimente@gmail.com' });
vuoto.g.setup();

const tipi = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg' };

function shimAdmin(ambiente) {
  // Simula google.script.run chiamando le funzioni vere di Codice.gs.
  return `<script>window.google={script:{run:(function(){function R(ok,ko){this.ok=ok;this.ko=ko;}
  R.prototype.withSuccessHandler=function(f){return new R(f,this.ko);};R.prototype.withFailureHandler=function(f){return new R(this.ok,f);};
  ['datiAdmin','cambiaStato'].forEach(function(n){R.prototype[n]=function(){var s=this;fetch('/admin-rpc?amb=${ambiente}&f='+n,{method:'POST',body:JSON.stringify([].slice.call(arguments))}).then(function(r){return r.json();}).then(function(j){if(j.errore){s.ko&&s.ko({message:j.errore});}else{s.ok&&s.ok(j.risultato);}});};});
  return new R();})()}};</script>`;
}

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/api' && req.method === 'POST') {
    let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => {
      const out = amb.g.doPost({ postData: { contents: b } });
      res.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' }); res.end(out.testo);
    });
    return;
  }
  if (u.pathname === '/api-registro') { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ righe: amb.fogli['Prenotazioni'].dati, email: amb.inviate })); return; }
  if (u.pathname === '/admin') {
    const a = u.searchParams.get('vuoto') ? 'vuoto' : 'esempio';
    const html = fs.readFileSync(path.join(qui, '..', 'Admin.html'), 'utf8').replace('<script>', shimAdmin(a) + '<script>');
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(html); return;
  }
  if (u.pathname === '/admin-rpc') {
    const a = u.searchParams.get('amb') === 'vuoto' ? vuoto : esempio;
    let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => {
      try { const r = a.g[u.searchParams.get('f')](...JSON.parse(b || '[]')); res.end(JSON.stringify({ risultato: r })); }
      catch (e) { res.end(JSON.stringify({ errore: e.message })); }
    });
    return;
  }
  let p = decodeURIComponent(u.pathname); if (p.endsWith('/')) p += 'index.html';
  // Versione precedente della home (per il confronto delle regressioni), indicata con ORIGINALE=percorso.
  if (p === '/__originale.html' && process.env.ORIGINALE) { res.writeHead(200, { 'content-type': tipi['.html'] }); res.end(fs.readFileSync(process.env.ORIGINALE)); return; }
  const file = path.join(radice, p);
  if (!file.startsWith(radice) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('404'); return; }
  let corpo = fs.readFileSync(file);
  // In anteprima il modulo usa il servizio simulato.
  if (p === '/js/prenota-config.js' && u.searchParams.get('vuoto') !== '1') corpo = Buffer.from("window.PRENOTA_API = '/api';\n");
  res.writeHead(200, { 'content-type': tipi[path.extname(file)] || 'application/octet-stream' });
  res.end(corpo);
}).listen(porta, () => console.log('Anteprima su http://localhost:' + porta));
