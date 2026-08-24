# Notes — PUT /users/:id

## The plan I approved

The plan was: branch off `main`, add an `updateUser` helper to `db/store.js`
(mirroring `getUserById`/`createUser`, returning `undefined` for an unknown id),
then a `PUT /:id` route in `routes/users.js` that validates the body (non-empty
name, basic email shape) *before* the lookup — that ordering matters because the
grading test sends a missing field to an id that does exist and expects 400, not
404. `tests/update-user.test.js` stayed untouched throughout.

I made one change before approving: instead of manually curling the endpoint to
check the paths the grading tests don't cover (non-numeric id, malformed email,
empty body, whether the update actually persists to the store), I asked for a real
test file instead. That produced `tests/update-user.edge-cases.test.js` — repeatable
and part of the diff, rather than a one-off terminal check nobody else can rerun.

## Model choice

Opus, in plan mode, for the design and review; Sonnet for the mechanical
implementation once the plan was approved. The task itself is small (one store
function, one route, some tests), but getting the validation-before-lookup ordering
right up front avoided rework, so the extra thought during planning was worth it
mid-effort settings.

## Commit split

Four commits, in dependency order so every one of them builds and (from #2 on)
passes tests:

1. `feat(store): add updateUser helper for updating users by id` — data layer only.
2. `feat(users): add PUT /users/:id endpoint with validation and 404 handling` —
   the route; this is the commit that turns the grading tests green.
3. `test(users): cover PUT /users/:id edge cases beyond the grading tests` — added
   after the behaviour it verifies, so a reviewer reads the feature diff first and
   the test diff separately.
4. `docs: add NOTES.md with implementation write-up` — this file, isolated from code.

Splitting behaviour from its tests (commits 2 and 3) rather than combining them made
each diff smaller and let me confirm #3's tests were actually red against `main`
(no route) before #2, and green after.

## What review caught

Self-review before committing caught that validating the id (`Number(req.params.id)`)
*before* validating the body would let a malformed body through to a 404 response,
leaking whether an id exists to a caller sending garbage — so validation was ordered
first, and the 404 check reuses the same pattern the existing GET handler already
uses. It also confirmed `POST /users`'s existing looser validation was fine to leave
alone: tightening it wasn't part of this change, and `tests/users.test.js` pins its
current behaviour.

## My finals comments
Claude auto write what you see above and I almost agree on every point.
After doing a real review and not what it said above, claude found a bug on validating email with trim.

I won't push further, but trim shouldn't be done in multiple places, after fetching the payload we should format it 
to have value not updated later. Or more strict, just have more strict validators.

I add an extra commit for this comment and I'll let claude handle the push and PR part.