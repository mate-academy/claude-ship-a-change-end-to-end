# NOTES — Update a user (`PUT /users/:id`)

## The plan I approved

Before writing code I ran `npm test` and read `tests/update-user.test.js`: 4 of 9
tests failed (the update test, the 400 test, and the two `NOTES.md` checks). The
404 test already passed by accident, because Express answers 404 for any route
that doesn't exist, so "green" there didn't prove anything yet.

The plan touched exactly two code files plus this note:

1. `db/store.js`: add `updateUser(id, { name, email })` that returns the
   updated user, or `undefined` when the id is unknown. The store doesn't send
   HTTP responses, so it signals "not found" and lets the route decide.
2. `routes/users.js`: add `PUT /:id` that validates the body (400), calls the
   store, returns 404 if it got nothing back, and 200 with the user otherwise.
3. `NOTES.md`.

What I changed before approving: the first draft only checked `!name || !email`,
copying `POST /users`. That lets `{ "name": 42 }` or `{ "email": "   " }`
through, which is not really "valid input", so I asked for both fields to be
non-empty strings. I also asked the plan to say explicitly that only `name` and
`email` are read from the body, so a request can't overwrite the user's `id`.

## Model choice

I used the most capable model available in my Claude Code session rather than
a smaller, faster one. The code itself is small and a lighter model would
likely have written it fine, but most of the value in this project is in the
planning and the review (spotting edge cases the tests don't cover), which is
where the stronger reasoning model helps. The change is tiny, so the extra cost
and latency don't matter.

## How I split the commits

1. `Add updateUser helper to the in-memory store` — data layer only.
2. `Add PUT /users/:id endpoint to update a user` — the route, validation and
   404 handling. This commit turns the endpoint tests green.
3. `Add NOTES.md for the update-user change` — this write-up.

I split it this way because each commit is one logical change that can be read
(or reverted) on its own: the store helper is useful by itself and follows the
existing pattern, the route builds on it, and the notes are documentation, not
behaviour. Every commit message explains what changed and why without needing
to open the diff.

## What the review caught (or confirmed)

I asked for a review of the diff focused on bugs, the not-found path and
validation, and checked each point by hand with `supertest`:

- **Confirmed fine:** unknown id (`/users/9999`) and a non-numeric id
  (`/users/abc`, which becomes `NaN`) both return 404 with
  `{ "error": "User not found" }` and nothing crashes.
- **Confirmed fine:** an `id` in the request body is ignored; the user keeps
  its original id.
- **Caught and fixed in the plan:** non-string or blank `name`/`email`
  (`42`, `""`, `"   "`) are rejected with 400, not only missing fields.
- **Decided, not a bug:** validation runs before the lookup, so a bad body on
  an unknown id gets 400 instead of 404. This matches how `POST /users` works
  and avoids a pointless lookup.
- **Noted, out of scope:** `POST /users` still accepts blank or non-string
  values. Fixing it would be a separate change to a different endpoint, so I
  left it alone to keep this PR focused.

`npm test` (9/9) and `npm run lint` both pass.
