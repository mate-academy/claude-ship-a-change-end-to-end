# NOTES: PUT /users/:id

## The plan, and what changed before approving it

The plan had three parts: add an `updateUser(id, { name, email })` helper to `db/store.js` that returns `undefined` for an unknown id, add a `PUT /users/:id` route in `routes/users.js` that validates the body and maps a missing user to 404, then run `npm test` against `tests/update-user.test.js`.

One change before building: a presence check alone (what the tests need) would have let `{ "name": 123 }` or `"   "` through, so the plan was widened to also check that both are non-empty strings, reject an email with no `@`, and trim values before saving.

## Model

Opus for the planning, since the edge cases (400 vs 404 ordering, what counts as "invalid") were the part worth thinking about. The implementation itself is small and follows the existing POST route, so a cheaper model would have handled the build step just as well.

## How the commits are split

1. **Add updateUser to the store**: the data-access change on its own, so the route can be reviewed separately from how data is stored.
2. **Add PUT /users/:id to update a user**: the endpoint, its validation and the 404 path. This is the commit that turns the update-user tests green.
3. **Make the PUT /users/:id validation error say what is wrong**: the fix that came out of the review (below).
4. **Add NOTES.md**: this file.
5. **Reject malformed emails in PUT /users/:id**: a tighter email check plus tests for it, from a second review pass.

Each one is a single logical change and its message explains the why, so it reads without opening the diff.

## What the review caught

The pre-push review checked the not-found path, the validation and odd inputs. Checked by hand with supertest:

- missing body, missing field, whitespace-only name, numeric name: all 400 ✔
- malformed email (`@`, `a@b`, `a b@c.com`, `user@.example.com`, `user@example..com`, no `@`): 400 with its own message, user left unchanged ✔
- unknown id (`9999`) and non-numeric id (`abc`): 404, no crash ✔
- valid update with padded values: 200, values trimmed ✔

Real issues found and fixed:

- The first email check only looked for an `@`, so `"@"` or `"a@b"` would have been saved. It now requires something before the `@` and a domain made of non-empty labels separated by single dots (so `user@.example.com` and `user@example..com` fail too), with no spaces, and `tests/update-user-validation.test.js` covers the malformed cases (commit 5).
- A non-string or blank field got the message "name and email are required" even when both fields were sent, which is misleading. It now says they must be non-empty strings (commit 3).

Flagged but left alone: validation runs before the existence check, so `PUT /users/9999` with a bad body returns 400 rather than 404. That's deliberate (the request is invalid whatever the id), and the tests agree. Duplicate emails aren't prevented, but `POST /users` doesn't prevent them either, so that belongs in a separate change.
