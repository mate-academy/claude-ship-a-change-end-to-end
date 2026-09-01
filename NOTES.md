# NOTES

## Plan

The task was to implement `PUT /users/:id` so that `tests/update-user.test.js`
passes, without touching that test file. I started by reading the test file
to pin down the exact contract: 200 with the updated `name`/`email` on
success, 404 for an unknown id, and 400 when a required field is missing —
with the 400 check needing to fire even for an id (`1`) that does exist,
since one test sends a valid id with an incomplete body. I then read the
existing `routes/users.js` and `db/store.js` to find the patterns already in
use (how GET/POST validate, shape error responses, and talk to the store)
so the new code would look like it belonged, rather than introducing a new
style.

## Model choice

Claude Sonnet 5, via Claude Code. This is a small, well-specified change
(two files, ~15 lines total) with an existing style to mirror, so a fast
model with tool access to read the test file and existing routes directly
was enough — no need for heavier reasoning.

## Implementation

- `db/store.js`: added `updateUser(id, { name, email })`, which looks the
  user up via the existing `getUserById`, mutates `name`/`email` in place,
  and returns `undefined` if the id isn't found — matching how
  `getUserById` already signals "not found" and how `createUser` returns
  the live object rather than a copy.
- `routes/users.js`: added a `PUT /:id` handler that validates the body
  first (400, reusing the exact `{ error: "name and email are required" }`
  shape from POST), then looks the user up via the store (404, reusing the
  exact `{ error: "User not found" }` shape from GET `/:id`), then returns
  the updated user as JSON.

## Commit split

Planned as two commits: one for the store change (`updateUser` + export),
one for the route change (`PUT /:id` handler), since they're separable
units that each read cleanly on their own — though they land together as
one feature in practice since neither is useful without the other.

## Review

Ran `npm test` after implementing. All three `update-user.test.js` cases
passed on the first try, and the existing `users.test.js`/health suite had
no regressions. The main thing I checked carefully was ordering: the test
for a missing field uses id `1`, which exists in the seed data, so 400
validation has to run before the 404 lookup — otherwise that test would
still pass by coincidence but the logic would be wrong for the general
case. I also double-checked that `id` is coerced with `Number(...)` before
being passed to the store, matching the existing `GET /:id` handler, since
`getUserById` compares with strict `===`.

A follow-up review of the branch surfaced one deliberate but untested
design choice: validation runs before the not-found lookup, so a request
with an invalid body against an unknown id returns 400, not 404 — none of
the three tests exercise that combination, so this ordering is an
assumption rather than a verified requirement. The review also found a few
validation gaps (no type checking beyond truthiness, whitespace-only
strings passing as valid, no email format check), but these are
pre-existing patterns inherited unchanged from the POST handler, not
regressions introduced by this change.
