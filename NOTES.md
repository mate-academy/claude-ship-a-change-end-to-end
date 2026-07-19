# Notes

## Plan

The plan called for two code changes and one new file:
1. Add `updateUser(id, { name, email })` to `db/store.js` — returns the updated user or `undefined` on miss, following the same no-throw pattern as `getUserById`.
2. Add `router.put("/:id", ...)` to `routes/users.js` — validate fields first (400), then look up the user (404), then update (200). Validation before lookup ensures that a missing field always returns 400, even when the id exists.
3. Create `NOTES.md`.

No edits to the generated plan were needed — the contract extracted from `tests/update-user.test.js` (200/404/400 cases and their order) was clear enough to approve as written.

## Model choice

Used **Sonnet 4.6**. The change is small, the patterns to follow are explicit in the existing code, and the tests define the exact contract. Sonnet gives the best cost/quality balance for mechanical work guided by tests; Opus would be overkill here.

## Commit split

Three commits, each self-contained:
1. `store: add updateUser helper` — data layer only; no route changes yet.
2. `routes: add PUT /users/:id endpoint` — route only, which already had the store helper it needed.
3. `docs: add NOTES.md` — documentation separate from code.

This order means each commit compiles and passes whatever tests existed at that point. Mixing store and route into one commit would have made bisecting harder if something broke.

## What the review caught

The self-review (code-review skill, medium effort) surfaced one PLAUSIBLE finding: passing a non-numeric id like `/users/abc` returns 404 instead of 400, because `Number("abc")` is `NaN` and the store lookup misses. After verification, this was confirmed to be consistent with the existing `GET /users/:id` handler — same pattern, same behavior — so it is an architectural choice rather than a bug. No changes were made.
