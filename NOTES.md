# NOTES

## The plan

The task was to add `PUT /users/:id` end to end: update an existing user, validate the body,
return 404 for an unknown id instead of crashing, and go through `db/store.js` like the other
routes. I read the three existing routes (`GET /`, `GET /:id`, `POST /`) and `db/store.js` first
and matched their style rather than inventing a new one: `POST` already validates
`!name || !email` → 400 before doing anything, and `GET /:id` already 404s via a store lookup, so
the plan was to mirror both — add `store.updateUser(id, { name, email })` that returns `null` when
the id doesn't match (same shape as `getUserById`), then a `PUT /:id` route that validates first
(400), looks the user up via the store (404 if missing), and otherwise updates and returns it
(200). This matched `tests/update-user.test.js` exactly: valid update → 200, unknown id → 404,
missing field → 400 (checked before the 404, since the test sends a real existing id with a
missing field and still expects 400). I didn't need to revise anything after drafting it — the
existing code's own pattern was the whole plan.

## Model choice

Sonnet 5. This is a small, well-specified CRUD addition to a codebase whose conventions were
already clear from the three existing routes — there was no ambiguous design decision or large
context to reason over, so a faster, cheaper model was the right fit rather than reaching for a
heavier one.

## Commit split

Three commits, one per layer/concern:
1. `db/store.js` — the data-access change (`updateUser`), independently reviewable and testable in
   isolation from the HTTP layer.
2. `routes/users.js` — the route wiring that uses it, which is what actually turns the grading
   tests green.
3. This file.

Splitting store from route means each commit is a single logical change that could be reviewed on
its own — "add the capability" separate from "expose the capability over HTTP" — rather than one
commit mixing a new data function with new routing/validation logic.

## What the review caught

I ran a self-review of the diff before pushing. It found no correctness bugs: `updateUser` mirrors
the existing `getUserById`/`createUser` patterns, the non-existent-id and missing-field paths
behave consistently with how `GET /:id` and `POST /` already handle those same cases, and all of
`tests/update-user.test.js` and `tests/users.test.js` pass. It flagged one minor, non-blocking
duplication: the `if (!name || !email) return res.status(400)...` validation is repeated
identically in `POST /` and `PUT /:id`. That mirrors an existing pattern rather than introducing a
new one, so I left it as is instead of extracting a shared helper for a two-line duplication.
