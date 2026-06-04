#!/usr/bin/env bash
# Build OSCAR Data section sample clips: 8 datasets x 4 clips, each exactly
# 5.0 s of training RGB. Source clips are looped if shorter than 5 s and
# trimmed from the start if longer. Native fps and native resolution
# are preserved (no spatial scaling, no fps unification).
set -euo pipefail
cd "$(dirname "$0")"

MANIFEST="manifest.json"
TARGET_SECONDS=5

if [ ! -f "$MANIFEST" ]; then
  echo "missing $MANIFEST -- run select_episodes.py first" >&2
  exit 1
fi

n_datasets=$(jq '.datasets | length' "$MANIFEST")
[ "$n_datasets" -eq 8 ] || { echo "expected 8 datasets, got $n_datasets" >&2; exit 1; }

for i in $(seq 0 $((n_datasets - 1))); do
  ds_id=$(jq -r ".datasets[$i].id" "$MANIFEST")
  outdir="$ds_id"
  mkdir -p "$outdir"
  for j in $(seq 0 3); do
    src=$(jq -r ".datasets[$i].clips[$j].src" "$MANIFEST")
    dst="$outdir/$((j + 1)).mp4"
    if [ ! -f "$src" ]; then
      echo "missing source: $src" >&2
      exit 1
    fi
    ffmpeg -y -stream_loop -1 -i "$src" -t "$TARGET_SECONDS" \
      -an -c:v libx264 -crf 23 -pix_fmt yuv420p -movflags +faststart "$dst" >/dev/null 2>&1
    echo "$dst"
  done
done
echo "Built 32 clips."
