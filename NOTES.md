# NOTES

Write-up for the "update a user" change (`PUT /users/:id`).

## Plan

The approved plan had three parts: add an `updateUser` helper to `db/store.js`, add a `PUT /:id` route in `routes/users.js` that validates input and returns 404 for an unknown user, and fill in this file. The route follows the existing pattern and goes through the store for all data access.

I edited the plan before approving it. My first draft had `updateUser` return `undefined` for a missing user. I asked for a clear error instead, so the helper now throws `Error("User not found: <id>")` with `code = "USER_NOT_FOUND"`, and the route catches that code and turns it into a 404.

## Model choice

Sonnet. It was a small, well-specified change with tests already written and no hard logic, so a heavier model wasn't needed.

## Commit split

1. `store: add updateUser helper that throws when user is missing` - the data-layer change on its own, so the route has something to call.
2. `users: add PUT /users/:id with validation and 404` - the endpoint, which turns the failing update-user tests green.
3. `users: store trimmed name and email on update` - the one bug found in review, kept separate so the fix is visible as its own change.
4. `docs: add NOTES.md write-up` - this file, last because it describes the earlier commits.

Each commit is one logical change, and the store helper comes before the route that uses it.

## Review

The review raised seven points and one was a real bug: validation trimmed `name` and `email`, but the untrimmed strings were saved, so `"  Ada  "` was stored with its spaces. I fixed it in commit 3.

The rest I left alone on purpose:

- Ids such as `1.0` or `0x1` map to user 1 because of `Number()`. `GET /users/:id` does the same, so I kept it consistent.
- PUT validates more strictly than POST, which accepts non-strings and whitespace-only values. That is a real inconsistency, but changing POST is outside this task, so I'm flagging it as a follow-up.
- A bad body on an unknown id returns 400, not 404. That is the order I planned, and the tests accept it.
- The store throws on a missing user while its other functions return `undefined`. That is the behaviour I asked for.
- The store mutates the stored user in place, as the in-memory store already works.
