#!/usr/bin/env bash
# Render scripts/og-image.html → public/og-image.png at 1200×630 with headless Chrome.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

"$CHROME" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --force-device-scale-factor=2 \
  --window-size=1200,630 \
  --virtual-time-budget=3000 \
  --run-all-compositor-stages-before-draw \
  --screenshot="$DIR/public/og-image.png" \
  "file://$DIR/scripts/og-image.html"

echo "Wrote public/og-image.png"
