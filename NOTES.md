# Notes

**Plan.** I read `tests/update-user.test.js`, `routes/users.js` and `db/store.js`
first, then planned two changes: a `store.updateUser(id, fields)` helper that
returns `undefined` for an unknown id, and a `PUT /users/:id` route that
validates input, calls the helper, and maps `undefined` to a 404. I did not use
Claude Code's formal plan mode; the plan was worked out inline before editing,
so there was nothing to edit before approving.

**Model.** Claude Sonnet 5.5. The feature is small and the pattern already
exists in the repo, so a fast, capable model was enough.

**Commits.** Two commits, one logical change each: (1) the store helper, so data
access exists on its own; (2) the route, which depends on it. `NOTES.md` is a
third commit because it is documentation, not behaviour.

**Review.** I exercised the endpoint with edge cases beyond the provided tests.
Invalid email, blank or non-string name, and a missing body all return 400.
Non-numeric and fractional ids return 404 instead of crashing. Name and email
are trimmed before saving. All were already fine. One thing I left alone:
`POST /users` only checks that fields are truthy, so it is looser than `PUT`.
Tightening it is outside this change.
