# Notes

## The plan

I started from the failing tests rather than a written plan document: `npm test` showed four
reds — two in `tests/update-user.test.js` and two for a missing `NOTES.md`. (The third
update-user test, the 404 case, was already green, but only by accident: with no `PUT` route
registered, every `PUT` fell through to a 404.) Reading the test file gave the exact
contract, so the plan was short:

1. Add an `updateUser(id, { name, email })` helper to `db/store.js`, mirroring the shape of
   the existing `getUserById` / `createUser` helpers, returning `undefined` when the id
   doesn't exist so the route can decide the status code.
2. Add `PUT /users/:id` to `routes/users.js`, reusing the validation wording already used by
   `POST /users` so the two endpoints stay consistent.

The one decision worth calling out: the order of the two failure checks. I validate the body
first (400) and only then look the user up (404). Both tests pass either way — the 404 case
sends a complete body and the 400 case targets an existing id — so the tests don't pin it
down. I chose validate-first because a malformed request is malformed regardless of whether
the target exists, and it avoids leaking whether an id exists to a request that was never
well-formed to begin with.

## Model choice

Claude Opus 5. The change is small, but it touches two files and has to match existing
conventions rather than just satisfy an assertion, and I wanted the review pass to be worth
something. A smaller model would very likely have gotten the endpoint green; the cost
difference on a change this size is not worth optimizing.

## Commit split

Three commits, split by layer:

1. `db/store.js` — the `updateUser` helper on its own. It's a self-contained data-layer
   change that makes sense without the route.
2. `routes/users.js` — the `PUT /users/:id` route that consumes it, plus the shared
   `isValidDetails` check the review prompted (see below). This is the commit that turns the
   update-user tests green.
3. `NOTES.md` — documentation, not part of the feature.

Splitting by layer means the first commit is reviewable without the second, and a reviewer
reading the second one sees the whole HTTP contract — validation, not-found, success — in a
single diff.

## What the review caught

I asked Claude to review the change before opening the PR. It reported five things; I
reproduced each against the running app before deciding, and acted on three.

**Fixed — truthiness validation let non-string fields through.** `if (!name || !email)` only
catches absent or empty values, so `PUT /users/1` with `{"name":{"a":1},"email":["x"]}`
returned **200** and stored an object as the user's name; whitespace-only strings slipped
through the same way. Replaced with an `isValidDetails` helper requiring both fields to be
non-blank strings. `POST /users` had the identical hole, and since this change adds a second
write path, I fixed both rather than leave the two endpoints inconsistent — the existing
POST test still passes.

**Fixed — the id was parsed loosely enough to alias distinct URLs onto one record.**
`Number(req.params.id)` reads `"0x2"`, `"2.0"` and `" 2"` all as `2`, so `PUT /users/0x2`
returned 200 and mutated user 2. The pre-existing `GET /users/:id` leaks the same alias, but
only for a read; letting a *write* land through a URL that shouldn't resolve is worse. Now
matched against `/^\d+$/` and 404'd otherwise. Worth noting the first fix I reached for —
`Number.isInteger(id)` — doesn't work, because `Number("0x2")` *is* the integer 2; the check
has to be on the raw string.

**Fixed — this file had wrong numbers in it.** The earlier draft said "four reds — three in
update-user and two for NOTES" (which sums to five) and claimed "7 passing" when the run is
9. Corrected above. The test file asks for an honest write-up, and the counts are the part a
reader can actually check.

**Not fixed — `updateUser` has no guard of its own.** Called directly as
`store.updateUser(1, { name: "X" })` it would set `email` to `undefined`. No caller does
that: the route validates both fields before the store is touched. It's a real gap in the
helper's contract rather than a bug in the app, and pushing validation into the data layer
would duplicate what the route already does, so I left it and am flagging it here instead.

**Not fixed — nothing was committed at review time.** Correct, and the point of running the
review before the PR: the branch and the three commits above come after this.

Still out of scope deliberately: there's no email *format* validation anywhere in the app,
and adding it only on these two endpoints would be a broader change than this feature.

Final state: `npm test` is 9 passing, `npm run lint` is clean.
