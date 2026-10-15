# Notes

**The plan.** Add an `updateUser(id, { name, email })` helper to `db/store.js` that
looks up the user and returns `null` when it's missing, then a `PUT /users/:id`
route in `routes/users.js` that validates `name`/`email` first (400 if either is
missing) and returns 404 if the store can't find the user. Both pieces mirror the
existing `getUserById`/`createUser` and `POST /` patterns rather than introducing
anything new. I didn't edit the plan before approving it — the existing code
already had a clear, consistent pattern to follow, so there wasn't much to debate.

**Model.** Claude Sonnet 5. This is a small, well-scoped change against a codebase
with an obvious existing pattern to copy, so there was no need for a heavier
model — the main value was quick, careful adherence to that pattern.

**Commits.** Three, one per logical change: the store helper, the route, and this
write-up. Splitting the store change from the route change makes each commit
reviewable on its own (data layer vs. HTTP layer), and keeping `NOTES.md` as its
own commit keeps it out of the diff a reviewer would actually read for the feature.

**Review.** I checked the diff for the cases the tests don't cover directly: a
non-numeric `:id` (`Number("abc")` is `NaN`, and `NaN !== NaN` in the store's
`find`, so it falls through to 404 instead of throwing), an empty-string field
(caught by the existing falsy check, same as `POST /`), and confirmed
`express.json()` is already registered in `server.js` so the body is always
parsed before the handler runs. Nothing needed fixing — the implementation held
up against those cases as written.
