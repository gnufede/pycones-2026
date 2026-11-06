#!/usr/bin/env python3
"""Live demo: pytest-filemon on sqlalchemy's ORM suite.

Shows the record overhead, the no-change fast path, and the
edit -> run -> deselect cycle at file granularity:

  1. plain pytest baseline
  2. record run            (the import-wrap overhead)
  3. no-change rerun       (0 selected, exit 0, in under a second)
  4. comment-only edit in a lib file that no test imports
                             -> 0 selected: not in the import graph at all
  5. comment in one test module (test_scoping.py)
                             -> only that module's tests run
  6. comment-only edit in lib/sqlalchemy/orm/query.py
                             -> everything: a file every test depends on

Usage:
    python3 demo_filemon/sqlalchemy_filemon_demo.py [path-to-sqlalchemy-checkout]

If no checkout is passed, uses SQLALCHEMY_REPO, or clones sqlalchemy into
.cache/sqlalchemy. A matching `.venv*` in the checkout is reused; otherwise
the demo creates `<checkout>/.venv` and installs sqlalchemy (editable),
pytest and pytest-filemon from PyPI into it. Set SQLALCHEMY_PYTHON to use
an existing interpreter instead.

Pytest output is streamed live, each edit is shown as a colored git diff,
and the demo waits for Enter between steps.

Every edit is a comment (no test ever breaks) and each file is restored
byte-for-byte; the demo refuses to start on a dirty tree.
"""

from __future__ import annotations

import json
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from demo_common import (  # noqa: E402
    SUBSET,
    base_env,
    ensure_clean,
    find_python,
    find_repo,
    pause,
    run_pytest,
    selected_counts,
    show_data_size,
    show_diff,
    tree_clean,
)

# A lib file none of the subset's import chains reaches (checked against
# the recorded dependency files before use; the first absent one is used).
UNRELATED_CANDIDATES = [
    "lib/sqlalchemy/ext/horizontal_shard.py",
    "lib/sqlalchemy/ext/indexable.py",
    "lib/sqlalchemy/dialects/mysql/reflection.py",
]


def main():
    repo = find_repo("demo_filemon/sqlalchemy_filemon_demo.py")
    py = find_python(repo, ["pytest_filemon"])
    ensure_clean(repo)
    env = base_env()

    def run(flag=True):
        args = ["-p", "no:mortadelo", "-p", "no:cov"]
        if flag:
            args.append("--filemon")
        result = run_pytest(py, repo, args + SUBSET, env)
        return result, selected_counts(result.output)

    results = []

    def announce(n, title):
        print(f"\n--- step {n}: {title}", flush=True)

    def step(n, title, result, sel, note=""):
        selected = f"{sel[0]}/{sel[1]}" if sel else "-"
        results.append((n, title, selected, result.seconds))
        print(
            f"\n    exit={result.code}  time={result.seconds:.2f}s  "
            f"selected={selected}"
        )
        if sel:
            print(f"    {sel[2]}")
        if note:
            print(f"    >> {note}")

    print(f"demo: pytest-filemon on sqlalchemy ({repo})")
    print(f"demo: interpreter {py}, subset: {len(SUBSET)} files")
    pause("Press Enter to start")

    # 1. plain baseline
    announce(1, "plain pytest (baseline)")
    result, _ = run(flag=False)
    step(1, "plain pytest (baseline)", result, None)
    baseline = result.seconds
    pause("Press Enter for the next step")

    # 2. record run (fresh data)
    shutil.rmtree(os.path.join(repo, ".pytest_filemon"), ignore_errors=True)
    announce(2, "record run: everything runs, import dependencies recorded")
    result, sel = run()
    step(
        2,
        "record run: everything runs, import dependencies recorded",
        result,
        sel,
        f"overhead vs plain: {result.seconds - baseline:+.2f}s "
        "(import wraps, no instrumentation)",
    )
    fm_data = show_data_size(
        repo, [".pytest_filemon"], label="filemon data"
    )
    pause("Press Enter for the next step")

    # 3. no-change rerun
    announce(3, "no-change rerun")
    result, sel = run()
    step(
        3,
        "no-change rerun",
        result,
        sel,
        "nothing affected: 0 tests run, exit 0 — fingerprints did all the work",
    )
    pause("Press Enter for the next step")

    # 4. comment-only edit in an unrelated lib file
    with open(
        os.path.join(repo, ".pytest_filemon", "data.json"), encoding="utf-8"
    ) as fh:
        deps = set(json.load(fh)["files"])
    unrelated = next(
        (
            candidate
            for candidate in UNRELATED_CANDIDATES
            if candidate not in deps
            and os.path.exists(os.path.join(repo, candidate))
        ),
        None,
    )
    if unrelated is None:
        print(
            "\n(demo: no unrelated lib file found among the candidates; "
            "skipping step 4)"
        )
        pause("Press Enter for the next step")
    else:
        announce(4, f"comment-only edit in {unrelated}")
        path = os.path.join(repo, unrelated)
        with open(path, "rb") as fh:
            original = fh.read()
        try:
            with open(path, "ab") as fh:
                fh.write(b"\n# filemon demo comment\n")
            show_diff(repo, unrelated)
            pause("Press Enter to run pytest on this edit")
            result, sel = run()
            step(
                4,
                f"comment-only edit in {unrelated}",
                result,
                sel,
                "the file is in no test's import graph: deselected everything",
            )
            pause("Press Enter for the next step")
        finally:
            with open(path, "wb") as fh:
                fh.write(original)

    # 5. comment in one test module
    target = "test/orm/test_scoping.py"
    announce(5, f"comment-only edit in {target}")
    path = os.path.join(repo, target)
    with open(path, "rb") as fh:
        original = fh.read()
    try:
        with open(path, "ab") as fh:
            fh.write(b"\n# filemon demo comment\n")
        show_diff(repo, target)
        pause("Press Enter to run pytest on this edit")
        result, sel = run()
        step(
            5,
            f"comment-only edit in {target}",
            result,
            sel,
            "only that module's own tests run; the other 11 modules are "
            "deselected",
        )
        pause("Press Enter for the next step")
    finally:
        with open(path, "wb") as fh:
            fh.write(original)

    # 6. comment in a lib file every test depends on
    target = "lib/sqlalchemy/orm/query.py"
    announce(6, f"comment-only edit in {target}")
    path = os.path.join(repo, target)
    with open(path, "rb") as fh:
        original = fh.read()
    try:
        with open(path, "ab") as fh:
            fh.write(b"\n# filemon demo comment\n")
        show_diff(repo, target)
        pause("Press Enter to run pytest on this edit")
        result, sel = run()
        step(
            6,
            f"comment-only edit in {target}",
            result,
            sel,
            "the granularity cost, honestly: at file level, any byte change "
            "to a shared dependency re-runs its importers — all of them "
            "(pytest-mortadelo, the block-level sibling, selects 0 here)",
        )
        pause("Press Enter for the summary")
    finally:
        with open(path, "wb") as fh:
            fh.write(original)

    # epilogue: restore verified, data removed
    if not tree_clean(repo):
        print("demo: WARNING - tree not clean after restore!")
    else:
        print("\nsqlalchemy tree restored byte-for-byte (git status clean)")
    shutil.rmtree(os.path.join(repo, ".pytest_filemon"), ignore_errors=True)

    print("\n==================== filemon demo summary ====================")
    print(f"{'step':5s} {'selected':>9s} {'time':>7s}  what")
    for n, title, selected, seconds in results:
        print(f"{n:<5d} {selected:>9s} {seconds:6.2f}s  {title}")
    print(f"plain baseline: {baseline:.2f}s.  filemon deselects on the import")
    print(
        "graph: files no test imports cost nothing; shared files cost "
        "everything."
    )
    print(f"record data written by step 2: {fm_data}")
    pause("Press Enter to finish")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
