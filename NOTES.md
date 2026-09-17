# Notes

## Plan

Add `PUT /users/:id` to the users resource: update an existing user's `name`
and `email`, return 200 with the updated user on success, 400 if either
field is missing, and 404 if the id doesn't exist. The plan followed the
existing conventions exactly — the not-found shape from `GET /:id`
(`{ error: "User not found" }`) and the validation shape from `POST /`
(`{ error: "name and email are required" }`) — plus a new `updateUser`
helper in `db/store.js` that mirrors `getUserById`'s find-and-return-
`undefined`-if-missing pattern. Input is validated before the id lookup,
matching `POST /`'s order, so every body-consuming handler checks its
input the same way. I approved the plan as proposed without edits — it
matched the existing code style closely enough that there was nothing to
push back on.

## Model

Sonnet (Claude Sonnet 5) for execution — planning and implementation.

## Commit split

Split into one commit per file/responsibility: first the `db/store.js`
data-layer change (`updateUser`), then the `routes/users.js` route that
uses it, then this `NOTES.md`. Keeping the store helper and the route in
separate commits makes each one reviewable on its own (data access vs.
HTTP layer), even though they land together for the feature to work.

## Review

Pending — will review the diff (edge cases, the not-found path, and the
validation path) before opening the pull request, and update this section
with what it caught.
