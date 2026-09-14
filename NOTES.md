# Notes

## Plan

Added a `PUT /users/:id` endpoint following the existing patterns in `routes/users.js`
and `db/store.js`. The route validates that both `name` and `email` are present
(matching the existing `POST /users` inline validation, 400 on missing fields), looks
up the user through a new `store.updateUser(id, { name, email })` helper, and returns
404 when the id doesn't exist rather than crashing. No new abstractions or validation
libraries were introduced since none existed in the codebase already.

## Model

Claude Sonnet 5, via Claude Code.

## Commit split

1. `db/store.js`: add the `updateUser` data-access function and export it.
2. `routes/users.js`: add the `PUT /:id` route handler.
3. `NOTES.md`: this write-up.

## Review

Checked that the new route's validation and not-found ordering match the existing
`GET /:id` and `POST /` handlers exactly (same status codes and error JSON shape), and
ran the test suite (`tests/update-user.test.js`, `tests/users.test.js`,
`tests/notes.test.js`) to confirm the new endpoint behaves as specified.
