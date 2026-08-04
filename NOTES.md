# Notes — PUT /users/:id

## The plan I approved

The plan was to touch exactly `db/store.js` and `routes/users.js`: add an `updateUser(id, {
name, email })` helper to the store (mirroring `getUserById`/`createUser`, returning `null` when
the id doesn't match so the route can 404), then add a `PUT /:id` route that validates `name` and
`email` before touching the store, 404s on an unknown id, and otherwise returns the updated user.
It also called for tightening validation so non-string and whitespace-only values are rejected,
not just missing ones, and sharing that check between `POST` and `PUT` rather than duplicating it.

One thing I changed before approving: the plan as first drafted targeted opening the PR against
`mate-academy/git-playground-task5`. That repo turned out to be unrelated to this fork (no shared
history, not in the fork network), so a cross-repo PR there isn't something GitHub allows. I
confirmed the actual upstream — `mate-academy/claude-ship-a-change-end-to-end` — and redirected the
PR target there before starting any code changes.

## Model choice

Opus, in plan mode, for the planning and review passes — the parts of this task that benefit
from more careful reasoning about edge cases (id validation, whitespace input, ordering of the
validation vs. the not-found check). Implementation itself is small and mechanical enough that a
faster model would do just as well, but I kept the same model through execution for consistency
between the plan and what actually got built.

## Commit split

Four commits, each independently sensible and each leaving `npm test` in a state I could explain:

1. `db/store.js` — the `updateUser` helper on its own, since it's pure data-layer logic with no
   route wired to it yet.
2. `routes/users.js` — the `PUT /:id` route, which is the commit that turns the three
   `update-user.test.js` cases green.
3. `routes/users.js` — extracting `isNonEmptyString` and using it in both `POST` and `PUT`. Kept
   separate from (2) because it's a behavior change to the *existing* `POST` endpoint (rejecting
   non-string/whitespace input it used to accept), not part of adding the new one — worth being
   able to review or revert independently.
4. This file.

## What the review caught

Went through the full diff and a live-server spot check (valid update, non-numeric id, and
whitespace-only name) after the tests were green. No bugs turned up: the non-numeric-id path
degrades to a 404 through the same `Number()` → `NaN` → "not found" route as the existing
`GET /:id`, rather than crashing; validation runs before the store lookup, so a malformed request
against a real id still gets `400` and never touches the data; and the stored object is mutated
in place and returned, consistent with how `createUser` already works. The one substantive
decision — whether `PUT` should require both fields (full replace) versus allowing partial
updates — was already made in the plan and is intentional: the tests treat a single provided
field as invalid, so partial-update semantics (`PATCH`-style) are out of scope here.
