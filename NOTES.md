# Notes

## The plan I approved

I asked Claude to plan the "update a user" feature in plan mode. It read `README.md`, `tests/update-user.test.js`, `routes/users.js`, and `db/store.js` first, then proposed:

- add an `updateUser(id, { name, email })` helper to `db/store.js`, mirroring the style of the existing `createUser`/`getUserById` functions — find the user, update in place, return `null` if not found
- add a `PUT /:id` route to `routes/users.js` that validates `name` and `email` are present (400 if not), calls `store.updateUser`, and returns 404 if it comes back `null`
- validate the input *before* checking existence, so a bad body on a real id still returns 400, matching what the tests expect and matching the existing `POST /` handler's order

I didn't need to edit the plan before approving it — it already named the right files, reused the existing patterns instead of inventing new ones, and covered all three cases the tests check (200 update, 404 not found, 400 missing field).

## Model choice

I used **Sonnet 5**. The change was small (~30 lines across two files) and fully specified by the existing test file and the patterns already in `routes/users.js` — there was no architectural ambiguity to reason through, just pattern-matching against code already sitting in the file. Opus's extra reasoning depth is worth paying for on genuinely uncertain problems (unfamiliar bugs, real trade-offs, multi-file refactors); this wasn't one of those, so Sonnet was the better fit for speed without giving anything up.

## How I split the commits

Two commits, one per file/responsibility:

1. `Add updateUser helper to the in-memory store` — the `db/store.js` change alone
2. `Add PUT /users/:id endpoint to update a user` — the `routes/users.js` route alone

I split it this way because the store helper and the route are two separable units: the helper is pure data-layer logic that could be reviewed and tested independently of how it's wired up, and the route is the HTTP-layer concern (validation, status codes) built on top of it. Each commit stands on its own and reads clearly without needing the other's diff open.

## What the review caught

I ran `/code-review` on the diff. It found no correctness bugs — it specifically checked the NaN-id path, empty-string validation, and the not-found path, and traced `updateUser` to confirm it has exactly one caller and is used correctly there.

It did flag one non-bug: the `if (!name || !email)` validation check is now duplicated verbatim in both `POST /` and `PUT /:id`, so a future change to validation rules could update one handler and miss the other. I chose not to extract a shared helper for it — at two lines, in a codebase that doesn't otherwise use shared validation middleware, the abstraction wasn't worth adding for a course-sized change. I'm noting it here as considered-and-declined rather than silently ignored.
