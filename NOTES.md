# NOTES.md

## Plan

The plan I approved added an `updateUser(id, { name, email })` helper in `db/store.js` (find the user, return `null` if missing, otherwise mutate `name`/`email` in place and return it) and a `PUT /:id` route in `routes/users.js` that validates `name`/`email` the same way `POST /` does, then returns 404 if the store returns nothing, or the updated user otherwise. I didn't edit the plan — it already matched the existing GET/POST patterns closely enough that there was nothing to push back on.

## Model

I used Claude Sonnet 5. The task was small and fully specified by the pre-written tests, so it didn't need heavy reasoning — just following the existing route/store pattern precisely.

## Commits

Two commits: one for the `db/store.js` helper, one for the `routes/users.js` route that uses it. Splitting them keeps the data-layer change separable from the HTTP-layer change, and each commit is a complete, reviewable unit on its own (even though only the second one turns the tests green).

## Review

I reviewed the diff before opening the PR. What I checked: whether an invalid `:id` (like `/users/abc`) crashes the server — it doesn't, `Number("abc")` becomes `NaN`, which never matches a real id, so it falls through to a 404, same as the existing `GET /:id` route already does. I also checked that a request can't overwrite a user's `id` via the body — it can't, since `updateUser` only reads `name`/`email` off the body. No real bugs turned up; the two things above were already fine because I copied the existing patterns instead of writing new logic.
