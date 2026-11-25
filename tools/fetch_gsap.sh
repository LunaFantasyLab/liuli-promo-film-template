#!/usr/bin/env bash
# Download the GSAP runtime the film uses (not redistributed in this repo; see https://gsap.com/standard-license).
set -euo pipefail
cd "$(dirname "$0")/../film/assets"
curl -fsSL -o gsap.min.js https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js
echo "saved film/assets/gsap.min.js"
