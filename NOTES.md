# NOTES

## Plan

I asked Claude to plan the `PUT /users/:id` endpoint before writing any code. The approved plan: add an `updateUser(id, { name, email })` helper to `db/store.js` (reusing the existing `getUserById` lookup, returning `null` when not found), then a `PUT /:id` route in `routes/users.js` that validates `name`/`email` are present (same 400 pattern as `POST /`) and returns 404 via the store's `null`. No changes to `server.js` or the test file. I didn't need to edit anything in the plan before approving it — it matched the existing route/store patterns closely enough that there wasn't a gap to fill in.

## Model

Sonnet 5 (the session's active model). The task was small and well-specified by the pre-written tests, so a lighter-weight model was a reasonable fit rather than needing a heavier reasoning model.

## Commits

Split into two functional commits plus this one:
1. `Add updateUser to the in-memory store` — the data-layer change alone.
2. `Add PUT /users/:id endpoint with validation and 404 handling` — the route wiring, on top of a working store function.
3. This `NOTES.md` commit.

Splitting store-layer from route-layer meant each commit was independently reviewable and each left the repo in a working, testable state (the tests only look for the full `PUT` behavior, but the code compiles and runs after each step).

## Review

Self-review before opening the PR found no real bugs. Two things worth noting rather than fixing, since they match existing code:
- A non-numeric `:id` (e.g. `/users/abc`) becomes `NaN`, which never matches an existing id, so it falls through to 404 — the same behavior `GET /users/:id` already has.
- If the request body is invalid **and** the id doesn't exist, the endpoint returns 400 (validates the body first) rather than 404. Not covered by the tests either way; chose to validate input shape before existence, which is the more common REST convention.

`npm test` and `npm run lint` are both green.
