# NOTES

## Plan

The plan was: add `updateUser(id, { name, email })` to `db/store.js` (find by id,
overwrite only `name`/`email`, return `undefined` if not found), then add
`PUT /users/:id` to `routes/users.js` — validate the body (both fields required,
non-empty strings, email format), call `store.updateUser`, and return 404 when it
comes back `undefined`. I approved this without editing it; it matched the
existing `GET`/`POST` patterns in the file closely enough that there wasn't
anything to push back on.

A second round of planning happened after self-review (see below), adding: a
JSON error-handler in `server.js` for malformed request bodies, strict numeric
`:id` parsing shared by `GET`/`PUT /users/:id`, and an extra edge-case test file.

## Model

Started on Opus for planning and the initial implementation, since I wanted
careful reasoning about validation edge cases before writing code. Switched to
Sonnet for the follow-up fixes from the review — those were mechanical
(error-handler middleware, a regex-based id check, more tests) and didn't need
Opus-level reasoning.

## Commits

Split into one logical change per commit:
1. `db/store.js`: add `updateUser` (data layer first, independent of the route)
2. `routes/users.js`: add the `PUT /users/:id` route + validation
3. `server.js`: JSON parse-error handler (found in review)
4. `routes/users.js`: strict `:id` validation, reused by GET and PUT (found in review)
5. `tests/update-user-edge.test.js`: edge-case tests for the above
6. this file

Kept the store/route split from the original plan, then added each review
finding as its own commit instead of squashing them into the first two, so
the history shows what the review caught rather than hiding it.

## Review

Self-review (asked Claude to check bugs, edge cases, validation) found:
- Malformed JSON bodies returned Express's default HTML error page instead of
  a JSON error — fixed with an error-handling middleware in `server.js`.
- `Number(req.params.id)` accepted non-integer strings like `"0x2"`, `"1.0"`,
  `"1e0"` and would update/read the wrong user instead of 404ing — fixed with
  a strict `parseId()` helper, applied to both `GET` and `PUT /users/:id`.
- `NOTES.md` was incomplete (only covered the model choice).

Confirmed as already fine: 400-before-404 ordering (invalid body against an
unknown id returns 400, which is reasonable), an `id` field in the request
body is ignored rather than allowed to overwrite the real id, duplicate
emails are allowed (consistent with `POST /users`, which doesn't check
either), and the email regex doesn't have catastrophic-backtracking behavior.
