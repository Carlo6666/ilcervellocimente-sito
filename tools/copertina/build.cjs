/*
 * IL CERVELLO (CI) MENTE · COPERTINA A LIVELLI IN 5 LINGUE
 * Genera assets/copertina/copertina-<lingua>.svg a partire da:
 *  - i livelli originali della copertina («Copertina — livelli v1.svg» su Drive, 2160x3840),
 *    salvati in assets/copertina/livelli/*.webp (metà risoluzione);
 *  - i testi di testi.json (italiano = livelli originali, intatti; altre lingue = testo vettoriale
 *    composto negli stessi riquadri, con gli stessi caratteri e la stessa ombra).
 * Uso: node build.cjs <cartella node_modules con opentype.js> <cartella font>
 * Nessun elemento grafico (cervello, fili, corona, raggi, riquadro, linee) viene ridisegnato.
 */
const fs = require('fs');
const path = require('path');
const NM = process.argv[2];
const FONTS = process.argv[3];
const opentype = require(path.join(NM, 'opentype.js'));
const load = (f) => opentype.parse(fs.readFileSync(f));
const ROOT = path.resolve(__dirname, '../..');
const T = JSON.parse(fs.readFileSync(path.join(__dirname, 'testi.json'), 'utf8'));

const font = {
  anton: load(path.join(FONTS, 'Anton-Regular.ttf')),
  popBold: load(path.join(FONTS, 'Poppins-Bold.ttf')),
  popBoldIt: load(path.join(FONTS, 'Poppins-BoldItalic.ttf')),
  popXBoldIt: load(path.join(FONTS, 'poppins-latin-800-italic.woff')),
};
const INK = '#101010', SHADOW = '#D9D0C1', GREY = '#7B7569';
const L = 'assets/copertina/livelli/';

// Composizione di un testo con spaziatura (in em) e crenatura: restituisce un opentype.Path a size 1000
function layout(f, text, trackEm = 0) {
  const size = 1000;
  const p = new opentype.Path();
  const glyphs = f.stringToGlyphs(text);
  let x = 0;
  glyphs.forEach((g, i) => {
    const gp = g.getPath(x, 0, size);
    p.extend(gp);
    x += g.advanceWidth * size / f.unitsPerEm;
    if (i < glyphs.length - 1) x += f.getKerningValue(g, glyphs[i + 1]) * size / f.unitsPerEm + trackEm * size;
  });
  return p;
}
const bb = (p) => p.getBoundingBox();
// Trasforma un path (size 1000) nello spazio della copertina: scala s, poi traslazione
function placed(p, s, tx, ty) {
  return `<path transform="matrix(${s.toFixed(5)} 0 0 ${s.toFixed(5)} ${tx.toFixed(1)} ${ty.toFixed(1)})" d="${p.toPathData(1)}"/>`;
}
// Adatta l'inchiostro del testo a un riquadro: altezza target, larghezza massima, centro orizzontale, base in basso
function fitInk(p, { capH, maxW, cx, bottom, top }) {
  const b = bb(p);
  const h = b.y2 - b.y1, w = b.x2 - b.x1;
  let s = capH / h;
  if (w * s > maxW) s = maxW / w;
  const tx = cx - (b.x1 + w / 2) * s;
  const ty = top !== undefined ? top - b.y1 * s : bottom - b.y2 * s;
  return { s, tx, ty, w: w * s, h: h * s, x1: tx + b.x1 * s, x2: tx + b.x2 * s, y1: ty + b.y1 * s, y2: ty + b.y2 * s };
}
function shadowed(p, f, offset) {
  return `<g fill="${SHADOW}">${placed(p, f.s, f.tx + offset, f.ty + offset)}</g><g fill="${INK}">${placed(p, f.s, f.tx, f.ty)}</g>`;
}
// Titoli grandi su una riga; se la riga si stringe troppo va su due righe (stessa base)
function bigTitle(text, box, offset, righe) {
  const one = layout(font.anton, text);
  const f1 = fitInk(one, box);
  const words = text.split(' ');
  if (righe !== 2 || words.length < 2) {
    // una riga: centrata verticalmente nello spazio della parola originale
    const f = fitInk(one, { ...box, bottom: box.bottom - (box.capH - f1.h) / 2 });
    bigTitle.bottom = f.y2;
    return shadowed(one, f, offset * Math.max(0.6, f.h / box.capH));
  }
  // due righe bilanciate
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' '), c = words.slice(i).join(' ');
    const d = Math.abs(a.length - c.length);
    if (!best || d < best.d) best = { a, c, d };
  }
  const gap = box.capH * 0.06, lineH = (box.capH - gap) / 2;
  const pa = layout(font.anton, best.a), pc = layout(font.anton, best.c);
  const fa = fitInk(pa, { capH: lineH, maxW: box.maxW, cx: box.cx, bottom: box.bottom - lineH - gap });
  const fc = fitInk(pc, { capH: lineH, maxW: box.maxW, cx: box.cx, bottom: box.bottom });
  bigTitle.bottom = fc.y2;
  return shadowed(pa, fa, offset * 0.75) + shadowed(pc, fc, offset * 0.75);
}

// Taratura sul testo italiano originale (misure in pixel dei livelli)
const IT = T.it;
const capPer = (() => { const p = layout(font.popBold, IT.prima, 0); const b = bb(p); return b.y2 - b.y1; })();
// «PER SMETTERE DI FAR»: inchiostro 1199 x 66 px, base 1761 → spaziatura ricavata
function trackingFor(text, targetW, capH) {
  const b0 = bb(layout(font.popBold, text, 0));
  const s = capH / (b0.y2 - b0.y1);
  const n = [...text].length - 1;
  return ((targetW / s) - (b0.x2 - b0.x1)) / n / 1000;
}
const TRACK = trackingFor(IT.prima, 1199, 66);
// Frase in basso: dimensione ricavata dalla prima riga italiana (1668 px)
const tagSize = (() => { const p = layout(font.popXBoldIt, IT.frase[0]); const b = bb(p); return 1668 / (b.x2 - b.x1); })();

function svgFor(lang) {
  const t = T[lang];
  const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 2160 3840" role="img" aria-label="${t.alt.replace(/"/g, '&quot;')}">`);
  o.push(`<rect class="cv-fondo" width="2160" height="3840" fill="#F4EFE3"/>`);
  const img = (cls, file, x, y, w, h) => `<g class="cv-el ${cls}"><image href="${L}${file}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none"/></g>`;
  // 02 autore (uguale in tutte le lingue)
  o.push(img('cv-autore', '02-autore.webp', 148, 151, 1886, 64));
  if (lang === 'it') {
    o.push(img('cv-titolo', '03-titolo-it.webp', 243, 288, 1720, 418));
    o.push(img('cv-ci', '04-ci-it.webp', 386, 830, 355, 232));
    o.push(`<g class="cv-el cv-riquadro"><image href="${L}05a-riquadro.webp" x="760" y="694" width="1103" height="507" preserveAspectRatio="none"/><image href="${L}05b-mente-it.webp" x="840" y="726" width="905" height="384" preserveAspectRatio="none"/></g>`);
    o.push(img('cv-manuale', '06-manuale-it.webp', 197, 1228, 1804, 328));
  } else {
    // 03 titolo riga 1
    const p1 = layout(font.anton, t.titolo);
    const f1 = fitInk(p1, { capH: 413, maxW: 1810, cx: 1092, bottom: 704 });
    o.push(`<g class="cv-el cv-titolo">${shadowed(p1, f1, 22)}</g>`);
    // riga 2: parentesi + riquadro arancione con la parola
    const pw = layout(font.anton, t.verbo);
    const bw = bb(pw);
    const wordFit = fitInk(pw, { capH: 380, maxW: 860, cx: 0, bottom: 0 });
    const boxScale = Math.max(0.72, Math.min(1, (wordFit.w + 200) / 1103));
    const boxW = 1103 * boxScale;
    const pc = layout(font.popBoldIt, t.parentesi);
    const bc = bb(pc);
    let cs = 225 / (bc.y2 - bc.y1);
    let cw = (bc.x2 - bc.x1) * cs;
    const gap = 22;
    const maxRow = 1900;
    if (cw + gap + boxW > maxRow) { cs *= (maxRow - boxW - gap) / cw; cw = (bc.x2 - bc.x1) * cs; }
    const rowW = cw + gap + boxW, rowX = 1126 - rowW / 2;
    const boxX = t.parentesiDopo ? rowX : rowX + cw + gap;
    const ciX = t.parentesiDopo ? rowX + boxW + gap : rowX;
    const ciH = (bc.y2 - bc.y1) * cs;
    const ciTx = ciX - bc.x1 * cs, ciTy = (833 + 225) - bc.y2 * cs - (225 - ciH) / 2;
    o.push(`<g class="cv-el cv-ci" fill="${INK}">${placed(pc, cs, ciTx, ciTy)}</g>`);
    const wcx = boxX + boxW * (950 / 1103) / 2 + boxW * 0.03; // centro utile del riquadro (senza l'ombra nera a destra)
    const wf = fitInk(pw, { capH: 380 * Math.min(1, wordFit.s / (380 / (bw.y2 - bw.y1))), maxW: boxW * 0.80, cx: wcx, bottom: 1106 });
    o.push(`<g class="cv-el cv-riquadro"><image href="${L}05a-riquadro.webp" x="${boxX.toFixed(1)}" y="694" width="${boxW.toFixed(1)}" height="507" preserveAspectRatio="none"/>` +
      `<g fill="#FFFFFF" transform="rotate(-2.2 ${wcx.toFixed(1)} 916) translate(${wcx.toFixed(1)} 916) skewX(-9) translate(${(-wcx).toFixed(1)} -916)">${placed(pw, wf.s, wf.tx, wf.ty)}</g></g>`);
    // 06 manuale
    const pm = layout(font.anton, t.manuale);
    const fm = fitInk(pm, { capH: 301, maxW: 1840, cx: 1090, bottom: 1532 });
    o.push(`<g class="cv-el cv-manuale">${shadowed(pm, fm, 17)}</g>`);
  }
  o.push(img('cv-linea', '07-linea-titolo.webp', 652, 1567, 878, 64));
  // 08 «per smettere di far» + linee
  if (lang === 'it') {
    o.push(img('cv-prima', '08-sottotitolo-it.webp', 149, 1692, 1882, 73));
  } else {
    const pp = layout(font.popBold, t.prima, TRACK);
    const fp = fitInk(pp, { capH: 66, maxW: 1620, cx: 1086, bottom: 1761 });
    const gapL = 59, left = fp.x1 - gapL, right = fp.x2 + gapL;
    const lines = (left > 200 ? `<rect x="152" y="1729" width="${(left - 152).toFixed(1)}" height="8" fill="${GREY}"/>` : '') +
      (right < 1960 ? `<rect x="${right.toFixed(1)}" y="1729" width="${(2028 - right).toFixed(1)}" height="8" fill="${GREY}"/>` : '');
    o.push(`<g class="cv-el cv-prima">${lines}<g fill="${INK}">${placed(pp, fp.s, fp.tx, fp.ty)}</g></g>`);
  }
  // 09 parola grande
  if (lang === 'it') o.push(img('cv-grande', '09-cazzate-it.webp', 111, 1819, 1979, 639));
  else o.push(`<g class="cv-el cv-grande">${bigTitle(t.grande, { capH: 605, maxW: 1960, cx: 1086, bottom: 2427 }, 26, t.grandeRighe)}</g>`);
  // marionetta: fili + corona + cervello (stesso gruppo, oscilla dal punto alto dei fili)
  const clipY = lang === 'it' ? 0 : Math.max(2017, bigTitle.bottom - 30);
  o.push(`<g class="cv-el cv-marionetta"><g class="cv-marionetta-oscilla">` +
    (clipY ? `<clipPath id="cv-clip-${lang}"><rect x="0" y="${clipY.toFixed(0)}" width="2160" height="1800"/></clipPath>` : '') +
    `<image ${clipY ? `clip-path="url(#cv-clip-${lang})" ` : ''}href="${L}10-fili.webp" x="548" y="2017" width="1081" height="881" preserveAspectRatio="none"/>` +
    `<image href="${L}12-cervello.webp" x="526" y="2599" width="1066" height="859" preserveAspectRatio="none"/>` +
    `<image href="${L}11-corona.webp" x="851" y="2445" width="504" height="203" preserveAspectRatio="none"/></g></g>`);
  o.push(img('cv-raggi', '13-raggi.webp', 393, 2582, 1335, 271));
  // 14 frase in basso
  if (lang === 'it') o.push(img('cv-frase', '14-frase-it.webp', 302, 3496, 1675, 233));
  else {
    const rows = t.frase;
    let s = tagSize;
    const paths = rows.map((r) => layout(font.popXBoldIt, r));
    const maxw = Math.max(...paths.map((p) => bb(p).x2 - bb(p).x1));
    if (maxw * s > 1800) s = 1800 / maxw;
    const bases = [3577, 3706];
    o.push(`<g class="cv-el cv-frase" fill="${INK}">` + paths.map((p, i) => { const b = bb(p); return placed(p, s, 1139 - (b.x1 + (b.x2 - b.x1) / 2) * s, bases[i]); }).join('') + `</g>`);
  }
  o.push(img('cv-fondo-linea', '15-linea-fondo.webp', 741, 3779, 690, 24));
  o.push('</svg>');
  return o.join('\n');
}

for (const lang of Object.keys(T)) {
  const out = path.join(ROOT, 'assets/copertina', `copertina-${lang}.svg`);
  fs.writeFileSync(out, svgFor(lang));
  console.log(lang, (fs.statSync(out).size / 1024).toFixed(1) + ' KB');
}
console.log('tracking', TRACK.toFixed(4), 'tag size', tagSize.toFixed(4));
