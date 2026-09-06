# Notes

## The plan

I asked Claude to plan the `PUT /users/:id` endpoint before writing any code. It first explored `routes/users.js`, `db/store.js`, and `tests/update-user.test.js` to find the existing conventions (validation style, error shapes, id parsing), then proposed: add an `updateUser(id, { name, email })` helper to `db/store.js` that mutates the matching user in place and returns `undefined` if the id isn't found, and add a `PUT /:id` route handler that validates the body first (same truthy check as `POST /`), then looks up the user and returns 404 if missing, 200 with the updated user otherwise. I read the plan and didn't need to edit it — it already matched the existing GET/POST patterns exactly and covered the validate-before-lookup ordering question the test cases raised, so I approved it as written.

## Model

Claude Sonnet 5. This is a small, well-scoped change against a tiny codebase with clear existing patterns to follow — no need for a heavier model, and Sonnet handled the exploration, planning, and implementation cleanly in one pass.

## Commit split

Two commits, one per file, in dependency order:

1. `Add updateUser helper to the data store` — the `db/store.js` change
2. `Add PUT /users/:id endpoint` — the `routes/users.js` change that uses it

Splitting this way keeps each commit reviewable on its own (the store helper is a pure data-layer change; the route is the HTTP-facing behavior that consumes it), and the order means the second commit's diff makes sense without needing the first commit's contents in front of you.

## What review caught

I ran `/code-review` on the diff before pushing. It came back clean — no findings. It specifically checked and confirmed: a non-numeric `:id` becomes `NaN`, so `Array.find` returns `undefined` and the endpoint 404s correctly (same as the existing `GET /:id`); the in-place mutation in `updateUser` matches `createUser`'s existing style; nothing else in the codebase calls `store.updateUser`, so nothing else could break; and requiring both `name` and `email` (no partial update) is the intended design per the task, not a gap. Nothing needed fixing.
