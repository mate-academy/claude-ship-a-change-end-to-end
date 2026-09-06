## Ship a real change end to end

This is the second project of the course. You'll take everything from Units 3 and 4 and ship one real change to the codebase from start to finish: plan it, build it, commit it cleanly, review it, and open a pull request — the way you'd ship a change for real.

This project builds on the same repository you set up in the first project. Each level's project adds to it, all the way to a shareable plugin at the end.

### The repository

You'll work on the course repo — the small Express API you gave a `CLAUDE.md` in the first project. The platform connects the repo for you; you'll do your work on a branch and submit that branch for review.

The files you'll touch here:

- `routes/users.js` — the users resource, one route per action
- `db/store.js` — the in-memory data helper all routes go through
- `tests/update-user.test.js` — the tests for your change (already written; don't edit them)

### The change you'll ship

Add an **'update a user'** endpoint to the users resource. It should:

- update an existing user by id (`PUT /users/:id`)
- validate the input, rejecting missing or invalid fields with a clear error
- return a sensible "not found" response when the user doesn't exist, rather than crashing
- go through `db/store.js` for data access, following the existing pattern

The repo already contains the tests for this endpoint, in `tests/update-user.test.js`. They start **red** — making them pass is how you know the feature is done. Run them with `npm test`. Don't edit that file; implement the endpoint until it's green.

It's a small feature on purpose — small enough to finish, real enough to need planning, edge cases, and clean commits.

### What you'll deliver

On your copy of the repo:

- the working endpoint, with validation and a not-found response
- a short `NOTES.md` explaining your choices
- `npm test` green — the provided tests check both the endpoint and that `NOTES.md` is present
- the branch opened as a pull request against the main course repository, not your fork
  
The workflow steps below (planning, clean commits, a self-review, a clear PR description) are how you ship this well — and the habits the course is building. Grading is automatic, so it can only check the result: the tests passing. Do the workflow anyway; it's the point of the project.

### Before you start

1. Finish Units 3 and 4.
2. Have Claude Code installed and signed in (`claude --version`), and `gh auth login` done so Claude can open the pull request.
3. Get the repo onto your machine (clone it, or open it from the platform), run `npm install`, and open a terminal in the project folder.

### Tasks

#### 1. See what 'done' looks like

Run `npm test`. The update-user tests fail — that's your target. Read `tests/update-user.test.js` to see exactly what the endpoint must do: update a user (200), return 404 for an unknown id, and 400 when a field is missing.

#### 2. Plan the change first

Start Claude and enter plan mode (Shift+Tab to read-only, or `claude --permission-mode plan`). Ask it to plan the feature. Read the plan before you approve anything: does it touch the right files (the route, `db/store.js`)? Does it handle the not-found and invalid-input cases the tests expect? If it misses something, edit the plan in plain language, then approve it.

#### 3. Choose your model

Decide which model fits. Note which you chose for your `NOTES.md`.

#### 4. Build it in logical commits

Let Claude work the plan, committing as you go — one logical change per commit, with messages Claude writes from the diff. Run `npm test` as you go; the update-user tests turn green once the endpoint is right. Each message should be understandable without opening the diff.

#### 5. Review before you push

Before you open the pull request, ask Claude to review your changes — bugs, edge cases, the not-found path, the validation. Check what it flags yourself, decide what's real, and fix those. A green test run and a clean review are signals, not a guarantee.

#### 6. Open the pull request

Ask Claude to open a pull request for your branch. Read the description it generates: does it say what changed, why, and what a reviewer should test — including the not-found and invalid-input cases? Tighten it if it doesn't.

#### 7. Write your NOTES.md

In a short `NOTES.md`, answer in a few sentences each:

- What was in the plan you approved, and did you edit anything before approving?
- Which model did you choose, and why?
- How did you split your commits, and why that way?
- What did your review catch — or confirm was already fine?

### Definition of done

Grading is automatic — `npm test` must be green on your branch. That single check covers:

- [ ] the update-user endpoint updates an existing user, validates input (400 on a missing field), and returns 404 for a missing user
- [ ] a `NOTES.md` is committed and has real content (your plan, model choice, commit split, and what review caught)

Then open your branch as a pull request against the main course repository — not your fork. The pull request is the submission; the platform picks it up automatically.

### Submit

1. Your work is already on a branch (Claude created it when you started). Confirm with `git status`.
2. Make sure the commits are pushed — ask Claude to push, or:
   ```
   git push -u origin <your-branch>
   ```
3. Open a pull request against the main repository, not your fork. The platform picks it up automatically — there is no separate submit button.
4. Leave the pull request open. Do not merge or close it: grading runs on that pull request.
   
Before you submit, make sure that:

- [ ] only the intended files are in the PR — no secrets, no stray changes
- [ ] `npm test` passes on your branch
- [ ] the PR description explains what, why, and what to test
- [ ] `NOTES.md` explains your choices

---

**How this is checked:** grading is fully automatic — no manual review. `npm test` must be green on your submitted branch, which checks the endpoint (update, validation, not-found) and that you've written a `NOTES.md`. The tests can't judge your commit messages or PR description, so those aren't graded — but they're how you ship a change well, which is the whole point of the project. Do them properly even though only the result is checked.
