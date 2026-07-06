# NOTES

## Plan

The target was defined by the already-written `tests/update-user.test.js`: a
`PUT /users/:id` endpoint that updates a user (200), 400s on a missing
`name`/`email` field, and 404s for an unknown id. I read `routes/users.js`
and `db/store.js` first and planned to mirror the existing patterns exactly
rather than invent new ones: the same `!name || !email` validation already
used by `POST /users`, and the same `find`-by-id + `undefined`-means-missing
approach already used by `getUserById`. No part of the plan needed editing —
the existing code gave a clear template for the new route and store helper.

## Model

Sonnet 5. This is a small, well-specified CRUD addition to an existing
codebase with tests already dictating the contract — it doesn't need a
heavier model's judgment, just careful pattern-matching against the code
that's already there.

## Commit split

Two commits for the feature, plus this notes file:

1. `db/store.js` — add the `updateUser` helper (data layer).
2. `routes/users.js` — add the `PUT /:id` route that validates input and
   wires up the helper (API layer).

Splitting store from route keeps each commit reviewable on its own — the
data-access change and the HTTP/validation change are different concerns,
and this mirrors how `createUser`/`POST` and `getUserById`/`GET :id` are
already split across the two files.

## Review

I ran a self-review of the diff (correctness, cross-file callers, removed
behavior, reuse/simplification, efficiency) before writing this file. It
turned up no issues: the new route reuses the existing validation and
not-found conventions instead of introducing new ones, `express.json()`
already guarantees `req.body` defaults to `{}` on an empty body (so
destructuring is safe, matching the existing `POST` handler), and the store
mutates the same in-memory object reference `getUserById` already returns,
consistent with how the rest of the store works. `npm test` is green.
