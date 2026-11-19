# English Gym as an app (Windows and Android)

This repository is a standalone, installable web app (PWA). It is built from the same code as the Claude version, so it looks the same and uses the same progress format.

## What works in the installed app
- Flashcards, quiz, weak spots with the built-in questions, grammar and reading tests, progress dashboard, profile.
- Listening and pronunciation, using your device's own voices and speech recognition instead of Claude's:
  - Audio is your system's text-to-speech voice reading the scripts. It is generated, not a real recording, and it says so on screen.
  - Speech recognition uses the browser's service (Google in Chrome, Microsoft in Edge), so it needs internet and sends your voice to that service. The match score is still "intelligibility only".
- Works offline after the first visit (except speech recognition and the Google fonts on first load).

## What needs the Claude version
AI writing feedback, speaking roleplays and their feedback, the writing and speaking tests, Claude-generated questions, cards and listening scripts. In the app these show a link to the Claude version. There is no API key in the app, on purpose: a key in a downloadable file would be public.

## Progress
Saved on each device separately. Use Profile > Export progress, then Import on the other device (or in the Claude version). Import shows both summaries and downloads a backup of the current data before replacing it.

## Link
https://levi20003.github.io/EnglishGym/

## Putting it online (already done for this repo)
An installable app must be served over https. Free options:
1. GitHub Pages: create an empty public repo (e.g. `english-gym`), upload the contents of `dist` to it, then Settings > Pages > Deploy from branch `main` / root. Your link becomes `https://<username>.github.io/english-gym/`.
2. Netlify Drop (app.netlify.com/drop): drag the `dist` folder in, then sign in so the site isn't deleted.

## Installing
- Windows (Edge or Chrome): open the link, then the "App available / Install" icon in the address bar (or menu > Apps > Install this site as an app). It gets a Start menu entry and its own window.
- Android (Chrome): open the link, menu > "Install app" (or "Add to Home screen").
- Optional real APK or Microsoft Store package: paste the link into pwabuilder.com and download the Android (APK/AAB) or Windows (MSIX) package. It wraps the same app.

## Rebuilding (from `source/`)
`sh build-pwa.sh` builds `pwa/dist`; `node test/icons.js "$PWD/pwa"` renders the icons; `node test/pwa.smoke.js` tests offline cache, Claude-only labels and export/import.
