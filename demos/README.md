# Test impact analysis demos (PyConES 2026)

Three live demos against the same real-world suite: SQLAlchemy's ORM tests
(~2,500 tests over 12 modules).

| demo | plugin | what it shows |
|---|---|---|
| `demo_cov/` | [pytest-cov](https://pypi.org/project/pytest-cov/) | the runtime cost of line coverage |
| `demo_filemon/` | [pytest-filemon](https://pypi.org/project/pytest-filemon/) | file-level test impact analysis |
| `demo_mortadelo/` | [pytest-mortadelo](https://pypi.org/project/pytest-mortadelo/) | block-level test impact analysis |

## Quick start

```bash
python3 demo_cov/sqlalchemy_cov_demo.py
python3 demo_filemon/sqlalchemy_filemon_demo.py
python3 demo_mortadelo/sqlalchemy_mortadelo_demo.py
```

The first run of any demo bootstraps everything:

1. **SQLAlchemy checkout** — if you did not pass one, it clones
   `https://github.com/sqlalchemy/sqlalchemy.git` (shallow) into
   `.cache/sqlalchemy`.
2. **Virtualenv** — it reuses a `.venv*` in the checkout that matches the
   running Python, or creates one.
3. **Dependencies** — it installs SQLAlchemy editable into that venv, and
   installs `pytest-cov`, `pytest-filemon` and `pytest-mortadelo` from
   **PyPI** as each demo needs them.

Nothing else is required beyond `git`, Python 3.12+ (mortadelo uses
`sys.monitoring`) and network access on the first run.

## Using your own checkout

Pass the repository root as the first argument:

```bash
python3 demo_cov/sqlalchemy_cov_demo.py ~/src/sqlalchemy
```

or set an environment variable:

```bash
export SQLALCHEMY_REPO=~/src/sqlalchemy
```

The checkout must be a clean git repository (the demos edit tracked files
with comments/no-ops and verify the tree afterwards). To use a specific
interpreter instead of the demo-managed venv:

```bash
SQLALCHEMY_PYTHON=~/src/sqlalchemy/.venv/bin/python \
    python3 demo_mortadelo/sqlalchemy_mortadelo_demo.py
```

If a matching `.venv` is absent, the demo creates one inside the checkout
(`.venv`, or `.venv-X.Y` when `.venv` belongs to another Python version).

## What each demo does

All three stream pytest output live and pause for Enter between steps.

### Coverage — `demo_cov/`

1. plain pytest baseline;
2. the same run under `pytest-cov --cov=lib/sqlalchemy/orm`;
3. the coverage report and the measured overhead.

The impact-analysis plugins are disabled, so step 1 is plain pytest and only
step 2 pays for tracing.

### Filemon — `demo_filemon/`

1. plain baseline;
2. record run (import wraps, no instrumentation);
3. no-change rerun: 0 selected;
4. comment in an unrelated lib file: 0 selected;
5. comment in one test module: only its tests;
6. comment in `orm/query.py`: everything that imports it.

### Mortadelo — `demo_mortadelo/`

1. plain baseline;
2. record run (`sys.monitoring`, block hashes);
3. no-change rerun: 0 selected;
4. comment in `orm/query.py`: 0 selected (bytecode unchanged);
5. comment in a test module: only its tests;
6. `criterion = criterion` in `Query.filter`: exactly the tests that
   executed that block.

## Resetting

The auto-cloned checkout and its venv live in `.cache/sqlalchemy` (ignored
by git). Remove `.cache/` to start from scratch. Each demo also removes its
own `.pytest_mortadelo/` / `.pytest_filemon/` data and erases coverage data
when it finishes.

## Layout

```
demo_common.py                          shared clone/venv/runner helpers
demo_cov/sqlalchemy_cov_demo.py
demo_filemon/sqlalchemy_filemon_demo.py
demo_mortadelo/sqlalchemy_mortadelo_demo.py
```
