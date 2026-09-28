# My-Monthsarry-Gift
My Monthsarry Gift for my favorite Human, Nicole! ♡

A small, hand-made website: a cinematic flower intro, then our story told through
photos, little reasons, notes, a secret message, our future, and a love letter.
Plain HTML/CSS/JS — no frameworks, no build step.

## Editing the words
All the personal text lives in **`assets/js/content.js`**. Open it and change anything:

| What | Key in `content.js` |
| --- | --- |
| Her name, nickname, months, signature | `herName`, `nickname`, `months`, `signedBy` |
| Intro lines ("Something special…", "NICOLE") | `intro` |
| Hero lines | `hero` |
| Story chapters, messages, photo captions | `story` |
| Flip cards ("Little Things I Love About You") | `reasons` |
| Note deck ("Things I Want You to Know") | `notes` |
| Bible verse | `verse` |
| Secret message | `surprise.lines` (`''` = pause, `*` at the start = glowing line) |
| Future lines | `future` |
| Love letter | `letter` |
| Ending | `ending` |

## Adding our real song
1. Create an `audio` folder and put the song in it, e.g. `audio/our-song.mp3`.
2. In `content.js` set `song: 'audio/our-song.mp3'`.

Without a file, a soft built-in piano/pad melody plays instead. Music is always
**off** until she taps "♪ Our Song", and the speaker button mutes everything.

## Photos
- `Pictures/` — the original photos (untouched).
- `Pictures/web/` and `Pictures/thumb/` — lighter WebP copies the site actually loads.

To add a new photo, drop the original in `Pictures/`, make a `web` (max 1600px) and
`thumb` (max 720px) `.webp` copy with the same name, and add it to a chapter in `content.js`.

## Running locally
```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying
Pushing to `main` runs `.github/workflows/jekyll-gh-pages.yml`, which publishes
the site to GitHub Pages (Settings → Pages → Source: GitHub Actions).
