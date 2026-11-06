import type { SceneDef } from 'beatdeck';

/**
 * The talk's beat map: scenes → beats. One click = one beat.
 * `ref` = where it comes from in the source, `source` = what the source says, `note` = the speaker cue.
 */
export const SCENES: SceneDef[] = [
  {
    id: '01', title: 'OPEN',
    beats: [
      { name: 'standby', note: 'Pantalla en negro mientras entra la gente. Un click arranca la charla.' },
      { name: 'boot', auto: true, note: 'Automático: se teclea pytest y llega el título.', ref: 'adaptation' },
      { name: 'title', ref: 'slide 1', source: 'Tu CI está perdiendo el tiempo (y la TIA lo sabe) — Federico Mon - PyConES 2026', note: 'QR al deck en vivo (gnufede.github.io/pycones-2026)' },
      { name: 'about me', ref: 'speaker', source: 'Federico Mon · @gnufede · Test Optimization @ DataDog · GitHub avatar' },
    ],
  },
  {
    id: '02', title: 'TIA',
    beats: [
      { name: 'técnicos de investigación aeroterráquea', ref: 'slides 2–3', source: 'Técnicos de Investigación Aeroterráquea (la TIA, Mortadelo y Filemón)' },
      { name: 'test impact analysis', ref: 'adaptation (speaker request)', source: 'Test Impact Analysis — Run only relevant tests. The T·I·A initials stay in place while the words change', note: 'Las iniciales se quedan en su sitio; las palabras cambian a su alrededor.' },
      { name: 'hacker news', ref: 'slide 4', source: 'the Hacker News screenshot (real artefact from the pptx)' },
      { name: 'instrumenting pytest', ref: 'slide 5', source: 'Instrumenting Pytest' },
      { name: 'test optimization', ref: 'slide 6', source: 'Test Optimization' },
      { name: 'execution data over time', ref: 'slide 7', source: 'Test execution data over time' },
      { name: 'cita de hammant', ref: 'slide 8', source: 'If tests ran infinitely quickly… balance cost vs value — Paul Hammant, 2017' },
      { name: 'approaches', ref: 'slide 11', source: 'Coverage-based · History-based · ML predictive · Dynamic call-graph · Diff/AST · Build-graph' },
    ],
  },
  {
    id: '03', title: 'HOW',
    beats: [
      { name: 'coverage ∩ git diff', ref: 'slides 9–10', source: 'coverage JSON + git diff JSON' },
      { name: 'venn diagram', ref: 'slide 10', source: 'the Coverage ∩ git diff venn diagram (real artefact from the pptx)' },
      { name: 'how tia works', ref: 'slide 13', source: 'Test run + dependencies data collection (build map) · Test selection · Selected tests run (and rebuild map)' },
      { name: 'dónde vive el mapa', ref: 'slide 13', source: 'Store the map on CI (read/write) or compute selection on a backend' },
      { name: 'mapa baseline', ref: 'slide 14', source: 'File-level TIA Map (baseline commit, builds map)' },
      { name: 'mapa next commit', ref: 'slide 15', source: 'test_provider.py: 012345678 -> 56786532' },
      { name: 'test selection', ref: 'slide 16', source: 'test_provider.py changed → run test_a' },
      { name: 'rebuild', ref: 'slide 17', source: 'Selected tests run (and rebuild map for them)' },
    ],
  },
  {
    id: '04', title: 'FAST',
    beats: [
      { name: 'más rápido que todo', ref: 'slide 18', source: 'TIA needs to be faster than running all your tests' },
      { name: 'break even 50%', ref: 'slide 19', source: 'TOTAL: 4.5s vs TOTAL: 4s' },
      { name: 'coverage overhead', ref: 'slide 20', source: '2445 passed in 11.65s → 24.24s con pytest-cov (100% overhead)' },
      { name: 'break even ajustado', ref: 'slide 21', source: 'TOTAL: 3000s vs TOTAL: 3000s' },
      { name: 'takeaway 1', ref: 'slide 22', source: 'Coverage may be too slow' },
    ],
  },
  {
    id: '05', title: 'ACCURATE',
    beats: [
      { name: 'clasificador', ref: 'slide 23', source: 'TIA needs to be accurate — a classifier: is the test relevant for the change?' },
      { name: 'precision y recall', ref: 'slide 24', source: '4 TP · 2 FP · 1 FN · 2 TN — Precision 66.7% · Recall 80%' },
      { name: 'cardinal sin', ref: 'slide 25', source: 'pytest-tia: skipping a test that would have failed…' },
      { name: 'risk-adjusted', ref: 'slide 26', source: 'S > p · (1 − recall) · C_inc' },
      { name: 'blind spots', ref: 'slide 27', source: 'invisible to coverage / invisible to git diff' },
      { name: 'ejemplo caducado', ref: 'slide 28', source: 'date(2026, 11, 7) — This code has expired' },
      { name: 'takeaway 2', ref: 'slide 29', source: 'We need to be conservative on test selection' },
    ],
  },
  {
    id: '06', title: 'FIT',
    beats: [
      { name: '¿funciona en mi repo?', ref: 'slide 30', source: 'Fast or slow tests · coupling · shape of changes · blind spots' },
      { name: 'import dependencies', ref: 'slide 31', source: 'import dependencies' },
      { name: 'CONST', ref: 'slide 32', source: 'from provider import CONST — test_import_dependencies_matter' },
    ],
  },
  {
    id: '07', title: 'TOOLS',
    beats: [
      { name: 'pytest-filemon', ref: 'slide 34', source: 'File-level dependencies · pip install pytest-filemon' },
      { name: 'filemon: import hook', ref: 'slide 35', source: 'builtins.__import__ wrapper' },
      { name: 'pytest-mortadelo', ref: 'slide 36', source: 'Code block level dependencies · pip install pytest-mortadelo' },
      { name: 'mortadelo: sys.monitoring', ref: 'slide 37', source: 'E.PY_START | E.PY_RESUME callbacks' },
      { name: 'code blocks as deps', ref: 'slide 39', source: 'Test -> (file, qualname, hash) — bytecode' },
      { name: 'demo', ref: 'slide 38', source: 'Demo time' },
    ],
  },
  {
    id: '08', title: 'END',
    beats: [
      { name: 'summary', ref: 'slide 40', source: 'sys.monitoring API is great · import dependencies matter · fast and reliable · conservative' },
      { name: 'beyond tia', ref: 'slide 41', source: 'Benchmarks · Flaky test detection (deflaker)' },
      { name: 'gracias', ref: 'closer', source: '¡Gracias! ¿Preguntas?' },
    ],
  },
];

export const TOTAL_BEATS = SCENES.reduce((n, s) => n + s.beats.length, 0);
