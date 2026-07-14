# Notes: PUT /users/:id

## Plan

Planned in Claude Code's plan mode before writing any code. The plan (read-only
exploration first) confirmed the exact shape of `routes/users.js` and
`db/store.js`, then a Plan agent proposed: add `updateUser(id, {name, email})`
to the store (mirroring `getUserById`'s lookup + `createUser`'s destructure
style), add a `PUT /:id` route that validates the body, 404s on an unknown id,
and returns the updated user. I approved the plan as proposed — one edit
worth calling out: the plan strengthened validation beyond POST's plain
`!name || !email` check (which accepts non-string truthy values like numbers)
to also reject non-string or whitespace-only values, since the README asks to
reject "missing or invalid" fields, not just missing ones.

## Model

Used Claude Sonnet 5 for planning and implementation. This is a small,
well-scoped CRUD addition with an existing pattern to follow (GET/POST
already establish the id-parsing, 404, and 400 conventions), so a faster
mid-tier model was enough — no need for the extra reasoning depth of a larger
model on a task this constrained.

## Commit split

Three commits, one logical change each:
1. `db/store.js` — add `updateUser`, independently reviewable as a pure
   data-layer change.
2. `routes/users.js` — add the `PUT /:id` handler that depends on it.
3. This `NOTES.md`, added last since it documents the finished work,
   including what the review step caught.

Splitting store from route lets a reviewer check the data-mutation logic
separately from the HTTP/validation concerns.

## What review caught

A self-review pass (line-by-line diff read, checked callers of `updateUser`,
checked the removed/changed validation logic against all three test cases)
found no bugs. Specifically confirmed: a non-numeric `:id` produces `NaN`,
which safely fails `getUserById`'s `===` comparison and 404s rather than
crashing; the mutation in `updateUser` operates on the same object reference
returned by `getUserById`, so it updates the array in place correctly; and the
stricter type/whitespace validation still passes test 3's missing-email case
without needing a wrapping validation library. Nothing needed fixing before
opening the PR.
