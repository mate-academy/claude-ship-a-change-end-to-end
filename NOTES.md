# Notes — adding `PUT /users/:id`

## The plan I approved, and what I changed in it

I ran `npm test` first to see the target: 4 red — the two `NOTES.md` tests and
two of the three update-user tests. Worth noting the third one, "returns 404 for
a user that does not exist", was already **green before I wrote any code**. That
was an accident, not a passing feature: Express answers 404 for any method/path
with no route attached. Once a real `PUT` handler existed, that safety net went
away and the 404 had to be handled properly. I re-checked that test after adding
the route specifically to confirm it was still passing for the right reason.

The plan I approved covered three files:

1. `db/store.js` — an `updateUser(id, fields)` helper, so the route never touches
   the `users` array directly.
2. `routes/users.js` — the `PUT /users/:id` handler, with validation before the
   store lookup and an explicit 404.
3. `NOTES.md` — this file.

Two things I pinned down in the plan before approving, because the tests alone
don't settle them:

- **`PUT` is a full replacement, so both fields are required.** The test sends
  `{ name: "Only a name" }` to id `1`, which *exists*, and still expects 400.
  That rules out partial-update semantics. Partial updates would be a `PATCH`,
  and nothing asks for one, so I didn't add it.
- **Validation runs before the store lookup.** For a request that is bad on both
  counts — junk body *and* unknown id — this returns 400 rather than 404. The
  tests each exercise only one failure at a time, so they don't pin the ordering
  down; the repo's convention that 400 is about the body and 404 is about the id
  is what decided it, along with the rule to validate before touching the store.

The one thing I added to the plan that wasn't in the original ask: rather than
copy `POST`'s `if (!name || !email)` into the new route, I extracted a shared
`isUsable` check. The house conventions say not to introduce a second way of
doing the same thing, and two copies of a validation rule drift apart. I flagged
in the plan that this slightly tightens `POST` too, since it now rejects
whitespace-only and non-string values that used to slip through.

I deliberately left two things out, and said so in the plan rather than quietly
skipping them: there's no `docs/` directory in this repo, so I didn't invent an
API reference; and I didn't add a `store.reset()` export, because nothing calls
one and I can't edit the tests that would.

## Model choice

Opus 5. The coding part here is genuinely small — one helper and one handler —
but the judgement calls around it aren't: full-replacement vs. partial-update
semantics, which error wins when a request is bad in two ways, and whether to
duplicate the validation or refactor it. Those are the decisions that make this
endpoint either consistent with the rest of the API or subtly off, and they're
worth the stronger model. A smaller model would very likely have produced a
passing endpoint; my concern was the parts the tests don't check.

## How I split the commits

Five, one logical change each, ordered so the build never depends on something
that doesn't exist yet:

1. **`updateUser` helper in the store** — the data-access change on its own.
2. **Extract the shared `isUsable` check** — a refactor of existing `POST`
   behaviour, kept separate from the new feature so the one behaviour change it
   causes is visible in isolation rather than buried in a new-endpoint diff.
3. **Add the `PUT /users/:id` route** — the actual feature, now that both pieces
   it leans on are in place.
4. **Store the trimmed values** — the fix that came out of the review (below).
5. **This file.**

The split is mostly about commit 2. Mixing a refactor of existing code into a
commit that adds a new endpoint is how a behaviour change to `POST` gets shipped
without anyone noticing it happened. Separated out, `git log` shows plainly that
`POST` got stricter and why.

## What the review caught

I reviewed the branch diff before pushing, and ran the endpoint by hand against
the cases the tests don't cover: a non-numeric id, a whitespace-only name, a
non-string name, an empty body, and a request with no body at all.

**One real bug, which became commit 4.** `isUsable` validates `value.trim()`,
but the routes were passing the *raw* string to the store. So
`PUT /users/1 {"name": "   Ada   "}` passed validation and persisted the
padding — the value that was checked was not the value that was written. The
tests never caught this because they send clean input. Fixed by trimming at both
call sites, so the store holds exactly what validation approved.

Things the review confirmed were already fine:

- **No crash on a missing body.** `express.json()` leaves `req.body` as `{}` on
  Express 4, so destructuring it is safe; verified with a genuinely body-less
  request, which returns 400.
- **Non-numeric ids.** `PUT /users/abc` returns 404, not a crash or a 500.
  `Number("abc")` is `NaN`, `NaN` matches no record, and "no such user" is the
  honest answer — this is the documented behaviour for this repo, so no
  `Number.isInteger()` guard.
- **Every `res.*` is returned**, so no handler can fall through and try to send a
  second response.
- **Error bodies** are all `{ error: "<string>" }`, reusing the exact wording
  already in the file.

One thing I checked and chose *not* to change: `updateUser` mutates the user
object in place instead of replacing the array entry. That means anything holding
a reference to the record sees the update. For an in-memory store that resets on
restart, and given `createUser` works the same way, changing it would be
inconsistency for its own sake.

A green test run isn't proof of much here — the suite has three cases, and the
bug in commit 4 passed all of them.
