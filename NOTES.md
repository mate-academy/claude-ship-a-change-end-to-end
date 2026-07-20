# NOTES

## Plan

Added `PUT /users/:id` to update an existing user's name and email. I explored
the existing `GET /users/:id` and `POST /users` handlers first and followed
their conventions exactly: parse the id with `Number(req.params.id)`, validate
`name`/`email` with the same truthy check POST uses, return the same
`{ error: "..." }` shape for both 400 and 404, and add a matching
`updateUser(id, { name, email })` helper in `db/store.js` that owns lookup
(via the existing `getUserById`) and mutation, while the route owns
validation — same split responsibility POST already has with `createUser`.
No changes to the plan were needed before approving it; it matched the
existing code closely enough that there wasn't much to second-guess.

## Model choice

Built with Claude Code (Sonnet 5). The change was small and had a clear
existing pattern to copy (GET/:id for id parsing and 404 shape, POST for
validation and 400 shape), so a fast, capable model was sufficient — no need
for extended reasoning on a change this contained.

## Commit split

1. `feat: add PUT /users/:id endpoint to update a user` — `db/store.js`
   (`updateUser`) and `routes/users.js` (the route handler) together, since
   the two halves aren't independently useful and splitting them would leave
   `npm test` red at an intermediate commit.
2. `docs: add NOTES.md` — this write-up, added last since it summarizes the
   finished feature and review.

## Review

Self-reviewed the diff for the not-found path, 400/404 ordering, and
non-numeric ids. Non-numeric ids (e.g. `PUT /users/abc`) need no special
handling: `Number("abc")` is `NaN`, and `NaN === NaN` is `false` in the
`.find()` lookup, so it falls through to the existing 404 path exactly like
`GET /:id` already does. Validation order (400 before 404) matches POST's
own validate-then-act structure for consistency, though the given tests pass
either way. Nothing needed fixing — the implementation matched the plan.
