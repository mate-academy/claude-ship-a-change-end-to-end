---
name: commit
description: Stage and commit changes in this repository following its established commit message conventions. Use whenever the user asks to commit, save, or check in changes, or says things like "commit this", "save my work", or "make a commit for X" — even if they don't spell out a message themselves.
---

# Commit

Create commits that read like the existing history in this repo, so the log stays consistent no matter who (or what) made the commit.

## This repo's convention

Look at recent history with `git log --oneline -15` before drafting a message — conventions can drift, so confirm the pattern still holds rather than trusting this description blindly. As of now:

- **Imperative mood, capitalized**: "Implement update-user endpoint", "Refactor code formatting", "Configure ignored pull request branches" — not "Implements...", "implemented...", or "Fixes bug where...".
- **No type prefixes.** This repo does not use Conventional Commits style (`feat:`, `fix:`, `chore:`). Just the plain imperative sentence.
- **Single line, no body**, unless the change genuinely needs explanation a reader couldn't get from the diff alone (a non-obvious workaround, a breaking change, a reason a reviewer would ask about). Most commits here are one line and stay that way.
- **Describe the "what" at a feature level**, not a file-by-file list — e.g. "Implement 'update a user' endpoint with input validation and error handling" rather than "Edit users.js, add validation.js".
- Quote a feature/entity name in the message when it disambiguates the endpoint or resource being touched (mirrors `Implement "update a user" endpoint...`).

## Workflow

1. Run `git status` and `git diff` (staged and unstaged) to see everything that would be included. Never blindly `git add -A` — stage specific files by name so unrelated or sensitive files (`.env`, credentials, stray local config) don't sneak in.
2. If anything staged looks unexpected or the diff touches a file that could hold secrets, stop and confirm with the user before committing.
3. Draft the message from the actual diff content, matching the style above. Keep it honest about what changed — don't inflate a small fix into something grander, and don't undersell a multi-part change.
4. Create the commit. Only amend an existing commit if the user explicitly asks for that — default to a new commit every time.
5. After committing, run `git status` to confirm a clean tree (or show what's still outstanding), and report the commit hash and message back to the user.

## What this skill does not do

It does not push to any remote, open a pull request, or rewrite history (`rebase`, `reset --hard`, force-push). Those are separate actions — hand back to the user or the relevant workflow rather than chaining them in automatically.
