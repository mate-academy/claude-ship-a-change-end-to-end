# NOTES — PUT /users/:id

## The plan I approved

The plan touched two files: add `updateUser(id, { name, email })` to `db/store.js` (returns the updated user, or `undefined` for an unknown id), then add `PUT /users/:id` to `routes/users.js`, calling the store rather than the `users` array, matching the existing routes. It covered the three cases in `tests/update-user.test.js` (200 / 404 / 400) and the repo's error convention of JSON `{ "error": "..." }`.

Before approving I tightened it in two ways: "invalid" had to mean more than "missing" (wrong type, blank name, email not shaped like an address), and the id in the URL must win — an `id` in the body is ignored. I also asked for extra tests of my own in a separate file, since the provided test file must not be edited.

## Model

Claude Opus 5.5. The feature is small, but the work was the whole workflow — plan, implement, write tests, review, write the PR — and I wanted the strongest reasoning for spotting edge cases in the review step. For a change this size a smaller model (Sonnet) would likely have been enough for the code itself.

## How I split the commits

1. `Add updateUser helper to the in-memory store` — data layer only.
2. `Add PUT /users/:id endpoint to update a user` — the route, validation and 404; this is the commit that turns the grading tests green.
3. `Add edge-case tests for PUT /users/:id` — extra coverage, separate so the behaviour change and its tests can be reviewed on their own.
4. `Add NOTES.md` — this write-up.

One logical change per commit, ordered so every commit leaves lint and the existing tests passing, and each message says what and why without needing the diff.

## Design choices

- **400 before 404.** Input is validated before looking the user up, so `PUT /users/9999` with a bad body returns 400. That matches POST and avoids a lookup on bad input; either order satisfies the tests.
- **PUT replaces the whole resource**, so both `name` and `email` are required. Partial updates would be PATCH.
- **Values are trimmed** before storing, so `"  Ada  "` is saved as `"Ada"`.
- **Simple email check** (`something@something.tld`). Good enough to reject obvious garbage; real validation would be a confirmation email.
- I left the POST route's validation as it is, to keep this change focused.

## What the review caught

I probed the endpoint directly (valid, empty/missing/text/array bodies, blank and non-string names, bad email, unknown and non-numeric ids). The new code behaved correctly in every case — the review confirmed rather than changed it. It did flag two pre-existing, app-wide issues, which I left out of scope:

- Malformed JSON (`{bad`) gets Express's default **HTML** 400 page, not a JSON `{ error }`. It affects POST too; the fix is an error-handling middleware in `server.js`, a good follow-up.
- `Number(req.params.id)` accepts ids like `1.0` or `0x1` as user 1. GET already behaves this way, so I kept them consistent.
