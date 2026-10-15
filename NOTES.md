# NOTES

## The plan

I read `tests/update-user.test.js` first to pin down the exact contract: `PUT /users/:id`
must return 200 with the updated user, 404 for an id that doesn't exist, and 400 when a
required field is missing — even when the id does exist (the 400 test uses id `1`, a real
user). That last detail meant validation had to run before the not-found lookup, not after.
The plan was to mirror the existing `POST /users` handler's shape (same validation style,
same error message conventions) and add one store helper, `updateUser(id, { name, email })`,
following the pattern of `getUserById`/`createUser`. I didn't change the plan after approving
it — the existing code made the shape of the change obvious.

## Model choice

Sonnet 5. This was a small, well-specified feature with an existing near-identical template
in the codebase (`POST /users` + `createUser`), so it didn't need heavyweight architectural
reasoning — just care to get the validation-before-404 ordering right against a fixed test
file I couldn't edit.

## Commit split

Two commits: one for the feature (`db/store.js` + `routes/users.js` together, since the route
depends on the store helper and neither is independently useful/testable without the other),
and a separate one for this `NOTES.md`. Keeping the write-up out of the feature commit keeps
that commit's diff focused on the actual behavior change.

## What review caught

I reviewed the diff before writing this. It's a 2-file, ~30-line change with no surprises.
Things I specifically checked: an invalid/non-numeric `:id` (`Number("abc")` → `NaN`) falls
through to 404 rather than throwing, since `getUserById` uses strict `===` and `NaN` never
matches; and the validation-before-lookup ordering matches what the tests require. `npm test`
is green (9/9) and `npm run lint` is clean.
