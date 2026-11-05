/**
 * Every terminal line shown on stage, copied character for character from the source
 * (`reference/source.md`, verbatim from TIA Talk.pptx). Never retype or "tidy" these in a
 * scene; import them from here.
 */
export const TERM = {
  /** slide 9 — Coverage panel */
  coverage: [
    '# test_provider.py::test_1',
    '{',
    '    "test_provider.py": [1, 2, 3, 4],',
    '    "provider.py": [1, 2, 3, 4]',
    '}',
  ],
  /** slide 9 — Git diff panel */
  diff: [
    '{',
    '    "path": "provider.py",',
    '    "hunks": [',
    '        { "old": [3, 2], "new": [3, 1] },',
    '        { "old": [8, 0], "new": [8, 1] }',
    '    ]',
    '}',
  ],
  /** slides 14–17 — the file-level TIA map */
  map: [
    '{',
    '    "test_provider.py::test_a" : ["test_provider.py", "provider.py", "util.py"],',
    '    "test_util.py::test_b" :  ["test_util.py", "util.py"],',
    '}',
  ],
  /** slides 14–17 — file hashes (same order as the source block) */
  hashes: [
    'test_provider.py  "012345678"',
    'provider.py       "01010101"',
    'test_util.py      "22222222"',
    'util.py           "99999999"',
  ],
  /** slide 19 — break even, with TIA */
  breakEvenTia: [
    'test_1.py … 1.5s',
    'test_2.py … 1.5s',
    '…',
    '[Test selection] ... 0.0s',
    'test_2.py … 1.5s',
    '',
    'TOTAL: 4.5s',
  ],
  /** slide 19 — break even, running everything twice */
  breakEvenAll: [
    'test_1.py … 1s',
    'test_2.py … 1s',
    '…',
    'test_1.py … 1s',
    'test_2.py … 1s',
    '',
    'TOTAL: 4s',
  ],
  /** slide 20 — coverage overhead */
  covNo: '============ 2445 passed, 75 skipped in 11.65s =============',
  covYes: '============ 2445 passed, 75 skipped in 24.24s =============',
  /** slide 21 — coverage-adjusted break even */
  adjustedTia: [
    'test_1.py       … 2s',
    '…',
    'test_1000.py … 2s',
    '…',
    '[Test selection] ... 0.0s',
    '[...]',
    'test_1000.py … 2s',
    '==250 passed 750 skipped in 500s==',
    'x2',
    '',
    'TOTAL: 3000s',
  ],
  adjustedAll: [
    'test_1.py       … 1s',
    '…',
    'test_1000.py … 1s',
    'x3',
    '',
    'TOTAL: 3000s',
  ],
  /** slide 28 — expired code */
  expiredTest: [
    '# test_provider.py',
    'from provider import my_function',
    'assert my_function is True',
  ],
  expiredProvider: [
    '# provider.py',
    'from datetime import date',
    'def my_function():',
    '    if date.today() < date(2026, 11, 7):',
    '        return True',
    '    raise RuntimeError("This code has expired")',
  ],
  /** slide 32 — import dependencies */
  constProvider: [
    '# provider.py',
    'CONST = 1',
  ],
  constTest: [
    '# test_provider.py',
    'from provider import CONST',
    'def test_import_dependencies_matter():',
    '    assert CONST == 1',
  ],
  /** slide 35 — filemon import hook */
  importHook: [
    'original = builtins.__import__',
    'if getattr(original, "_filemon_tracking", False):',
    '    return False',
    'builtins.__import__ = self._wrapped_import(original)',
  ],
  /** slide 37 — mortadelo sys.monitoring */
  monitoring: [
    '# monitoring.py',
    'E = sys.monitoring.events',
    'sys.monitoring.set_events(tool_id, E.PY_START | E.PY_RESUME)',
    'sys.monitoring.register_callback(tool_id, E.PY_START,  self._on_py_start)',
    'sys.monitoring.register_callback(tool_id, E.PY_RESUME, self._on_py_start)',
    '[...]',
    'return sys.monitoring.DISABLE',
  ],
} as const;
