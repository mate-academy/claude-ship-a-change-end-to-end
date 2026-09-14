---
description: Find every TODO and FIXME comment in the codebase, grouped by file
---

Search the codebase for every `TODO` and `FIXME` comment (case-sensitive, matching common comment prefixes like `//`, `#`, `/*`, `*`, `<!--`) excluding `node_modules`, `.git`, and other build/dependency directories.

Use `git grep -n -E "(TODO|FIXME)" -- . ':!node_modules'` (or `grep -rn -E "(TODO|FIXME)" . --exclude-dir=node_modules --exclude-dir=.git` if not in a git repo / files are untracked) to locate matches, always excluding `node_modules`.

Present the results grouped by file, with each file as a heading followed by its matching lines (line number + the comment text), sorted in ascending line-number order within each file. If no TODO/FIXME comments are found, say so clearly. Keep the output concise — no extra commentary beyond the grouped list and a total count at the end.
