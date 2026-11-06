#!/bin/sh
# Deploy the built deck to the gh-pages branch (GitHub Pages serves it).
# Usage: npm run deploy   (builds, then force-syncs dist/ into gh-pages and pushes)
set -e

npm run build

git fetch origin gh-pages 2>/dev/null && git branch -f gh-pages FETCH_HEAD 2>/dev/null || true

TMP=$(mktemp -d)
if git show-ref --verify --quiet refs/heads/gh-pages; then
  git worktree add --detach "$TMP" gh-pages
else
  # first deploy on a fresh clone: start from an empty orphan branch
  git worktree add --detach "$TMP" origin/gh-pages 2>/dev/null \
    || { git worktree add --detach "$TMP" HEAD; git -C "$TMP" checkout --orphan gh-pages; git -C "$TMP" rm -rfq .; }
fi

# mirror dist/ into the branch, without history or repo files
rsync -a --delete --exclude .git --exclude .gitignore dist/ "$TMP"/

git -C "$TMP" add -A
if git -C "$TMP" -c commit.gpgsign=false commit -m "deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ)"; then
  git -C "$TMP" push origin "HEAD:gh-pages"
else
  echo "nothing to deploy (no changes since last deploy)"
fi

git worktree remove --force "$TMP"
echo "pushed to gh-pages — https://gnufede.github.io/pycones-2026/"
