# Runbook — Tu CI está perdiendo el tiempo (y la TIA lo sabe)

## Before the talk

1. `npm install` (once, with internet) · `npm run present` → opens `http://127.0.0.1:4173/` from `dist/`.
   `dist/` is self-contained: any static server works (`npx serve dist`), or copy the folder to another laptop.
2. Wi-Fi can be off. No request leaves the machine.
3. Projector at 1920×1080 if possible; any other ratio gets black bars, never distortion.
4. Press **P** to open the presenter window; drag it to your screen. It must say "stage connected".
5. Click the stage window, press **F** for fullscreen. You are on 1.1 (standby).

## During the talk

| Key | Action |
| --- | --- |
| → ↓ PageDown, click, Space (fullscreen) | next beat |
| ← ↑ PageUp | previous beat (from the title, back to standby — skips the boot) |
| 1–9 | jump to scene (1 OPEN · 2 TIA · 3 HOW · 4 FAST · 5 ACCURATE · 6 FIT · 7 TOOLS · 8 END) |
| Home / End | first / last beat |
| B or . | blackout on/off |
| O | overview (click a beat to jump) |
| F | fullscreen |

Automatic beats: **1.2 boot** (`pytest -q` types itself, ~1.5 s, then the title lands).

The demo in scene 7 runs outside the deck: `hatch test -vv` on the
`pycones2025-visualiza-lo-invisible` repo (same demo as the reveal.js deck).

## If something goes wrong

- Lost position or refreshed by accident: the URL keeps `#scene.beat`; reload and you are back on the beat.
- Presenter says "no connection": press **resync** in the presenter, or close it and press **P** again.
  Both windows must be the same browser on the same machine.
- Frozen animation: press ← then → (re-entering a beat rebuilds it from scratch).
- Total failure: `dist/` on a USB stick + any laptop with a browser.

## Config to check on the day

`deck/deck.config.ts`: title, speaker, `qrUrl` (currently: **https://gnufede.github.io/pycones-2026/** — the live
deck; the QR is on the title slide). Rebuild after editing.

## Verify

`npm run verify -- --source=reference/source.md` — walks all 39 beats forward, backward and from the URL,
pixel-compares frames, audits text/layout, and checks every Terminal line and `data-exact` text against the
source (87 exact lines matched on the last run). Contact sheet: `artifacts/verify/contact.png`.
