# Notes

**Plan.** Read `README.md` and `tests/update-user.test.js` first to see exactly what "done"
meant: a `PUT /users/:id` that returns 200 with the updated user, 404 for an unknown id, and
400 when `name` or `email` is missing. The plan was small: add an `updateUser(id, { name, email })`
helper to `db/store.js` that mirrors `getUserById`/`createUser`, then add the `PUT /:id` route in
`routes/users.js` following the same validate-then-act shape already used by `POST /`. Nothing
needed editing before approving — the existing GET/POST routes were a clean template to follow.

**Model.** Used Claude Sonnet 5. The task is a small, well-specified CRUD endpoint with existing
tests defining the contract, so a fast, reliable model was enough — no need for a heavier
reasoning model for this size of change.

**Commits.** One commit for the endpoint (`db/store.js` + `routes/users.js` together, since the
route can't work without the store helper — splitting them would leave an intermediate commit
that doesn't run), and a separate commit for this `NOTES.md` write-up, kept apart from the code
change so the diff for the actual feature stays focused.

**Review.** Checked the not-found path (`Number("bad-id")` produces `NaN`, and `NaN !== NaN` in
the `Array.find` comparison, so it correctly falls through to 404 rather than crashing — same
behavior as the existing `GET /:id`). Confirmed validation rejects a missing `name` or `email`
before touching the store, so a partial update never has to be represented in memory. No bugs
found beyond that; the existing code's patterns made the new route straightforward to match.
