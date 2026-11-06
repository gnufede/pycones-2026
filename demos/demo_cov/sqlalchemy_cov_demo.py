#!/usr/bin/env python3
"""Live demo: sqlalchemy's ORM suite plain, then under pytest-cov.

Shows what line coverage costs on the same ~2,500-test subset:

  1. plain pytest baseline
  2. pytest-cov line coverage of lib/sqlalchemy/orm
                             -> the coverage report and the overhead

Usage:
    python3 demo_cov/sqlalchemy_cov_demo.py [path-to-sqlalchemy-checkout]

If no checkout is passed, uses SQLALCHEMY_REPO, or clones sqlalchemy into
.cache/sqlalchemy. The demo reuses a `<checkout>/.venv*` virtualenv only if
it runs the same Python version as the interpreter that launched the demo;
otherwise it creates one for that version (`<checkout>/.venv`, or
`.venv-X.Y` when `.venv` belongs to another interpreter) and installs
sqlalchemy (editable) and pytest-cov from PyPI. Set SQLALCHEMY_PYTHON to
use an existing interpreter instead. So:

    python3.13 demo_cov/sqlalchemy_cov_demo.py ../sqlalchemy

runs the demo on Python 3.13 even when `.venv` is a 3.15 environment.

Pytest output is streamed live and the demo waits for Enter between steps.
The impact-analysis plugins are disabled explicitly, and pytest-cov is only
enabled for step 2, so the baseline is plain pytest.
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from demo_common import (  # noqa: E402
    SUBSET,
    base_env,
    coverage_percent,
    ensure_clean,
    erase_coverage,
    find_python,
    find_repo,
    pause,
    run_pytest,
    show_data_size,
)

COV_TARGET = "lib/sqlalchemy/orm"


def main():
    repo = find_repo("demo_cov/sqlalchemy_cov_demo.py")
    py = find_python(repo, ["pytest_cov"])
    ensure_clean(repo)
    env = base_env()

    def run(cov=False):
        args = ["-p", "no:mortadelo", "-p", "no:filemon"]
        if cov:
            args += [f"--cov={COV_TARGET}", "--cov-report=term"]
        else:
            args += ["-p", "no:cov"]
        return run_pytest(py, repo, args + SUBSET, env)

    results = []

    def announce(n, title):
        print(f"\n--- step {n}: {title}", flush=True)

    def step(n, title, result, cov="", note=""):
        results.append((n, title, result.seconds, cov))
        print(
            f"\n    exit={result.code}  time={result.seconds:.2f}s  "
            f"coverage={cov or '-'}"
        )
        if note:
            print(f"    >> {note}")

    print(f"demo: sqlalchemy ORM suite plain vs pytest-cov ({repo})")
    print(f"demo: interpreter {py}, subset: {len(SUBSET)} files")
    print(
        "demo: impact-analysis plugins disabled "
        "(-p no:mortadelo -p no:filemon)"
    )
    pause("Press Enter to start")

    # 1. plain baseline
    announce(1, "plain pytest (baseline)")
    baseline_run = run()
    step(1, "plain pytest (baseline)", baseline_run)
    baseline = baseline_run.seconds
    pause("Press Enter for the next step")

    # 2. pytest-cov
    erase_coverage(py, repo)
    announce(2, f"pytest-cov (--cov={COV_TARGET})")
    cov_run = run(cov=True)
    cov = coverage_percent(cov_run.output)
    step(
        2,
        f"pytest-cov (--cov={COV_TARGET})",
        cov_run,
        cov,
        f"coverage overhead vs plain: {cov_run.seconds - baseline:+.2f}s",
    )
    cov_data = show_data_size(repo, [".coverage"], label="coverage data")
    pause("Press Enter for the summary")

    erase_coverage(py, repo)
    print("\nsqlalchemy tree unchanged; coverage data removed")

    print("\n================ plain vs pytest-cov summary =================")
    print(f"{'step':5s} {'time':>7s} {'coverage':>8s}  what")
    for n, title, seconds, cov in results:
        print(f"{n:<5d} {seconds:6.2f}s {cov or '-':>8s}  {title}")
    print(f"plain baseline: {baseline:.2f}s; pytest-cov pays for tracing")
    print("every executed statement, then reports what the suite reached.")
    print(f"coverage database written by step 2: {cov_data}")
    pause("Press Enter to finish")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
