# Notes

## Plan

Before writing any code I asked Claude Code (in plan mode) to plan the "update a user" endpoint. The plan it proposed touched exactly the two files the task calls for: a new `updateUser(id, { name, email })` helper in `db/store.js` that reuses the existing `getUserById` lookup and returns `undefined` for an unknown id, and a `PUT /:id` route in `routes/users.js` that validates the body, then checks the store's return value to decide between 404 and 200 — mirroring the patterns already used by `GET /:id` and `POST /`.

I edited the plan before approving it: the first draft validated fields the same way `POST /users` does (`!name || !email`, which accepts things like `name: 123` or a whitespace-only string). I asked for stricter validation — both fields must be non-empty strings after trimming — since an update endpoint felt like the right place to be a bit more careful about what gets written. I also added a step to write this NOTES.md, since the grading tests check for it.

## Model

I used Claude Opus 5 in Claude Code. This is a small, well-scoped feature with clear tests already written, so a faster model would probably have worked too, but I wanted the planning step to reason carefully about edge cases (invalid ids, whitespace-only input, matching existing error shapes) before any code was written, and Opus is the strongest available for that kind of judgment call.

## Commits

I split the work into four commits, one logical change each:

1. `Add updateUser helper to the in-memory store` — just the data layer.
2. `Add PUT /users/:id endpoint with validation and not-found handling` — just the route; the grading tests went green after this commit.
3. `Trim name/email before persisting on PUT /users/:id` — a fix from self-review (see below).
4. This NOTES.md.

Splitting the store change from the route change means each commit is understandable on its own and leaves the repo in a working state — useful if I'd needed to bisect or revert later. The review fix is its own commit rather than being folded into commit 2, so the history shows what the review actually caught.

## What review caught

I asked Claude to review the diff before opening the PR. It flagged three things:

- **Real bug (fixed):** the route validated `name`/`email` against their *trimmed* form, but `updateUser` stored the *raw* values — so `"  Padded Name  "` passed validation and was saved with the whitespace intact. Fixed by trimming before calling `store.updateUser`.
- **Efficiency nit (fixed):** the `isFilledString` helper was a fresh closure allocated inside the route handler on every request. Hoisted it to module scope.
- **Inconsistency with `POST /users` (left as-is):** `POST` still uses the looser `!name || !email` check, so it accepts values (`name: 123`, whitespace-only names) that `PUT` now rejects. This is a real inconsistency, but changing `POST`'s validation is outside what this task asked for and isn't covered by any test, so I left it — flagging it here instead of touching code the task didn't ask me to change.
