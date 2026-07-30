# NOTES

## The plan

I asked Claude to plan a `PUT /users/:id` endpoint from `tests/update-user.test.js` and the
README's task description. The plan it proposed matched what I expected: add an `updateUser`
helper to `db/store.js` (mirroring the existing `getUserById`/`createUser` style), add a `PUT /:id`
route in `routes/users.js` that validates `name`/`email` before returning 400, looks the user up
and returns 404 if missing, and returns 200 with the updated user otherwise. It also flagged that
`npm test` includes `tests/notes.test.js`, which requires this file to exist with real content —
I hadn't noticed that dependency, so I had it add a `NOTES.md` step to the plan rather than editing
anything else in it.

## Model choice

I used Opus 5 for both planning and implementation. This is a small, well-specified change with an
existing test file as the spec, so a faster/cheaper model would likely have been fine too, but I
wanted a careful read of the existing route/store conventions before adding anything, and Opus
tends to follow established patterns more consistently on a first pass.

## Commit split

Three commits: the `db/store.js` helper, the `routes/users.js` route, then this `NOTES.md`. Splitting
the store change from the route change means each commit is reviewable on its own (data layer vs.
HTTP layer), and either could be reverted independently if something were wrong with just one side.

## What review caught

I reviewed the diff before writing this file. Nothing needed changing — the new route reuses the
exact 400/404 error shapes (`{ error: "..." }`) already used by `POST /` and `GET /:id`, so the API
stays consistent, and it goes through `store.updateUser` rather than touching the `users` array
directly, following the existing data-access pattern. `npm run lint` is clean, and `npm test` is
green (all three `update-user` cases plus the existing `users`, `notes`, and `health` tests).
