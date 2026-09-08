## The plan I approved

The plan added an `update-user` endpoint in two pieces: a `store.updateUser(id, { name, email })`
helper in `db/store.js` that reuses `getUserById` and returns `undefined` for an unknown id (mirroring
how `getUserById` already signals "not found"), and a `PUT /:id` route in `routes/users.js` that
validates `name`/`email` are present (400 otherwise, same shape as `POST /users`), then checks the
store's result for a 404, else responds 200 with the updated user.

I approved it as proposed without editing it — it already touched the right files, handled the three
graded cases correctly, and explicitly called out one trade-off worth a deliberate decision: validation
runs *before* the not-found check, so a request that's both malformed and for an unknown id returns 400,
not 404. That's not forced by the tests (the missing-field test uses an existing id), but it matches the
existing `POST /users` style, so I kept it rather than inventing a different convention for this one route.

## Model choice

I used Claude Sonnet 5. The plan was already detailed and low-ambiguity, so I didn't need the heaviest
model to execute it faithfully — but I still wanted a model capable of a genuinely useful self-review
(step 5), not just fast typing, so I didn't go as light as possible either. Sonnet felt like the right
balance for a small, well-specified change with real edge cases worth checking.

## Commit split

One commit for `db/store.js` and `routes/users.js` together, since they're a single cohesive feature —
the route doesn't function without the store helper, so splitting them would leave an intermediate commit
where the code is simply broken. `NOTES.md` is its own separate commit, since it's a distinct deliverable
(the write-up) rather than part of the endpoint's logic.

## What the review caught

No real bugs. It independently verified the not-found path handles non-numeric ids safely (`Number("abc")`
is `NaN`, which never matches a real id, so it falls through to 404 rather than crashing), confirmed a
client can't overwrite `id` through the request body since only `name`/`email` are destructured, and
re-surfaced the validation-before-404 ordering as a deliberate, defensible choice rather than a bug —
consistent with what the plan had already flagged. It also named two pre-existing gaps inherited from
`POST /users` — no email format validation, and whitespace-only strings pass as "present" — and correctly
scoped those as out of bounds for this change rather than treating them as new defects to fix.

