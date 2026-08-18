# Notes: add PUT /users/:id

**The plan I approved**: add an `updateUser(id, { name, email })` helper to
`db/store.js` that reuses `getUserById` and returns `undefined` for an
unknown id, then add a `PUT /:id` route in `routes/users.js` that validates
`name`/`email` the same way `POST /` does (`400` if either is missing) and
returns `404` when the store helper comes back empty. I didn't edit the plan
before approving it — it already matched the two existing patterns in the
file (`GET /:id`'s not-found handling, `POST /`'s validation) closely enough
that there was nothing to adjust.

**Model**: Claude Sonnet 5. This is a small, well-scoped change that follows
patterns already present twice in the same file, so it didn't call for
extra reasoning depth — Sonnet was plenty, and faster to iterate with.

**Commit split**: two commits, one per file — `db/store.js` (the
`updateUser` helper) then `routes/users.js` (the route that uses it). Each
commit is a complete, understandable unit on its own (a store helper isn't
useful without a caller, but it's a distinct logical change from the route
itself), and splitting them makes the diff easy to review top-to-bottom in
the order the request flows.

**What the review caught**: nothing needed fixing. I checked the usual edge
cases — a non-numeric `:id` (`Number("abc")` is `NaN`, which never matches
a real user id, so it falls through to `404` instead of crashing), an empty
string for `name`/`email` (still falsy, so still `400`), and confirmed
`express.json()` is already wired up in `server.js` so `req.body` works for
`PUT` the same as it does for `POST`. The implementation mirrors the
existing `POST`/`GET :id` handlers closely enough that it inherited their
already-correct behavior rather than introducing new edge cases.
