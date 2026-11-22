# NOTES: PUT /users/:id (update a user)

## Plan
Before coding I checked the three update-user tests and the existing code.
The plan: add `updateUser(id, data)` to `db/store.js`, following the same
pattern as `createUser`, and add a `PUT /:id` route in `routes/users.js`.
The route validates the body first (400 for a missing or invalid `name` or
`email`), then looks the user up (404 if the id is unknown), and only then
updates. I did not change the approved plan before implementing it.

## Model choice
I implemented this with Claude Haiku 5.5. The change is small and well-defined
(one store function, one route, a few validation checks), so the cheapest model
that can do it reliably was enough.

## Commit split
Planned as one logical change per commit: first the store helper, then the
route with validation and the 404 path, then this NOTES.md. Each commit is meant
to be understandable from its message alone.

## What the review caught
A self-review of the diff checked the not-found path, the invalid-input cases
and edge cases such as a whitespace-only name. One real finding: the email was
validated before trimming, so a value with surrounding spaces was rejected while
the name was trimmed. I fixed this so both fields are trimmed first and then
validated. Everything else was already fine: an unknown or non-numeric id
returns 404, and an empty body returns 400.
