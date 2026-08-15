# Notes

## Plan

The approved plan was to add a `PUT /users/:id` endpoint: update an existing user by id, validate the input and reject missing/invalid fields with a clear error, return a proper 404 instead of crashing when the user doesn't exist, and route all data access through `db/store.js` rather than touching the in-memory array directly. The plan itself matched what was proposed — I didn't edit it before giving the go-ahead to implement.

## Model

Claude Sonnet 5. The task was a small, well-scoped CRUD addition to an existing Express app with a pre-written contract test already dictating the exact expected behavior, so it didn't call for a heavier model — Sonnet 5 was plenty for following the repo's existing conventions and getting the validation/not-found logic right.

## Commits

Two commits, split by layer: the first added `store.updateUser` to `db/store.js` (the data-access change), and the second added the `PUT /users/:id` route handler in `routes/users.js` that calls it (the HTTP-layer change). Splitting this way keeps each commit self-contained and independently reviewable — the store function is a pure addition with no behavior until something calls it, and the route commit is where the actual endpoint semantics (validation, 404, 200) come together.

## Review

The review caught one real issue: the `if (!name || !email)` validation check in the new PUT handler is a byte-for-byte duplicate of the one in POST, which risks the two drifting apart if the validation rule ever changes. I decided to leave it as-is since it's only duplicated once so far. The review also confirmed several things were fine as implemented: the not-found path correctly mirrors the existing `GET /users/:id` 404 behavior, non-numeric ids fall through to 404 naturally without special-casing, there's no prototype-pollution or race-condition risk, and the lack of email-uniqueness enforcement is pre-existing behavior from `createUser`, not a regression introduced by this change.
