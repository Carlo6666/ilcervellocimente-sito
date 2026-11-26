// Server locale per l'anteprima: serve il sito e simula il servizio Apps Script con il Codice.gs vero.
// Uso: node backend/prenotazioni/test/server-anteprima.mjs [porta]
//  - sito:            http://localhost:PORTA/            (il modulo usa il servizio simulato su /api)
//  - area riservata:  http://localhost:PORTA/admin       (dati di prova, @example.com)
//  - controlli di collaudo: POST /__controllo {azzera, soglia, guasti, ritardoMs, totale}
//  - registro:        GET /api-registro                  (righe del Foglio simulato ed e-mail «inviate»)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { creaAmbiente, post } from './ambiente-finto.mjs';

const qui = path.dirname(fileURLToPath(import.meta.url));
const radice = path.resolve(qui, '../../..');
const porta = Number(process.argv[2] || 8123);

function nuovo() {
  const a = creaAmbiente({ utenteAttivo: 'ilcervellocimente@gmail.com', quota: 100000 });
  a.g.setup();
  a.g.CONFIG.MAX_IN_10_MINUTI = 1e9;
  return a;
}
let amb = nuovo();
let ritardoMs = 0;

// Area riservata con dati di prova per vederne tabelle e grafico.
const esempio = nuovo();
{
  let seme = 7; const rnd = () => (seme = (seme * 9301 + 49297) % 233280) / 233280;
  const lingue = ['it', 'it', 'it', 'en', 'fr', 'es', 'de'];
  for (let i = 0; i < 240; i++) {
    post(esempio, { email: `lettore${i + 1}@example.com`, linguaSito: lingue[Math.floor(rnd() * lingue.length)], sito: '', tempo: 9000, richiesta: 'esempio-' + String(i).padStart(4, '0') });
    const sh = esempio.fogli['Prenotazioni libro'];
    sh.dati[sh.dati.length - 1][1] = new Date(Date.now() - (239 - i) * 3 * 3600e3);
  }
  esempio.g.cambiaStato(50332, 'annullata');
}

const tipi = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg' };

function shimAdmin() {
  return `<script>window.google={script:{run:(function(){function R(ok,ko){this.ok=ok;this.ko=ko;}
  R.prototype.withSuccessHandler=function(f){return new R(f,this.ko);};R.prototype.withFailureHandler=function(f){return new R(this.ok,f);};
  ['datiAdmin','cambiaStato','impostaSoglia'].forEach(function(n){R.prototype[n]=function(){var s=this;fetch('/admin-rpc?f='+n,{method:'POST',body:JSON.stringify([].slice.call(arguments))}).then(function(r){return r.json();}).then(function(j){if(j.errore){s.ko&&s.ko({message:j.errore});}else{s.ok&&s.ok(j.risultato);}});};});
  return new R();})()}};</script>`;
}

function corpo(req) { return new Promise((ok) => { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => ok(b)); }); }

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const json = (o) => { res.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' }); res.end(typeof o === 'string' ? o : JSON.stringify(o)); };
  if (u.pathname === '/api' && req.method === 'POST') {
    const b = await corpo(req);
    if (ritardoMs) await new Promise((r) => setTimeout(r, ritardoMs));
    return json(amb.g.doPost({ postData: { contents: b } }).testo);
  }
  if (u.pathname === '/api' && req.method === 'GET') return json(amb.g.doGet({ parameter: Object.fromEntries(u.searchParams) }).testo);
  if (u.pathname === '/__controllo' && req.method === 'POST') {
    const c = JSON.parse((await corpo(req)) || '{}');
    if (c.azzera) amb = nuovo();
    if (c.soglia) amb.props.SOGLIA_COPIE = String(c.soglia);
    if (c.totale != null) { amb.props.COPIE_PRENOTATE = String(c.totale); }
    if (c.guasti != null) amb.stato.salvataggiFalliti = c.guasti;
    if (c.ritardoMs != null) ritardoMs = c.ritardoMs;
    return json({ ok: true });
  }
  if (u.pathname === '/api-registro') return json({ righe: amb.fogli['Prenotazioni libro'].dati, email: amb.inviate, totale: amb.props.COPIE_PRENOTATE, ultimo: amb.props.RIF_ULTIMO });
  if (u.pathname === '/admin') {
    const html = fs.readFileSync(path.join(qui, '..', 'Admin.html'), 'utf8').replace('<script>', shimAdmin() + '<script>');
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(html); return;
  }
  if (u.pathname === '/admin-rpc') {
    const b = await corpo(req);
    try { return json({ risultato: esempio.g[u.searchParams.get('f')](...JSON.parse(b || '[]')) }); }
    catch (e) { return json({ errore: e.message }); }
  }
  let p = decodeURIComponent(u.pathname); if (p.endsWith('/')) p += 'index.html';
  if (p === '/__originale.html' && process.env.ORIGINALE) { res.writeHead(200, { 'content-type': tipi['.html'] }); res.end(fs.readFileSync(process.env.ORIGINALE)); return; }
  const file = path.join(radice, p);
  if (!file.startsWith(radice) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('404'); return; }
  let dati = fs.readFileSync(file);
  // In anteprima il modulo usa il servizio simulato (con ?vuoto=1 la configurazione è vuota: modulo non attivo); mai il servizio Google vero.
  if (p === '/js/prenota-config.js') dati = Buffer.from((req.headers.referer || '').includes('vuoto=1') ? "window.PRENOTA_API = '';\n" : "window.PRENOTA_API = '/api';\n");
  res.writeHead(200, { 'content-type': tipi[path.extname(file)] || 'application/octet-stream' });
  res.end(dati);
}).listen(porta, () => console.log('Anteprima su http://localhost:' + porta));
