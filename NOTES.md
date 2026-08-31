# Notes — Update a User endpoint

**Plan:** Add `PUT /users/:id` by following the two patterns already in
`routes/users.js` — the id lookup + 404 handling from `GET /users/:id`, and
the required-field validation from `POST /users` — and route the actual
mutation through a new `updateUser(id, { name, email })` helper in
`db/store.js`, so the route file never touches the `users` array directly,
same as the existing handlers. I didn't edit anything before approving.

**Model:** I chose the Sonnet model, for its solid balance between heavy thinking and speed.

**Commits:** One commit for the whole change (store helper + route +
NOTES.md). The store helper and the route aren't independently useful —
`updateUser` has no other caller, and the route can't do anything without
it — so splitting them into separate commits would just create a
mid-history state where the code doesn't do anything new yet. NOTES.md rides
along in the same commit since it documents that same change rather than a
separate concern.

**Review:** Confirmed as already fine: the 404 path doesn't crash on a
non-numeric id — `Number("abc")` is `NaN`, `getUserById` doesn't match, and
`updateUser` correctly returns `null` — because `updateUser` reuses
`getUserById` instead of re-implementing the search. Lint (`npx eslint`) was
clean and the full suite (`npm test`, 9 tests including the grading tests in
`tests/update-user.test.js`) passes with no regressions to the existing
`GET`/`POST` tests. Nothing needed fixing.
