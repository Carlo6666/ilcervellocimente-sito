#!/usr/bin/env bash
# IL CERVELLO (CI) MENTE · Puntata 0 doppiata — montaggio standard per il sito (zero crediti HeyGen)
# Scarica i doppiaggi GIÀ ESISTENTI (nessuna generazione), li monta con copertina e cartello tradotti
# e prepara i file per il web + i controlli (durate, volumi, fotogrammi).
# Montaggio: copertina 7,40 s → dissolvenza 0,3 s → cartello 2 s → dissolvenza 0,3 s → Nora doppiata
#            → dissolvenza 0,4 s (sul crema: la copertina parte dal fondo crema) → copertina 7,40 s.
# Volume: la copertina viene portata 1,5 LU sotto la voce di Nora (stessa regola dell'italiano v4).
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
SRC=/tmp/doppiaggi; mkdir -p "$SRC" assets/video docs/verifica-video
REPORT=docs/verifica-video/report.txt
BASE="https://resource2.heygen.ai/video_translate/534d021a89df4804b6909066758b0626"
{
echo "VERIFICA DOPPIAGGI PUNTATA 0 — $(date -u +%Y-%m-%dT%H:%M:%SZ) (GitHub Actions, run ${GITHUB_RUN_ID:-locale})"
echo "Nessuna generazione HeyGen: solo download dei file esistenti."
echo
} > "$REPORT"

lufs() { ffmpeg -nostats -hide_banner -i "$1" -map 0:a:0 -af ebur128=peak=true -f null - 2>&1 | awk '/Integrated loudness/{f=1} f&&/I:/{i=$2} f&&/Peak:/{p=$2} END{print i, p}'; }
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }

for L in en fr es de; do
  U=$(echo "$L" | tr a-z A-Z)
  echo "==================== $U" >> "$REPORT"
  RAW="$SRC/nora-puntata-0-$L.mp4"
  if [ -n "${PROVA_LOCALE:-}" ] && [ -f "$PROVA_LOCALE/$L.mp4" ]; then cp "$PROVA_LOCALE/$L.mp4" "$RAW"; code=200; else
  code=$(curl -sS -L --retry 3 --retry-delay 5 -o "$RAW" -w '%{http_code}' "$BASE-$L/original.mp4" 2>>"$REPORT"); fi
  echo "download: HTTP $code, $(stat -c %s "$RAW" 2>/dev/null || echo 0) byte" >> "$REPORT"
  if [ "$code" != "200" ] || ! ffprobe -v error "$RAW" >/dev/null 2>&1; then
    echo "ESITO: download non riuscito, lingua saltata" >> "$REPORT"; continue
  fi
  echo "sorgente: $(ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels -of compact "$RAW" | tr '\n' ' ')" >> "$REPORT"
  D=$(dur "$RAW"); echo "durata sorgente: $D s" >> "$REPORT"
  read VI VP < <(lufs "$RAW"); echo "voce (sorgente): $VI LUFS, picco $VP dBFS" >> "$REPORT"
  COV="assets/copertina/video/copertina-animata-$L.mp4"; CART="assets/copertina/video/cartello-puntata-0-$L.mp4"
  read CI CP < <(lufs "$COV")
  GAIN=$(awk -v v="$VI" -v c="$CI" 'BEGIN{g=(v-1.5)-c; if(g>12)g=12; if(g<-20)g=-20; printf "%.2f", g}')
  echo "copertina: $CI LUFS → guadagno $GAIN dB (obiettivo voce -1,5 LU)" >> "$REPORT"
  O1=7.1; O2=$(awk -v a=7.4 'BEGIN{printf "%.3f", 7.4+2-0.3-0.3}')
  O3=$(awk -v o="$O2" -v d="$D" 'BEGIN{printf "%.3f", o+d-0.4}')
  OUT="assets/video/puntata-0-$L.mp4"
  NORM='fps=25,format=yuv420p,setsar=1'
  ffmpeg -v error -y -i "$COV" -i "$CART" -i "$RAW" -i "$COV" \
    -f lavfi -t 2 -i "anullsrc=channel_layout=stereo:sample_rate=48000" \
    -filter_complex "\
[0:v]$NORM[c1];[1:v]$NORM[k];\
[2:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xF4EFE3,$NORM[n];\
[3:v]$NORM[c2];\
[c1][k]xfade=transition=fade:duration=0.3:offset=$O1[v1];\
[v1][n]xfade=transition=fade:duration=0.3:offset=$O2[v2];\
[v2][c2]xfade=transition=fade:duration=0.4:offset=$O3,scale=720:1280:flags=lanczos[v];\
[0:a]aresample=48000,aformat=channel_layouts=stereo,volume=${GAIN}dB[a0];\
[4:a]anull[as];\
[2:a]aresample=48000,aformat=channel_layouts=stereo[an];\
[3:a]aresample=48000,aformat=channel_layouts=stereo,volume=${GAIN}dB[a3];\
[a0][as]acrossfade=d=0.3[x1];[x1][an]acrossfade=d=0.3[x2];[x2][a3]acrossfade=d=0.4,alimiter=limit=0.89[a]" \
    -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 23 -profile:v high -pix_fmt yuv420p \
    -c:a aac -b:a 128k -ar 48000 -movflags +faststart "$OUT" 2>>"$REPORT"
  SZ=$(stat -c %s "$OUT" 2>/dev/null || echo 0)
  if [ "$SZ" -gt 25000000 ]; then
    ffmpeg -v error -y -i "$OUT" -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -c:a copy -movflags +faststart "$OUT.tmp.mp4" && mv "$OUT.tmp.mp4" "$OUT"; SZ=$(stat -c %s "$OUT")
  fi
  echo "finale: $OUT, $(dur "$OUT") s, $SZ byte" >> "$REPORT"
  echo "finale: $(ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate -of compact "$OUT" | tr '\n' ' ')" >> "$REPORT"
  read FI FP < <(lufs "$OUT"); echo "finale: $FI LUFS integrati, picco $FP dBFS" >> "$REPORT"
  ffmpeg -nostats -hide_banner -i "$OUT" -af silencedetect=n=-45dB:d=1.5 -f null - 2>&1 | grep -E 'silence_(start|end)' | sed 's/^/silenzio: /' >> "$REPORT"
  # fotogrammi: uno ogni 2 s del filmato finale + sorgente intera ogni 2 s
  ffmpeg -v error -y -i "$OUT" -vf "fps=1/2,scale=144:-1,tile=10x6:padding=4:color=white" -frames:v 1 "docs/verifica-video/$L-finale-ogni-2s.jpg"
  ffmpeg -v error -y -i "$RAW" -vf "fps=1/2,scale=144:-1,tile=10x5:padding=4:color=white" -frames:v 1 "docs/verifica-video/$L-sorgente-heygen-ogni-2s.jpg"
  i=0; rm -f /tmp/k-$L-*.png
  for t in 0.5 3 7.2 8.6 10 $(awk -v o="$O2" 'BEGIN{print o+3}') $(awk -v o="$O3" 'BEGIN{print o-2}') $(awk -v o="$O3" 'BEGIN{print o+7.2}'); do
    i=$((i+1)); ffmpeg -v error -y -ss "$t" -i "$OUT" -frames:v 1 -vf scale=360:-1 "/tmp/k-$L-$i.png"
  done
  ffmpeg -v error -y -pattern_type glob -i "/tmp/k-$L-*.png" -vf "tile=8x1:padding=6:color=white" -frames:v 1 "docs/verifica-video/$L-fotogrammi-chiave.jpg"
  echo "ESITO: montato" >> "$REPORT"
done
echo >> "$REPORT"; echo "FINE" >> "$REPORT"
