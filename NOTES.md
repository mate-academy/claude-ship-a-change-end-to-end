# Notes

**Plan.** Add `updateUser(id, {name, email})` to `db/store.js` (returns `undefined` for an unknown id), then a `PUT /users/:id` route in `routes/users.js` that validates input (400), calls the store, and returns 404 if nothing was found. I did not run a separate interactive plan-mode session; I read the README and the tests, wrote this plan myself and did not change it afterwards.

**Model.** Claude Sonnet 5.5 — the change is small and well specified by the tests, so a fast mid-size model is enough; a larger model would add cost without benefit.

**Commits.** Three commits, one logical change each: (1) the store helper, (2) the route with validation and 404, (3) this NOTES.md. Store first so the route commit builds on something that already exists.

**Review.** I reviewed the diff for the not-found path and validation. Confirmed fine: a non-numeric id becomes `NaN`, finds no user and gives 404; a missing body is handled with `req.body || {}`; non-string or blank name/email give 400. Choice made: PUT replaces both fields (both required), and values are trimmed. Not covered by tests: duplicate emails are not checked, same as POST.
