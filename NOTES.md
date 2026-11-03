# Notes — PUT /users/:id

## Plan
I started Claude in plan mode (`--permission-mode plan`) and asked it to read `tests/update-user.test.js` first. The plan touched exactly the right two files: an `updateUser(id, { name, email })` helper in `db/store.js` that returns nothing when the id is unknown, and a `PUT /:id` route in `routes/users.js` that returns 400 for a missing field and 404 when the store finds no user. I edited one thing before approving: validation must reject not only missing fields but also values that are not non-empty strings (`123`, `"   "`), and it must run before the store lookup.

## Model
I used Sonnet. The feature is small but needs care with edge cases and follows existing patterns, which Sonnet handles well; Opus would be overkill for two short functions, and Haiku is better kept for mechanical bulk edits.

## Commits
1. `db/store: add updateUser helper` — the data layer on its own.
2. `routes/users: add PUT /:id` — the endpoint with validation and the 404 path.
3. `routes/users: trim name/email before storing` — the fix from review.
4. This `NOTES.md`.

Each commit is one logical change, so the history reads as "data layer → endpoint → review fix → docs" and each message makes sense without opening the diff.

## Review
Before pushing I asked Claude to review `main...HEAD`. It confirmed the not-found path (unknown and non-numeric ids → 404) and that `updateUser` cannot overwrite `id`. It flagged two things: values were validated with `trim()` but stored untrimmed — a real inconsistency that I fixed in commit 3; and validation runs before the existence check, so an invalid body on an unknown id returns 400, not 404 — I kept that on purpose, because the tests expect a missing field to return 400 and bad input should be rejected before touching data.
