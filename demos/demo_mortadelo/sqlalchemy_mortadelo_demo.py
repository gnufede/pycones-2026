#!/usr/bin/env python3
"""Live demo: pytest-mortadelo on sqlalchemy's ORM suite.

Shows the record overhead, the no-change fast path, and the
edit -> run -> deselect cycle:

  1. plain pytest baseline
  2. record run            (the monitoring overhead)
  3. no-change rerun       (0 selected, exit 0, in under a second)
  4. comment-only edit in lib/sqlalchemy/orm/query.py
                             -> 0 selected: bytecode identical, nothing stale
  5. comment in one test module (test_scoping.py)
                             -> only that module's tests run
  6. no-op code edit in Query.filter (criterion = criterion)
                             -> exactly the tests that executed filter()

Usage:
    python3 demo_mortadelo/sqlalchemy_mortadelo_demo.py [path-to-sqlalchemy-checkout]

If no checkout is passed, uses SQLALCHEMY_REPO, or clones sqlalchemy into
.cache/sqlalchemy. A matching `.venv*` in the checkout is reused; otherwise
the demo creates `<checkout>/.venv` and installs sqlalchemy (editable),
pytest and pytest-mortadelo from PyPI into it. Set SQLALCHEMY_PYTHON to
use an existing interpreter instead. pytest-mortadelo needs Python 3.12+.

Pytest output is streamed live, each edit is shown as a colored git diff,
and the demo waits for Enter between steps.

Every edit is a comment or a behavior-preserving no-op and each file is
restored byte-for-byte; the demo refuses to start on a dirty tree.
"""

from __future__ import annotations

import os
import re
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


def read_text(path):
    with open(path, encoding="utf-8", newline="") as fh:
        return fh.read()


def write_text(path, text):
    with open(path, "w", encoding="utf-8", newline="") as fh:
        fh.write(text)


def main():
    repo = find_repo("demo_mortadelo/sqlalchemy_mortadelo_demo.py")
    py = find_python(repo, ["pytest_mortadelo"], minimum=(3, 12))
    ensure_clean(repo)
    env = base_env()

    def run(flag=True):
        args = ["-p", "no:filemon", "-p", "no:cov"]
        if flag:
            args.append("--mortadelo")
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

    print(f"demo: pytest-mortadelo on sqlalchemy ({repo})")
    print(f"demo: interpreter {py}, subset: {len(SUBSET)} files")
    pause("Press Enter to start")

    # 1. plain baseline
    announce(1, "plain pytest (baseline)")
    result, _ = run(flag=False)
    step(1, "plain pytest (baseline)", result, None)
    baseline = result.seconds
    pause("Press Enter for the next step")

    # 2. record run (fresh data)
    shutil.rmtree(os.path.join(repo, ".pytest_mortadelo"), ignore_errors=True)
    announce(2, "record run: everything runs, dependencies recorded")
    result, sel = run()
    step(
        2,
        "record run: everything runs, dependencies recorded",
        result,
        sel,
        f"overhead vs plain: {result.seconds - baseline:+.2f}s",
    )
    mo_data = show_data_size(
        repo, [".pytest_mortadelo"], label="mortadelo data"
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

    # 4. comment-only edit in orm/query.py
    target = "lib/sqlalchemy/orm/query.py"
    announce(4, f"comment-only edit in {target}")
    path = os.path.join(repo, target)
    original = read_text(path)
    try:
        write_text(path, original + "\n# mortadelo demo comment\n")
        show_diff(repo, target)
        pause("Press Enter to run pytest on this edit")
        result, sel = run()
        step(
            4,
            f"comment-only edit in {target}",
            result,
            sel,
            "the file changed, but its compiled bytecode did not: "
            "0 stale blocks",
        )
        pause("Press Enter for the next step")
    finally:
        write_text(path, original)

    # 5. comment in one test module
    target = "test/orm/test_scoping.py"
    announce(5, f"comment-only edit in {target}")
    path = os.path.join(repo, target)
    original = read_text(path)
    try:
        write_text(path, original + "\n# mortadelo demo comment\n")
        show_diff(repo, target)
        pause("Press Enter to run pytest on this edit")
        result, sel = run()
        step(
            5,
            f"comment-only edit in {target}",
            result,
            sel,
            "not even its own tests: comments do not change bytecode. "
            "(pytest-filemon, the file-level sibling, selects its 9 here)",
        )
        pause("Press Enter for the next step")
    finally:
        write_text(path, original)

    # 6. no-op code edit in Query.filter
    target = "lib/sqlalchemy/orm/query.py"
    announce(6, "no-op code edit in Query.filter (criterion = criterion)")
    path = os.path.join(repo, target)
    lines = read_text(path).splitlines(keepends=True)
    idx = next(
        (i for i, line in enumerate(lines) if re.match(r"^[ \t]*def filter\(", line)),
        None,
    )
    assert idx is not None, "Query.filter not found"
    j = idx
    while not lines[j].rstrip().endswith(":"):
        j += 1
    k = j + 1
    while not lines[k].strip():
        k += 1
    indent = re.match(r"[ \t]*", lines[k]).group(0)
    original = "".join(lines)
    try:
        write_text(
            path,
            "".join(
                lines[: j + 1]
                + [indent + "criterion = criterion\n"]
                + lines[j + 1 :]
            ),
        )
        show_diff(repo, target)
        pause("Press Enter to run pytest on this edit")
        result, sel = run()
        n_pass = re.findall(r"(\d+) passed", result.output)
        step(
            6,
            "no-op code edit in Query.filter (criterion = criterion)",
            result,
            sel,
            f"the block hash changed: exactly its "
            f"{sel[0] if sel else '?'} dependents re-run and pass "
            f"({n_pass[-1] if n_pass else '?'} passed) — "
            "the rest of the suite is untouched",
        )
        pause("Press Enter for the summary")
    finally:
        write_text(path, original)

    # epilogue: restore verified, data removed
    if not tree_clean(repo):
        print("demo: WARNING - tree not clean after restore!")
    else:
        print("\nsqlalchemy tree restored byte-for-byte (git status clean)")
    shutil.rmtree(os.path.join(repo, ".pytest_mortadelo"), ignore_errors=True)

    print("\n==================== mortadelo demo summary ====================")
    print(f"{'step':5s} {'selected':>9s} {'time':>7s}  what")
    for n, title, selected, seconds in results:
        print(f"{n:<5d} {selected:>9s} {seconds:6.2f}s  {title}")
    print(f"plain baseline: {baseline:.2f}s; the record run pays the monitoring")
    print("tax once, and every later run touches only what the edit reached.")
    print(f"record data written by step 2: {mo_data}")
    pause("Press Enter to finish")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
