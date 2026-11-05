# Content audit — Tu CI está perdiendo el tiempo

Source: `reference/source.md` (verbatim extraction of `TIA Talk.pptx`, 53 slides; slides 42–53 are
backup material already cut in the reveal.js deck with the speaker's agreement — same cut applies here).
Design reference: beatdeck neutral theme (near-black, one accent, hairlines, huge editorial type).

Rule: the source decides **what** is said; the design decides **how** it looks and moves.
This is a POC port of the talk to beatdeck, so beats are re-authored for the click-by-click
beat model rather than reproduced as slides — every fact, number, code block and quote is
carried verbatim from the source.

## Facts (never guess)

| Fact | Value | Source |
| --- | --- | --- |
| Title | Tu CI está perdiendo el tiempo (y la TIA lo sabe) | slide 1 |
| Speaker | Federico Mon | slide 1 |
| Event | PyConES 2026 | slide 1 |
| QR target | TODO — ask the speaker (candidates: pytest-filemon / pytest-mortadelo repos) | — |

## Slide → beat mapping

| Slide | What the source says | Beat(s) | Status | Notes |
| --- | --- | --- | --- | --- |
| 1 | Title + speaker | 1.1–1.3 | kept | standby → auto boot (`$ pytest`) → title |
| — | About me: Federico Mon · @gnufede · Test Optimization @ DataDog · GitHub avatar | 1.4 | new | speaker request; avatar fetched from github.com/gnufede (bundled locally) |
| 2–3 | Técnicos de Investigación Aeroterráquea + image | 2.1 | kept | TIA joke, real image `tia.jpg`; T·I·A initials accented |
| — | Test Impact Analysis — Run only relevant tests | 2.2 | new | speaker request: the acronym reveal — initials stay in place, words change around them |
| 4 | *(image only — the Hacker News screenshot)* | 2.3 | restored | real artefact `hacker_news.png`; placed right after the acronym reveal, per the speaker |
| 5–7 | Instrumenting Pytest / Test Optimization / Test execution data over time | 2.4–2.6 | kept | separate beats with their real screenshots, one slide per beat (speaker feedback) |
| 8 | Hammant quote | 2.7 | kept | verbatim quote + attribution + URL |
| 11 | Different Approaches (6) | 2.8 | kept | six labels, verbatim |
| 9 | Coverage / Git diff panels | 3.1 | kept | two mono panels verbatim + big ∩ |
| 10 | Coverage ∩ git diff venn diagram | 3.2 | restored | the original image, right after the data panels (speaker request) |
| 13 | How TIA works (3 steps + storage options) | 3.3–3.4 | kept | numbered steps; "either/or" storage |
| 14–17 | File-level TIA Map lifecycle (4 slides) | 3.5–3.8 | kept | re-authored as one animated panel: baseline → next commit → selection → rebuild; JSON verbatim |
| 18 | TIA needs to be fast / faster than all your tests | 4.1 | kept | |
| 19 | Break even example (50% overhead) | 4.2 | kept | both columns verbatim |
| 20 | Coverage overhead 100% (11.65s vs 24.24s) | 4.3 | kept | Terminal, character-exact |
| 21 | Coverage-adjusted break even | 4.4 | kept | both columns verbatim; derived highlight (speaker request): 250 passed / 750 skipped ⇒ you must skip 75% of the tests just to break even |
| 22 | Takeaway 1 | 4.5 | kept | |
| 23 | TIA needs to be accurate / classifier | 5.1 | kept | |
| 24 | Precision and recall (colours + formula) | 5.2 | restored | redrawn natively from the slide's own description (4 TP / 2 FP / 1 FN / 2 TN; 66.7% / 80%) |
| 25 | True cost of TIA / pytest-tia quote | 5.3 | kept | verbatim quote + URL |
| 26 | Risk-adjusted break even formula | 5.4 | kept | formula + 4 definitions verbatim |
| 27 | Blind spots (two lists) | 5.5 | kept | both lists verbatim |
| 28 | Expired-code example | 5.6 | kept | code verbatim (pptx has `my_function():` without `def`; fixed to `def my_function():` as in the reveal deck) |
| 29 | Takeaway 2 | 5.7 | kept | |
| 30 | Will it work for my repo? | 6.1 | kept | four Q→A rows; the answer to "No blind spots?" ("If you find some, be conservative") added with the speaker, from Takeaway 2 |
| 31–32 | import dependencies / CONST example | 6.2–6.3 | kept | statement + the original meme (restored, speaker request) + code verbatim with Python highlighting |
| 33 | import graph *(image)* | — | cut | removed at the speaker's request (not sure what to say there); the map itself carries the same data in scene 3 |
| 34–35 | Pytest-Filemon + import hook | 7.1–7.2 | kept | logo image + features + links verbatim |
| 36–37 | Pytest-Mortadelo + sys.monitoring | 7.3–7.4 | kept | logo image + features + links verbatim |
| 39 | Mortadelo: code blocks as dependencies | 7.5 | kept + redrawn | the statements verbatim (left; bullets 1+2 merged at the speaker's request — both said "edge is test → block", point 2 just named the tuple), plus a diagram (right, speaker request): test_a → code blocks with hashes, one unused block dimmed, ghost arrow contrasting file-level edges. Block contents illustrative |
| 38 | Demo time | 7.6 | kept | |
| 40 | Summary (4) | 8.1 | kept | |
| 41 | Beyond TIA (benchmarks, deflaker) | 8.2 | kept | |
| — | ¡Gracias! ¿Preguntas? | 8.3 | kept | reveal-deck closer; QR TODO |
| 42–53 | Backup slides | — | cut | agreed with the speaker (already cut in the reveal deck) |

## Real artefacts

| Artefact | File | Used in | Rights / credit |
| --- | --- | --- | --- |
| GitHub avatar | `deck/assets/avatar.jpg` | 1.4 | github.com/gnufede |
| Hacker News screenshot | `deck/assets/hacker_news.png` | 2.3 | from the speaker's pptx |
| Coverage ∩ git diff venn | `deck/assets/coverage_gitdiff.png` | 3.2 | from the speaker's pptx | from the speaker's pptx |
| TIA joke image | `deck/assets/tia.jpg` | 2.1 | from the speaker's pptx |
| Filemon logo | `deck/assets/filemon.png` | 7.1 | from the speaker's pptx (pytest-filemon) |
| Mortadelo logo | `deck/assets/mortadelo.png` | 7.3 | from the speaker's pptx (pytest-mortadelo) |

## Decisions taken on the speaker's behalf (POC port)

1. **Images not ported** (slides 12, 21, 24, 33, 50): their content could not
   be verified during the port (no vision access). Their *ideas* are redrawn natively where the
   slide text describes them (precision/recall diagram, import graph); everything else is carried
   as text. Originals remain at `slides/img/`. Review and re-add the ones that matter.
   (Slides 4, 5–7, 10 and the slide-31 meme were restored after speaker feedback.)
2. **beatdeck adaptation**: the 4-slide "File-level TIA Map" sequence becomes one animated map
   panel (one beat per state change) — the beatdeck way; JSON is verbatim.
3. **Standby/boot**: an automatic `$ pytest` typed command introduces the title (echoes the demo
   deck's boot; content-free, no invented facts).
4. **`def` fix** in the expired-code example (slide 28 typo `my_function():` → `def my_function():`).
5. **QR**: left `TODO` (never guessed). Candidates: the two plugin repos — speaker to decide.
6. Scene language: talk titles/statements stay in the source's own language mix (ES title, EN body).
7. **Python syntax highlighting** (speaker request): hand-rolled offline tokenizer in `deck/code.tsx`
   (no hljs bundle, engine untouched) — comments/strings/keywords/numbers; also fixes mark-label spacing.
8. **`Code` component** (`deck/code.tsx`): like `Terminal` but with Python highlighting and strikeout
   marks; used for the map panel and all Python code beats. Exact lines still verified via `data-exact`
   (`labels` are CSS `::after`, so text stays character-exact).
