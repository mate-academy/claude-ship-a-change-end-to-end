# Notes

**Plan:** Task was fully spelled out, so I implemented directly: `updateUser` helper in `db/store.js`, plus a `PUT /:id` route mirroring the existing `POST /` (400 validation) and `GET /:id` (404) patterns. No changes from the initial approach.

**Model:** Claude Sonnet 5 — small CRUD endpoint following existing patterns, no need for anything heavier.

**Commits:** Store helper + route kept as one commit (neither works without the other). `CLAUDE.md` is a separate commit.

**Review:** Checked the non-numeric id case (`PUT /users/abc`) — `Number("abc")` is `NaN`, and strict `===` in `getUserById` correctly falls through to 404. Nothing needed fixing.
