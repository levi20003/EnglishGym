#!/bin/sh
# Builds the standalone installable app (PWA) into pwa/dist from the same source as the Claude version.
cd "$(dirname "$0")"
sh build.sh
D=pwa/dist; mkdir -p $D
VER=$(date +%Y%m%d%H%M)
{
  echo '<!doctype html><html lang="en"><head><meta charset="utf-8">'
  echo '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  echo '<meta name="theme-color" content="#2f4fd8"><link rel="manifest" href="manifest.json">'
  echo '<link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="icon-192.png">'
  echo '<style>*,*::before,*::after{box-sizing:border-box}html,body{margin:0}body{background:var(--bg,#f4f5f9)}</style>'
  sed -n '1,/^<script>$/p' english-gym.html | sed '$d'
  echo '<script>'; cat pwa/platform.js; echo '</script>'
  sed -n '/^<script>$/,$p' english-gym.html
  echo '</body></html>'
} > $D/index.html
sed "s/__VERSION__/$VER/" pwa/sw.js > $D/sw.js
cp pwa/manifest.json $D/
