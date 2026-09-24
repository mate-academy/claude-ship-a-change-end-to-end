# Notes

## Plan

The plan I approved: read `tests/update-user.test.js` first to pin down the contract (200 with the updated user, 404 for an unknown id, 400 for a missing field), add an `updateUser` helper to `db/store.js` next to `getUserById`/`createUser`, then add `PUT /users/:id` in `routes/users.js` following the same shape as the existing routes (`{ error }` JSON bodies, `Number(req.params.id)`), and finish with a review and this file. I approved it without edits; the one decision I made explicit was the order of checks — the route answers 404 for an unknown id before looking at the body, so a missing user is always reported as "not found" regardless of what was sent.

## Model

I used Claude Opus 5.5. The feature is small, but it has to fit an existing codebase's conventions and get the edge cases right (validation, not-found, not crashing on odd bodies), so I preferred the stronger reasoning model over a faster one; on a change this size the extra cost is negligible.

## Commits

Three commits, one logical change each: (1) the `updateUser` store helper, (2) the `PUT /users/:id` route that uses it, (3) this `NOTES.md`. Data access and HTTP handling are separate layers in this repo, so splitting them keeps each diff readable on its own, and the store commit is safe to land without the route.

## Review

Before committing the route I reviewed the diff and probed it with supertest: no body, a `text/plain` body, a non-numeric id (`/users/abc`), a non-string name, a whitespace-only name, an extra `id` field in the body, and an unknown id with an invalid body. All returned the expected 400/404/200 and none crashed; the extra `id` is ignored, so a PUT cannot change a user's id. The review caught one real issue: the 400 message said "name and email are required", which is misleading when the fields are present but blank or not strings, so I changed it to "name and email must be non-empty strings". I deliberately did not add email-format validation, since `POST /users` doesn't validate it either and the two endpoints should accept the same data.
