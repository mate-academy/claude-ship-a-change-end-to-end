# NOTES

## The change

`PUT /users/:id` replaces an existing user's `name` and `email`.

- **200**: returns the updated user.
- **400**: the body is invalid. It returns a clear error naming the problem: missing field, empty or non-string `name`, or an `email` that doesn't look like an address.
- **404**: no user has that id (including non-numeric ids). It returns `{ "error": "User not found" }`, the same as `GET /users/:id`.

## Plan

The approved plan had three steps:

1. Add `updateUser(id, { name, email })` to `db/store.js`. It returns `undefined` for an unknown id, so the route decides on the 404 and the store stays HTTP-free.
2. Add the `PUT /:id` route in `routes/users.js`. It validates first, then calls the store, then returns 404 or 200.
3. Write this file.

Before approving, I checked that the plan touched only the route and the store, and that it covered the 200, 404, and 400 cases in `tests/update-user.test.js`. Nothing needed editing. One decision was made during planning: validate the body *before* looking up the user. A bad body sent to an unknown id therefore gets 400, not 404. This avoids touching data for a request that can't succeed either way.

Setup note: the work started in the first project's repo, which has no `tests/update-user.test.js`. The tests live in `mate-academy/claude-ship-a-change-end-to-end`, so the work was moved to a fork of that repo on a new `update-user-endpoint` branch.

## Model

Claude Opus 5.5. The feature is small, but the task included finding the right repo, planning, edge-case review, and writing commit messages and a PR description. A stronger model is more useful for that judgment-heavy work than for the code itself. Sonnet would also have handled the code fine.

## Commits

1. **Store helper.** Data access lives in `db/store.js` by convention, so it is its own self-contained change.
2. **Route and validation.** This is the user-facing behavior. It turns the update-user tests green.
3. **NOTES.md.** Documentation, kept separate from the code.

Each commit leaves the suite no worse than before and can be read on its own.

## Review

The review probed cases beyond the provided tests:

- **Ids:** a non-numeric id (`/users/abc`) returns 404.
- **Invalid fields:** an empty, whitespace-only, or non-string `name` returns 400, and so does an email without `@`/domain.
- **Bodies:** an array or empty body returns 400, and malformed JSON gets 400 from Express's JSON parser with no crash. An `id` in the body is ignored, so the user's id can't change.

These were all already correct, so nothing needed fixing.

Two things were noted but left alone because they are outside this change's scope:

- `POST /users` uses a looser `!name || !email` check than the new PUT validation.
- Neither endpoint trims whitespace around the stored values.
