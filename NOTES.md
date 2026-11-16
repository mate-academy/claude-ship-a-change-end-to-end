# Notes

## Plan
Approved plan: branch `feat/update-user`; add `updateUser(id, { name, email })` to `db/store.js`; add `PUT /users/:id` in `routes/users.js` that validates input (400), updates through the store, and returns 404 for an unknown id; then write these notes. I did not edit the plan before approving, apart from choosing stricter validation (non-empty strings) than the POST route's truthy check.

## Model
Sonnet 5.5. The change is small and well specified by the tests, so a fast, capable mid-size model was enough.

## Commits
Three commits, one logical change each: the store helper, the route, then this write-up. The store helper is separate so the data-access change can be read on its own.

## Review
Validation runs before the lookup, so a bad body gets 400 even for an unknown id. A missing JSON body is handled (`req.body || {}`) rather than crashing. Not handled: a non-numeric id simply becomes NaN and returns 404, which matches GET.
