-----------------------------------
Iskar Technologies Ltd 2026
-----------------------------------

# Notes

## Plan

Add a `PUT /users/:id` endpoint to update an existing user, following the
patterns already used by `GET /users/:id` and `POST /users`: validate the
request body first (missing `name` or `email` returns 400), look the user up
through `db/store.js`, and return 404 if it doesn't exist rather than
crashing. Data access goes through a new `updateUser(id, { name, email })`
helper in `db/store.js`, mirroring the existing `getUserById`/`createUser`
functions, so `routes/users.js` never touches the in-memory array directly.

## Model

Claude Sonnet 5, used through Claude Code in plan mode: explored the
codebase, drafted an implementation plan for review, then implemented it
directly once approved.

## Commit split

Two logical pieces: the store change (`updateUser` in `db/store.js`) and the
route change (`PUT /:id` handler in `routes/users.js`) land together as one
feature commit, since neither is useful without the other and the existing
grading test (`tests/update-user.test.js`) exercises them as a unit.

## Review

Ran `npm test` and `npm run lint` after implementing. All three
`update-user.test.js` cases pass (200 on update, 404 for an unknown id, 400
for a missing field), and the existing `users.test.js`/`health` tests still
pass, so the change doesn't regress the current endpoints. Lint is clean.
