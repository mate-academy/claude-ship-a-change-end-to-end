# Notes

**Plan.** I planned before coding: add an `updateUser(id, {name, email})` helper to `db/store.js` (returns `undefined` for an unknown id), then a `PUT /users/:id` route in `routes/users.js` that goes through it. The route returns 404 for an unknown id, 400 when `name`/`email` are missing or not non-empty strings, and 200 with the updated user otherwise. I did not need to edit the plan; it already covered the not-found and invalid-input cases the tests expect.

**Model.** I used Claude Sonnet 5.5: the change is small and well specified by the tests, so a fast, capable general model was enough and a larger one would add cost without benefit.

**Commits.** Three commits, one logical change each: the store helper, the route (which depends on it), and this NOTES.md. That keeps each message understandable without the diff and makes the data layer and HTTP layer separately revertable.

**Review.** The review confirmed the route follows the existing pattern (store access only through `db/store.js`). It flagged edge cases I handled: a non-numeric id yields 404 (`Number` gives NaN, which matches nothing), a missing JSON body is tolerated via `req.body || {}`, and whitespace-only or non-string values are rejected with 400. Existence is checked before validation, so an unknown id always gets 404.
