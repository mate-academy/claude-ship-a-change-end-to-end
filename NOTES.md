# Notes

**Plan:** Add `updateUser` to `db/store.js` (returns `undefined` when the id is unknown), then a `PUT /users/:id` route that validates `name` and `email` (non-empty strings, else 400), calls the store, and returns 404 if the user doesn't exist. I approved the plan without edits.

**Model:** Claude Sonnet 5.5 — the change is small and follows an existing pattern, so a fast, capable model was enough.

**Commits:** Three logical commits: the store helper, the route, then this write-up, so each can be understood and reverted on its own.

**Review:** Checked the 404 path (unknown id returns 404 instead of crashing), validation (missing, empty, or non-string fields return 400, and a missing body is handled), and that routes only touch data through `db/store.js`. Validation runs before the lookup, so a bad body on an unknown id returns 400.
