# Notes

## The plan

I asked Claude to plan the change in plan mode. Its plan touched the right
files: a new `updateUser(id, { name, email })` helper in `db/store.js` that
returns `undefined` when the id is unknown, and a `PUT /users/:id` handler in
`routes/users.js` that validates the body before looking the user up — so a
missing field is a 400 even when the user exists, and a full body for an
unknown id is a 404. It also called for this `NOTES.md` and one commit per
logical item. Before approving I chose the **minimal** scope (only what the
grading tests check, no extra validation or test files) and asked for the
work to be committed item by item; the plan was updated to match and then
approved without further edits.

## Model choice

Claude Opus 5. The change is small, but the plan-first workflow and the
self-review are where a stronger model earns its keep: it spotted the
validate-before-lookup ordering up front and probed edge cases the tests
don't cover. For a change this size a smaller model would also have been
fine; the cost difference on a ~30-line diff is negligible.

## Commit split

Three commits, each one thing:

1. `db/store.js` — the `updateUser` helper. Pure data-layer change, no
   behaviour change to the API yet.
2. `routes/users.js` — the `PUT /users/:id` route. This is the commit that
   turns the tests green.
3. `NOTES.md` — this write-up.

Splitting the store from the route keeps each commit reviewable on its own
and mirrors how the existing code is layered (routes go through the store).

## What the review caught

Nothing that needed a fix. The review confirmed:

- a non-numeric id (`PUT /users/abc`) becomes `NaN`, matches nothing, and
  returns a clean 404 rather than crashing
- an empty string or a missing body is rejected with 400
- an `id` sent in the request body is ignored, so a user's id can't be
  reassigned through the update
- the update persists — a following `GET /users/1` returns the new values
- only `db/store.js` and `routes/users.js` changed; the test files were not
  edited
