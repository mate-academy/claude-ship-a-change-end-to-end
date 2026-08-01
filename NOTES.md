# Notes

## Plan

Add a `PUT /users/:id` endpoint following the existing route patterns in
`routes/users.js`: validate `name` and `email` first (400 if either is
missing, same as `POST /users`), then look up the user via a new
`updateUser` helper in `db/store.js` (404 if it doesn't exist), otherwise
update and return it. No changes to `tests/update-user.test.js`. I approved
the plan as-is — the only thing I added on review was double-checking the
order of the 400/404 checks against the test that PUTs an existing id with a
missing field, and confirming the `NaN`-id edge case (non-numeric `:id`)
degrades to a 404 the same way `GET /:id` already does, rather than crashing.

## Model

Claude Sonnet 5, in plan mode first so I could read and approve the approach
before any code was written. The change was small and pattern-following
enough that a bigger/slower model wasn't needed.

## Commits

Split into two functional commits plus this doc: (1) the `updateUser` store
helper, (2) the `PUT /users/:id` route that uses it. Keeping the store
change separate from the route change makes each commit reviewable on its
own — one adds a pure data-layer function, the other wires it into the API.

## Review

Self-reviewed the diff before committing: checked validation-before-lookup
ordering, the `NaN`-id edge case, and that the new code matches the existing
style (no added error handling beyond what the other routes already do).
`npm test` is green (9/9) and `npm run lint` is clean.
