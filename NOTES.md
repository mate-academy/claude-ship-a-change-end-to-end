# NOTES

## The plan

The plan was small and I approved it as-is, without edits: add an `updateUser(id, { name, email })`
helper to `db/store.js` that mirrors the existing `getUserById`/`createUser` functions and returns
`undefined` when the id doesn't match a user, then add a `PUT /users/:id` route in `routes/users.js`
that validates `name` and `email` are present (400 if not), looks the user up through the store,
returns 404 if it's missing, and otherwise updates and returns it with 200. That maps directly onto
what `tests/update-user.test.js` checks, and it keeps the endpoint going through `db/store.js` for
data access instead of touching the in-memory array directly from the route, following the existing
pattern in the file.

## Model choice

Sonnet 5. The task is a small, well-specified CRUD endpoint with tests already written to define
"done" — there's no ambiguous design space or large context to reason over, so a faster general-purpose
model is a good fit rather than reaching for a heavier reasoning model.

## Commit split

Three commits, each independently understandable from its message and diff:

1. `feat(store): add updateUser helper` — the data-access change in `db/store.js`.
2. `feat(users): add PUT /users/:id endpoint` — the route, validation, and not-found handling in
   `routes/users.js`, built on top of the store helper.
3. This `NOTES.md` write-up.

Splitting store from route keeps each commit reviewable on its own: the first is "here's the new
data operation," the second is "here's how it's exposed and validated." Squashing them together
would hide that the route is just wiring on top of a store primitive, which is the pattern the rest
of the codebase already follows.

## What review caught

Self-review before opening the PR: validation runs before the not-found lookup, which matters because
one of the tests (`PUT /users/1` with a missing field) targets an id that *does* exist — if the 404
check ran first, that request would still 400 correctly, but if I'd swapped the order incorrectly it
could have silently returned 200 with a bad body or a wrong status. Confirmed the order was right by
running `npm test` and reading the assertions in `tests/update-user.test.js` directly rather than
just trusting a green run. Also double-checked that `updateUser` returns `undefined` (not throwing or
mutating a non-existent record) when the id isn't found, and that the route's field check matches the
existing `POST /users` style for consistency rather than inventing a different validation shape.
No bugs were found that needed fixing — the review mainly confirmed the ordering and the store
contract were both correct.
