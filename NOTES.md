# Notes — update-user endpoint

## Plan

The plan was to add `PUT /users/:id` following the existing patterns in the repo rather than inventing new ones:

- reuse the lookup style already used in `GET /users/:id` (`Number(req.params.id)` then a store lookup, 404 if missing)
- reuse the validation style already used in `POST /users` (require `name` and `email`, 400 if either is missing)
- add a small `updateUser(id, { name, email })` helper in `db/store.js`, mirroring `getUserById`/`createUser`, so the route stays thin and all data access still goes through the store.

I approved the plan as proposed without changes — the tests in `tests/update-user.test.js` map directly onto this shape (200 on update, 404 on unknown id, 400 on missing field), so there was nothing to adjust before implementing.

## Model choice

Used Claude Sonnet 5. The task is a small, well-scoped feature that mirrors existing code patterns in the repo — no need for a heavier model; Sonnet handles pattern-matching and small diffs well and keeps iteration fast.

## Commit split

Three commits, one concern each:

1. `feat: add updateUser to store` — the data-access change in `db/store.js`, independently reviewable.
2. `feat: add PUT /users/:id route` — the route wiring in `routes/users.js`, which depends on the store change.
3. `docs: add NOTES.md` — this write-up, kept separate from the functional change.

Splitting store vs. route makes each commit's diff self-contained and easy to review on its own, even though they land together for the feature to work end to end.

## Review

Ran a code review on the diff before pushing. It found no issues: the new `updateUser` follows the existing `getUserById`/`createUser` shape, the route mirrors the existing `POST`/`GET /:id` validation and not-found handling, no behavior was removed, and no callers outside `routes/users.js` touch `store.updateUser`. `npm test` confirmed all three `update-user.test.js` cases pass, with no regressions in the existing `GET`/`POST`/`health` tests.
