#!/usr/bin/env bash
# build-dalia-rig.sh — buduje sprite'y Dalii z wygenerowanych kadrów na zielonym tle.
#
# Wejście:  tools/rig-src/dalia-canon-*.png  (1024x1024, pies na chroma-green #00b140)
# Wyjście:  app/assets/img/dalia-rig/dalia-<stan>.png  (przezroczyste, znormalizowane)
#
# Filozofia: NIE tniemy psa na kawałki (organiczne futro daje wtedy dziury/szwy).
# Każdy stan to KOMPLETNA sylwetka -> zero ryzyka ucięcia. Animację robimy w CSS
# (oddech, squash&stretch, bob, tilt) + nakładki rysowane w CSS (mruganie, zzz, serca).
#
# Normalizacja: wszystkie stany "stojące/siedzące" mają wspólną wysokość i wspólną
# linię podłoża (gravity south), więc podmiana sprite'a NIE powoduje przeskoku skali.
#
# Wymaga: ImageMagick 7 (magick)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/tools/rig-src"
OUT="$ROOT/app/assets/img/dalia-rig"
WORK="$SRC/_work"
mkdir -p "$OUT" "$WORK"

KEYCOLOR="#00b140"   # zielony ekran z generacji
FUZZ="22%"           # tolerancja usuwania tła

# Docelowy canvas sprite'a i wysokość sylwetki wewnątrz niego.
# Pracujemy w 1024, na końcu skalujemy do FINAL (lżejsza PWA, wciąż ostre 2x).
CANVAS=1024
FINAL=640
# wysokość psa dla poz pionowych (sit/eat/sad) — wspólna, żeby nie "skakał"
UPRIGHT_H=840
# pozy o innej sylwetce skalujemy do szerokości, nie wysokości
WIDE_H=540
# margines dolny (px) — wspólna linia podłoża, ale bez dotykania krawędzi kadru
BASE_MARGIN=70

# --- chroma-key + despill ---
key() {
  local in="$1" out="$2"
  magick "$in" -alpha set \
    -bordercolor "$KEYCOLOR" -border 1 \
    -fuzz "$FUZZ" -fill none -draw "color 0,0 floodfill" \
    -shave 1x1 +repage \
    -fuzz "$FUZZ" -fill none -opaque "$KEYCOLOR" \
    "$WORK/_keyed.png"
  # despill: ogranicz kanał G do max(R,B) -> znika zielone obrzeże na krawędzi futra
  magick "$WORK/_keyed.png" \
    \( +clone -channel R -separate +channel \) \
    \( "$WORK/_keyed.png" -channel B -separate +channel \) \
    -evaluate-sequence max \
    "$WORK/_maxrb.png"
  magick "$WORK/_keyed.png" "$WORK/_maxrb.png" \
    -channel G -compose Darken -composite +channel \
    "$out"
}

# Normalizuje do wspólnego canvasu: trim -> resize do zadanej wysokości -> wyśrodkuj,
# osadź na dnie ze wspólnym marginesem (wspólna linia podłoża), dopełnij do CANVAS.
# Margines dolny gwarantuje, że łapy nie dotykają krawędzi (bramka jakości).
normalize() {
  local in="$1" out="$2" target_h="$3"
  magick "$in" -trim +repage \
    -resize "x${target_h}" \
    -background none -gravity south -splice "0x${BASE_MARGIN}" \
    -gravity center -background none -extent "${CANVAS}x${CANVAS}" \
    +repage "$out"
}

echo "== budowa sprite'ów Dalii =="
# Pozy pionowe (wspólna skala i baseline)
for name in sit eat sad; do
  key "$SRC/dalia-canon-$name.png" "$WORK/keyed-$name.png"
  normalize "$WORK/keyed-$name.png" "$OUT/dalia-$name.png" "$UPRIGHT_H"
  echo "  -> dalia-$name.png (h=$UPRIGHT_H)"
done

# BLINK: musi się PIKSELOWO pokrywać z 'sit' (tylko oczy się różnią),
# więc używamy DOKŁADNIE tego samego bounding boxa i skali co 'sit'.
key "$SRC/dalia-canon-blink.png" "$WORK/keyed-blink.png"
SIT_TRIM=$(magick "$WORK/keyed-sit.png" -format "%@" info:)   # WxH+X+Y bbox psa w 'sit'
# przytnij blink identycznym oknem jak sit, potem identyczna normalizacja
magick "$WORK/keyed-blink.png" -crop "$SIT_TRIM" +repage "$WORK/blink-crop.png"
magick "$WORK/blink-crop.png" \
  -resize "x${UPRIGHT_H}" \
  -background none -gravity south -splice "0x${BASE_MARGIN}" \
  -gravity center -background none -extent "${CANVAS}x${CANVAS}" +repage \
  "$OUT/dalia-blink.png"
echo "  -> dalia-blink.png (aligned to sit)"

# Pozy o innej sylwetce (skalowane osobno, osadzone na dnie)
key "$SRC/dalia-canon-bow.png" "$WORK/keyed-bow.png"
normalize "$WORK/keyed-bow.png" "$OUT/dalia-bow.png" 640
echo "  -> dalia-bow.png"

key "$SRC/dalia-canon-sleep.png" "$WORK/keyed-sleep.png"
normalize "$WORK/keyed-sleep.png" "$OUT/dalia-sleep.png" "$WIDE_H"
echo "  -> dalia-sleep.png"

# Skalowanie do rozmiaru docelowego + optymalizacja PNG (lżejsza PWA)
echo "== skalowanie do ${FINAL}px + optymalizacja =="
for f in "$OUT"/dalia-*.png; do
  magick "$f" -resize "${FINAL}x${FINAL}" -strip -define png:compression-level=9 "$f"
done

echo "gotowe -> $OUT"
magick identify -format "%f  %wx%h  %b\n" "$OUT"/dalia-*.png
