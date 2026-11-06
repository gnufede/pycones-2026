#!/usr/bin/env python3
"""Shared bootstrap and pytest runner for the three sqlalchemy demos.

The demos all need the same things:

1. a sqlalchemy git checkout -- taken from the command line, from
   ``SQLALCHEMY_REPO``, or cloned automatically into ``.cache/sqlalchemy``;
2. a virtualenv with sqlalchemy installed editable and the pytest plugins
   installed from PyPI;
3. a pytest invocation whose output is streamed live and timed.

Keeping that here means the three demo scripts only describe what they
actually demonstrate.
"""

from __future__ import annotations

import os
import re
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass

HERE = os.path.dirname(os.path.abspath(__file__))
SQLALCHEMY_URL = "https://github.com/sqlalchemy/sqlalchemy.git"
DEFAULT_REPO = os.path.join(HERE, ".cache", "sqlalchemy")

# 12 ORM test modules (~2,500 tests): enough to show the effect, small
# enough to run in front of an audience.
SUBSET = [
    "test/orm/test_session.py",
    "test/orm/test_query.py",
    "test/orm/test_unitofwork.py",
    "test/orm/test_transaction.py",
    "test/orm/test_scoping.py",
    "test/orm/test_events.py",
    "test/orm/test_mapper.py",
    "test/orm/test_relationships.py",
    "test/orm/test_eager_relations.py",
    "test/orm/test_cascade.py",
    "test/orm/test_deferred.py",
    "test/orm/test_unitofworkv2.py",
]

# Import name -> PyPI distribution name.
PLUGIN_DISTS = {
    "pytest_cov": "pytest-cov",
    "pytest_filemon": "pytest-filemon",
    "pytest_mortadelo": "pytest-mortadelo",
}


def die(msg):
    print(f"demo: {msg}")
    sys.exit(1)


def _abs(path):
    return os.path.abspath(os.path.expanduser(path))


def _is_inside(path, root):
    if not path:
        return False
    path = os.path.realpath(path)
    root = os.path.realpath(root)
    try:
        return os.path.commonpath([path, root]) == root
    except ValueError:
        return False


def _is_git_repo(repo):
    try:
        p = subprocess.run(
            ["git", "-C", repo, "rev-parse", "--is-inside-work-tree"],
            capture_output=True,
            text=True,
        )
    except OSError:
        return False
    return p.returncode == 0 and p.stdout.strip() == "true"


def _looks_like_sqlalchemy(repo):
    return (
        os.path.isdir(os.path.join(repo, "lib", "sqlalchemy"))
        and os.path.isdir(os.path.join(repo, "test", "orm"))
        and _is_git_repo(repo)
    )


def find_repo(script, argv=None):
    """Return a sqlalchemy checkout, cloning one when none was supplied."""
    argv = sys.argv if argv is None else argv
    if len(argv) > 2:
        die(f"usage: {script} [path-to-sqlalchemy-checkout]")

    explicit = argv[1] if len(argv) == 2 else os.environ.get("SQLALCHEMY_REPO")
    if explicit:
        repo = _abs(explicit)
        if not os.path.isdir(repo):
            die(f"sqlalchemy checkout not found: {repo}")
        if not _looks_like_sqlalchemy(repo):
            die(
                f"not a sqlalchemy git checkout: {repo}\n"
                "Pass the repository root (the directory containing lib/ and test/)."
            )
        print(f"demo: using sqlalchemy checkout {repo}", flush=True)
        return repo

    repo = DEFAULT_REPO
    if os.path.isdir(repo):
        if not _looks_like_sqlalchemy(repo):
            die(
                f"{repo} exists but is not a sqlalchemy git checkout.\n"
                "Remove it or pass another checkout / set SQLALCHEMY_REPO."
            )
        print(f"demo: reusing sqlalchemy clone {repo}", flush=True)
        return repo

    clone_repo(repo)
    return repo


def clone_repo(repo):
    parent = os.path.dirname(repo)
    os.makedirs(parent, exist_ok=True)
    print(
        f"demo: no checkout given; cloning sqlalchemy into {repo} "
        "(shallow, one-time)",
        flush=True,
    )
    try:
        p = subprocess.run(
            ["git", "clone", "--depth", "1", SQLALCHEMY_URL, repo],
            capture_output=True,
            text=True,
        )
    except OSError as exc:
        die(f"could not run git: {exc}")
    if p.returncode != 0:
        # A failed clone can leave a half-written directory behind.
        shutil.rmtree(repo, ignore_errors=True)
        die(
            "could not clone sqlalchemy:\n"
            + (p.stdout + p.stderr).strip()
            + "\nPass a checkout as an argument or set SQLALCHEMY_REPO."
        )


def venv_version(py):
    """The (major, minor) of a virtualenv interpreter, or None."""
    if not os.path.exists(py):
        return None
    try:
        p = subprocess.run(
            [py, "-c", "import sys; print('%d.%d' % sys.version_info[:2])"],
            capture_output=True,
            text=True,
        )
    except OSError:
        return None
    if p.returncode != 0:
        return None
    major, _, minor = p.stdout.strip().partition(".")
    if not (major.isdigit() and minor.isdigit()):
        return None
    return int(major), int(minor)


def find_python(repo, plugins=(), minimum=(3, 9)):
    """Return an interpreter with sqlalchemy editable and ``plugins`` installed.

    ``plugins`` are import names, e.g. ``["pytest_mortadelo"]``. A matching
    ``.venv*`` in the checkout is reused; otherwise one is created. Missing
    packages are always installed from PyPI.
    """
    want = sys.version_info[:2]
    if want < minimum:
        die(
            f"this demo needs Python {minimum[0]}.{minimum[1]}+ "
            f"(running {want[0]}.{want[1]})."
        )

    py = os.environ.get("SQLALCHEMY_PYTHON")
    if py:
        py = _abs(py)
        if not os.path.exists(py):
            die(f"SQLALCHEMY_PYTHON does not exist: {py}")
    else:
        py = None
        for cand in sorted(os.listdir(repo)):
            candidate = os.path.join(repo, cand, "bin", "python")
            if cand.startswith(".venv") and venv_version(candidate) == want:
                py = candidate
                print(
                    f"demo: reusing virtualenv {py} "
                    f"(Python {want[0]}.{want[1]})",
                    flush=True,
                )
                break
        if py is None:
            py = make_venv(repo, want)

    have = venv_version(py)
    if have is None:
        die(f"could not run the selected interpreter: {py}")
    if have < minimum:
        die(
            f"this demo needs Python {minimum[0]}.{minimum[1]}+, "
            f"but {py} is {have[0]}.{have[1]}."
        )

    ensure_environment(py, repo, plugins)
    return py


def make_venv(repo, want):
    venv = os.path.join(repo, ".venv")
    # Never repoint a .venv that another interpreter created.
    if os.path.exists(venv):
        venv = f"{venv}-{want[0]}.{want[1]}"
    py = os.path.join(venv, "bin", "python")
    if venv_version(py) == want:
        print(
            f"demo: reusing virtualenv {py} (Python {want[0]}.{want[1]})",
            flush=True,
        )
        return py
    print(
        f"demo: creating virtualenv {venv} with Python {want[0]}.{want[1]}",
        flush=True,
    )
    p = subprocess.run(
        [sys.executable, "-m", "venv", venv],
        capture_output=True,
        text=True,
    )
    if p.returncode != 0:
        die("could not create a virtualenv:\n" + (p.stdout + p.stderr).strip())
    return py


def _run_quiet(py, code):
    p = subprocess.run([py, "-c", code], capture_output=True, text=True)
    return p.returncode == 0, (p.stdout + p.stderr).strip()


def _sqlalchemy_path(py):
    """The path sqlalchemy imports from, or None."""
    p = subprocess.run(
        [py, "-c", "import sqlalchemy; print(sqlalchemy.__file__)"],
        capture_output=True,
        text=True,
    )
    if p.returncode != 0:
        return None
    lines = [line.strip() for line in p.stdout.splitlines() if line.strip()]
    return lines[-1] if lines else None


def ensure_environment(py, repo, plugins):
    """Install sqlalchemy (editable) and any missing plugins from PyPI."""
    install = []
    label = []

    if not _is_inside(_sqlalchemy_path(py) or "", repo):
        install += ["-e", repo]
        label.append("sqlalchemy (editable)")

    if not _run_quiet(py, "import pytest")[0]:
        install.append("pytest")
        label.append("pytest")

    for module in plugins:
        dist = PLUGIN_DISTS.get(module)
        if dist is None:
            die(f"unknown plugin module: {module}")
        if not _run_quiet(py, f"import {module}")[0]:
            install.append(dist)
            label.append(dist)

    if install:
        print(
            f"demo: installing {', '.join(label)} into {py}",
            flush=True,
        )
        p = subprocess.run(
            [
                py,
                "-m",
                "pip",
                "install",
                "--disable-pip-version-check",
                *install,
            ],
            capture_output=True,
            text=True,
        )
        if p.returncode != 0:
            die(
                "could not prepare the demo virtualenv:\n"
                + (p.stdout + p.stderr).strip()
            )

    # Verify rather than trust pip.
    path = _sqlalchemy_path(py)
    if not _is_inside(path or "", repo):
        die(
            f"sqlalchemy must be installed editable from {repo} "
            f"(got: {path or 'nothing'})"
        )
    for module in plugins:
        if not _run_quiet(py, f"import {module}")[0]:
            die(f"{PLUGIN_DISTS[module]} could not be imported from {py}")


def tree_clean(repo):
    """True when no tracked file differs from HEAD (staged or unstaged)."""
    p = subprocess.run(
        [
            "git",
            "-C",
            repo,
            "status",
            "--porcelain",
            "--untracked-files=no",
        ],
        capture_output=True,
        text=True,
    )
    return p.returncode == 0 and not p.stdout.strip()


def ensure_clean(repo):
    if not tree_clean(repo):
        die(
            "the sqlalchemy checkout has tracked-file modifications; "
            "the demo only runs on a clean tree (git status)"
        )


def base_env():
    """A clean pytest environment with the demos' own variables removed."""
    drop = {
        "PYTEST_FILEMON",
        "PYTEST_MORTADELO",
        "PYTHONDONTWRITEBYTECODE",
        "PYTEST_ADDOPTS",
        "PYTEST_PLUGINS",
    }
    env = {k: v for k, v in os.environ.items() if k not in drop}
    env["PYTEST_ADDOPTS"] = "-p no:cacheprovider"
    return env


@dataclass
class Run:
    code: int
    seconds: float
    output: str


def run_pytest(py, repo, args, env=None):
    """Run pytest, streaming stdout/stderr live, and time the run."""
    cmd = [
        py,
        "-m",
        "pytest",
        "--color=yes",
        "--tb=no",
        "-rN",
        "-q",
        *args,
    ]
    run_env = dict(env or base_env(), PYTHONUNBUFFERED="1")
    t0 = time.perf_counter()
    p = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        cwd=repo,
        env=run_env,
    )
    chunks = []
    try:
        assert p.stdout is not None
        while True:
            chunk = p.stdout.read(1)
            if not chunk:
                break
            sys.stdout.write(chunk)
            sys.stdout.flush()
            chunks.append(chunk)
        code = p.wait()
    except KeyboardInterrupt:
        p.terminate()
        p.wait()
        raise
    return Run(code, time.perf_counter() - t0, "".join(chunks))


def pause(prompt):
    try:
        input(f"\n{prompt} ")
    except EOFError:
        print()


def show_diff(repo, target):
    print(f"\n--- edit: {target}", flush=True)
    color = "--color=always" if sys.stdout.isatty() else "--color=never"
    subprocess.run(
        [
            "git",
            "--no-pager",
            "diff",
            color,
            "--no-ext-diff",
            "-U12",
            "--",
            target,
        ],
        cwd=repo,
    )


def erase_coverage(py, repo):
    subprocess.run(
        [py, "-m", "coverage", "erase"],
        cwd=repo,
        capture_output=True,
        text=True,
    )


def coverage_percent(output):
    match = re.search(r"^TOTAL\s+\d+\s+\d+\s+(\d+)%", output, re.M)
    return f"{match.group(1)}%" if match else "-"


def selected_counts(output):
    match = re.search(r"selected (\d+)/(\d+) tests: (.*)", output)
    return match.groups() if match else None


def size_on_disk(path):
    """(total bytes, file count) for a file or directory tree."""
    if os.path.isfile(path):
        return os.path.getsize(path), 1
    total, files = 0, 0
    if os.path.isdir(path):
        for root, _dirs, names in os.walk(path):
            for name in names:
                try:
                    total += os.path.getsize(os.path.join(root, name))
                except OSError:
                    continue
                files += 1
    return total, files


def human_bytes(n):
    size = float(n)
    for unit in ("B", "KiB", "MiB", "GiB"):
        if size < 1024 or unit == "GiB":
            return f"{size:.0f} {unit}" if unit == "B" else f"{size:.1f} {unit}"
        size /= 1024


def show_data_size(repo, relpaths, label="data on disk"):
    """Print and return the on-disk size of the plugin's data files."""
    parts = []
    for rel in relpaths:
        total, files = size_on_disk(os.path.join(repo, rel))
        if files == 0:
            continue
        what = f"{files} files, " if files > 1 else ""
        parts.append(f"{rel}: {what}{human_bytes(total)}")
    note = "; ".join(parts) if parts else "none found"
    print(f"    >> {label}: {note}", flush=True)
    return note
