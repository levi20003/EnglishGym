#!/bin/sh
cd "$(dirname "$0")"
{
  head -4 v1-backup.html
  echo '<style>'
  sed -n '/<style>/,/<\/style>/p' v1-backup.html | sed '1d;$d'
  cat src/extra.css
  echo '</style>'
  sed -n '/<header class="top">/,/<div class="toast"/p' v1-backup.html
  echo '<script>'
  cat src/content.js src/content2.js src/logic.js src/logic2.js src/ui.js src/ui3.js src/ui2.js
  echo '</script>'
} > english-gym.html
sed -i "s/0-day streak/this week/" english-gym.html
