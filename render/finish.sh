#!/usr/bin/env bash
# Finishing pass: light film grain + optional texture overlay + your soundtrack.
#
# usage: render/finish.sh out/raw.mp4 out/final.mp4 [music.wav] [texture.png] [ending-sting.wav]
#   music.wav       main soundtrack (trimmed to the film length)
#   texture.png     optional paper/cloth texture, blended in soft-light at 45 % (bring your own, ≥ 4000x2360)
#   ending-sting    optional short audio for the end card, starts at STING_AT seconds (default 64.8)
set -euo pipefail
RAW="${1:?raw video}"; OUT="${2:?output}"; BGM="${3:-}"; TEX="${4:-}"; STING="${5:-}"
DUR="${DUR:-69.5}"; STING_AT="${STING_AT:-64.8}"
W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$RAW")
H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$RAW")

inputs=(-i "$RAW"); vf="[0:v]noise=alls=4:allf=t[v0]"; vlast="v0"; n=1
if [[ -n "$TEX" ]]; then
  inputs+=(-loop 1 -i "$TEX")
  vf+=";[$n:v]format=rgba,scale=$((W*25/24)):$((H*59/54)),crop=$W:$H:x='(iw-ow)/2+18*sin(t*0.21)':y='(ih-oh)/2+12*cos(t*0.17)',colorchannelmixer=aa=0.45[tx];[$vlast][tx]blend=all_mode=softlight[v1]"
  vlast="v1"; n=$((n+1))
fi
af=""; amap=()
if [[ -n "$BGM" ]]; then
  inputs+=(-i "$BGM"); b=$n; n=$((n+1))
  af="[$b:a]atrim=0:$DUR,asetpts=N/SR/TB[b]"
  if [[ -n "$STING" ]]; then
    inputs+=(-i "$STING"); s=$n; n=$((n+1)); ms=$(python3 -c "print(int($STING_AT*1000))")
    af+=";[$s:a]volume=0.80,adelay=$ms|$ms[s];[b][s]amix=inputs=2:normalize=0,alimiter=limit=0.97[a]"
  else
    af+=";[b]anull[a]"
  fi
  amap=(-map "[a]" -c:a aac -b:a 320k)
fi
fc="$vf"; [[ -n "$af" ]] && fc+=";$af"
ffmpeg -y "${inputs[@]}" -filter_complex "$fc" -map "[$vlast]" "${amap[@]}" -t "$DUR" \
  -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -movflags +faststart "$OUT"
