# Source: TIA Talk.pptx (Tu CI está perdiendo el tiempo) — Federico Mon, PyConES 2026

Extracted verbatim from `TIA Talk.pptx` (53 slides). The talk as presented ends at slide 41
("Beyond TIA") + thanks; slides 42–53 are backup material (agreed cut with the speaker,
mirrors the reveal.js deck at `slides/index.html`).

## Slides (verbatim text)

1. **Title** — Tu CI está perdiendo el tiempo (y la TIA lo sabe) / Federico Mon - PyConES 2026
2. Técnicos de Investigación Aeroterráquea
3. *(image: TIA joke)*
4. *(image)*
5. Instrumenting Pytest *(image)*
6. Test Optimization *(image)*
7. Test execution data over time *(image)*
8. > If tests ran infinitely quickly, we would run all the tests all the time, but they are not, so we need to balance cost vs value when running them.
   > The Rise of Test Impact Analysis - Paul Hammant - 2017
   > https://martinfowler.com/articles/rise-test-impact-analysis.html
9. Coverage / Git diff (two panels):

```
# test_provider.py::test_1
{
    "test_provider.py": [1, 2, 3, 4],
    "provider.py": [1, 2, 3, 4]
}
```

```
{
    "path": "provider.py",
    "hunks": [
        { "old": [3, 2], "new": [3, 1] },
        { "old": [8, 0], "new": [8, 1] }
    ]
}
```

10. Coverage ∩ git diff *(image)*
11. Different Approaches: Coverage-based · History-based · ML predictive · Dynamic call-graph · Diff/AST · Build-graph
12. *(image)*
13. **How TIA works**
    - Test run + "dependencies data collection" (build map)
    - Test "selection" (compare code changes with map)
    - Selected tests run (and rebuild map for them)
    - Also, either: Store the map somewhere, and retrieve it (read/write it on CI) — Or have the map on backend side, and compute there test selection
14. **File-level TIA Map (baseline commit, builds map)**

```
{
    "test_provider.py::test_a" : ["test_provider.py", "provider.py", "util.py"],
    "test_util.py::test_b" :  ["test_util.py", "util.py"],
}
```

```
{
    "test_provider.py": "012345678",
    "provider.py": "01010101",
    "test_util.py": "22222222",
    "util.py": "99999999",
}
```

15. **File-level TIA Map (next commit)** — same, but `"test_provider.py": "012345678" -> "56786532"`
16. **File-level TIA Map (test selection)** — same; `test_provider.py` changed → its tests are selected
17. **File-level TIA Map (selected tests run, rebuild map)** — same; selected tests run and the map is rebuilt for them
18. **TIA needs to be fast** / TIA needs to be faster than running all your tests
19. **Break even example (50% overhead)** (two columns):

```
test_1.py … 1.5s
test_2.py … 1.5s
…
[Test selection] ... 0.0s
test_2.py … 1.5s

TOTAL: 4.5s
```

```
test_1.py … 1s
test_2.py … 1s
…
test_1.py … 1s
test_2.py … 1s

TOTAL: 4s
```

20. **Coverage overhead (100% overhead!)** (without pytest-cov / with pytest-cov):

```
============ 2445 passed, 75 skipped in 11.65s =============
============ 2445 passed, 75 skipped in 24.24s =============
```

21. **Coverage-adjusted break even example** (two columns + charts):

```
test_1.py       … 2s
…
test_1000.py … 2s
…
[Test selection] ... 0.0s
[...]
test_1000.py … 2s
==250 passed 750 skipped in 500s==  (x2)

TOTAL: 3000s
```

```
test_1.py       … 1s
…
test_1000.py … 1s
(x3)

TOTAL: 3000s
```

22. **Takeaway 1** — Coverage may be too slow
23. **TIA needs to be accurate** — Let's see TIA as a classifier / Test is relevant for the change yes/no
24. **Precision and recall** — Green: True positives (4) · Yellow: False positives (2) · Red stripes: False negatives (1) · White: True negatives (2) · Precision: 4/(4+2) = 66.7% · Recall: 4/(4+1) = 80%
25. **True cost of TIA** — https://pypi.org/project/pytest-tia/ —
    > Test selection has exactly one cardinal sin: skipping a test that would have failed. A tool you can't trust on that is worse than no tool. So before any feature list, here is where this project earned — or failed to earn — that trust.
26. **Risk-adjusted break even** — S > p · (1 − recall) · C_inc
    - S = Money saved on CI ~ $0.50
    - p = Probability a PR contains a bug tests would have revealed ~ 1%
    - C_inc = Incident cost ~ $100k
    - recall = Affected tests we actually run > 99.95% (we can miss 1 out of 2000)
27. **Blind spots** — All that is invisible to coverage:
    Native code (C/C++, Rust …) · Reading files (JSON, yaml, …) · Subprocess / Multi-process interactions · DB data · functools.lru_cache · State due to code executed before the test (esp. at import time) · Clock, Random seed, I/O …
    All that is invisible to `git diff`: Any non-tracked file (.so) · All of the above
28. **Example**:

```python
# test_provider.py
from provider import my_function
assert my_function is True
```

```python
# provider.py
from datetime import date
def my_function():
    if date.today() < date(2026, 11, 7):
        return True
    raise RuntimeError("This code has expired")
```

29. **Takeaway 2** — We need to be conservative on test selection / We may still deselect tests that could have failed
30. **Will it work for my repo?** — Fast or slow tests? (Works best if tests are not super-fast) · Code coupling (Works better if low coupling) · Shape of changes (Works better if many commits editing only docs or AGENTS.md — skips all tests) · No blind spots? (If you find some, be conservative — added in the beatdeck port with the speaker, from Takeaway 2)
31. **import dependencies** *(image)*
32. **import dependencies matter**:

```python
# provider.py
CONST = 1
# test_provider.py
from provider import CONST
def test_import_dependencies_matter():
    assert CONST == 1
```

33. *(image: import graph)*
34. **Pytest-Filemon** — File-level dependencies · Import graph dependencies · Very low collection overhead · Best suited for monorepos — http://github.com/gnufede/pytest-filemon — pip install pytest-filemon
35. **Filemon: Import hook**:

```python
original = builtins.__import__
if getattr(original, "_filemon_tracking", False):
    return False
builtins.__import__ = self._wrapped_import(original)
```

36. **Pytest-Mortadelo** — Code block level dependencies · Bytecode-hashed dependencies · Low collection overhead · More test skips than Filemon — http://github.com/gnufede/pytest-mortadelo — pip install pytest-mortadelo
37. **Mortadelo: sys.monitoring**:

```python
# monitoring.py
E = sys.monitoring.events
sys.monitoring.set_events(tool_id, E.PY_START | E.PY_RESUME)
sys.monitoring.register_callback(tool_id, E.PY_START,  self._on_py_start)
sys.monitoring.register_callback(tool_id, E.PY_RESUME, self._on_py_start)
[...]
return sys.monitoring.DISABLE
```

38. **Demo time**
39. **Mortadelo: code blocks as dependencies** — Files are the index, blocks are the edges — test → (file, qualname, hash) · Hash could be from AST, but Mortadelo uses bytecode · Selection only compiles changed files from disk
    *(speaker merge: original bullets 1+2 — "…edge is test -> block" and "Test -> (file, qualname, hash)" — said the same thing twice)*
40. **Summary** — sys.monitoring API is great · Import dependencies matter · TIA has to be fast and reliable · Better be conservative than aggressively skipping tests
41. **Beyond TIA** — Other use cases for coverage ∩ git diff:
    - Benchmarks: Why run benchmarks that are not relevant with the changes?
    - Flaky test detection (deflaker): If a test fails and is not actually impacted by the changes, it is flaky

42–53. **Backup** (cut): Why CI time matters · Why even use TIA? · The promise (866 passed / diff / 621 deselected) · Useful one liner (git diff --name-only | grep test/ | xargs pytest -q) · Coverage based example · Coverage based hard example · Coverage is too slow · Two options · File-level mode

## Slide images (from the pptx, also at slides/img/)

- slide 3: `tia.jpg` — TIA joke image
- slide 4: `tia_intro.png` — (unverified content)
- slides 5/6/7: `instrumenting_pytest.png`, `test_optimization.png`, `test_execution_data.png` (unverified content)
- slide 10: `coverage_gitdiff.png` (unverified)
- slide 12: `tia_approaches.png` (unverified)
- slide 21: `breakeven_1.png`, `breakeven_2.png` (charts, unverified)
- slide 24: `precision_recall.png` (diagram, unverified)
- slide 31: `import_dependencies.jpg` (unverified)
- slide 33: `import_graph.png` (unverified)
- slide 34: `filemon.png` — on the Pytest-Filemon slide
- slide 36: `mortadelo.png` — on the Pytest-Mortadelo slide
- slide 50: `coverage_too_slow.jpg` (unverified)
