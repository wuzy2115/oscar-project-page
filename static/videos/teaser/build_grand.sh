#!/usr/bin/env bash
# Build the OSCAR teaser MP4: 2x4 grid of 8 embodiment tiles. Each tile is a
# single clip (clip_a) with a baked-in `<embodiment> · <task>` caption. Using
# one clip per tile avoids the mid-roll flash that the old 2-clip concat had.
# Source comparison.mp4 files live on NFS and are 1920x510 (30px text bar on
# top + 480px panel row below).
set -euo pipefail
cd "$(dirname "$0")"

MANIFEST="manifest.json"
OUT="grand.mp4"
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

FPS=16

jq -c '.tiles[]' "$MANIFEST" > "$TMPDIR/tiles.jsonl"

TILE_PATHS=()
while IFS= read -r tile; do
  slot=$(echo "$tile"       | jq -r '.slot')
  clip=$(echo "$tile"       | jq -r '.clip_a')
  panel_w=$(echo "$tile"    | jq -r '.panel_w')
  embodiment=$(echo "$tile" | jq -r '.embodiment')
  task=$(echo "$tile"       | jq -r '.task_a')

  # Compose baked-in caption.
  if [ -n "$task" ]; then cap="${embodiment} · ${task}"; else cap="$embodiment"; fi
  # Escape ffmpeg drawtext special chars.
  esc()  { printf '%s' "$1" | sed "s/\\\\/\\\\\\\\/g; s/'/\\\\'/g; s/:/\\\\:/g"; }
  cap_esc=$(esc "$cap")

  # Crop / pad math.
  if [ "$panel_w" -eq 480 ]; then
    # AgiBot: 480 content centered inside 640-wide Ours slot
    CROP="crop=480:480:80:30"
    PAD="pad=640:480:80:0:black"
  else
    CROP="crop=640:480:0:30"
    PAD=""   # already 640x480 after crop
  fi
  VF_PRE="$CROP${PAD:+,$PAD},fps=${FPS},setpts=PTS-STARTPTS"

  # Single clip + baked caption on a translucent bottom strip.
  ffmpeg -y -i "$clip" \
    -vf "$VF_PRE,\
drawbox=x=0:y=ih-32:w=iw:h=32:color=black@0.6:t=fill,\
drawtext=fontcolor=white:fontsize=20:x=(w-text_w)/2:y=h-26:text='${cap_esc}'" \
    -an -c:v libx264 -crf 23 -pix_fmt yuv420p "$TMPDIR/slot${slot}.mp4" >/dev/null 2>&1

  TILE_PATHS+=("$TMPDIR/slot${slot}.mp4")
done < "$TMPDIR/tiles.jsonl"

# 2x4 grid (4 cols × 2 rows). All tiles are 640x480 → final 2560x960.
ffmpeg -y \
  -i "${TILE_PATHS[0]}" -i "${TILE_PATHS[1]}" -i "${TILE_PATHS[2]}" -i "${TILE_PATHS[3]}" \
  -i "${TILE_PATHS[4]}" -i "${TILE_PATHS[5]}" -i "${TILE_PATHS[6]}" -i "${TILE_PATHS[7]}" \
  -filter_complex "[0:v][1:v][2:v][3:v][4:v][5:v][6:v][7:v]xstack=inputs=8:layout=0_0|w0_0|w0+w1_0|w0+w1+w2_0|0_h0|w0_h0|w0+w1_h0|w0+w1+w2_h0[v]" \
  -map "[v]" -c:v libx264 -crf 23 -pix_fmt yuv420p -movflags +faststart "$OUT"

echo "Built $OUT"
ffprobe -v error -show_entries stream=width,height,duration,r_frame_rate -of default=noprint_wrappers=1 "$OUT"
ls -lh "$OUT"
