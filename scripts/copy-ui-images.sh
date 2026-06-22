#!/bin/sh
# Copy the FreeInkUI component-gallery SVGs from the SDK into public/, stripping
# shape-rendering="crispEdges".
#
# The renders are 1-bit pixel art (each glyph is many 1px <rect>s). crispEdges
# snaps every edge to the device pixel grid, which mangles text at any non-integer
# display scale (the gallery thumbnails are scaled to fit cards, so the scale is
# DPI/zoom-dependent). Removing it lets the browser anti-alias when scaling, so
# text stays smooth and legible at every zoom level — matching the SDK builder,
# which shows the same SVGs at device-native size.
#
# Usage: npm run copy-ui-images [path-to-freeink-sdk]   (default ../freeink-sdk)
set -e
SDK="${1:-../freeink-sdk}"
SRC="$SDK/docs/images"
DEST="public/img/freeinkui"

mkdir -p "$DEST/components"
cp "$SRC/freeinkui-components/"*.svg "$DEST/components/"
cp "$SRC/freeinkui-settings.svg" "$SRC/freeinkui-reader.svg" \
   "$SRC/freeinkui-library.svg" "$SRC/freeinkui-overlays.svg" "$DEST/"

sed -i '' 's/ shape-rendering="crispEdges"//g' "$DEST/components/"*.svg "$DEST/"*.svg

count=$(ls "$DEST/components/"*.svg | wc -l | tr -d ' ')
echo "Copied $count component SVGs + 4 composites into $DEST (crispEdges stripped)."
