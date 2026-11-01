# Notes

## The plan

Claude read the tests, `routes/users.js`, `db/store.js` and `server.js`, then proposed: add an `updateUser(id, { name, email })` helper to the store (returning `undefined` for an unknown id, like `getUserById`), add `PUT /:id` to the users route (validate, then look up, then 404 or return the user), and write this file. It also proposed validating the body before the lookup, with stricter checks than `POST` (non-empty strings). I approved the plan as written and did not edit it.

## Model

Sonnet 5.5, because it was the model the session was already running on. I did not compare models.

## Commit split

One logical change per commit, each message written from its diff:

1. `Add updateUser helper to the in-memory store` — the data layer, since routes only reach data through `db/store.js`.
2. `Add PUT /users/:id to update a user` — the route, with validation and the 404 path.
3. `Reject malformed email addresses in PUT /users/:id` — a separate commit because it came out of the review, and it can be reverted on its own.
4. This file.

## What the review caught

The review found no bugs in the endpoint. Probing it with edge-case requests showed that a missing body, non-string values and whitespace-only names return 400, an unknown id returns 404, and extra body fields such as `role` are ignored. It did flag that `email: "x"` was accepted and stored, so I added a loose format check (commit 3). Not changed: `POST /users` still accepts any non-empty email, so it is more lenient than `PUT`, and a malformed JSON body returns 400 with a stack trace logged, which is existing `express.json()` behavior.
