# Notes

**Plan:** The implemented route is `PUT /users/:id` in `routes/users.js`, backed by a new `updateUser` helper in `db/store.js`. I planned it in plan mode first and approved the plan as written, with no edits. The route checks the id (400), then validates the body (400), then looks up the user (404), then returns the updated user (200).

**Model:** Claude Sonnet 5.5 in Claude Code. It is efficient for a small, well-specified change like this one.

**Commit split:** I used two commits so each could be reviewed and reverted on its own. The first adds the endpoint (store helper and route), which is the behaviour the tests check. The second adds `NOTES.md`, which is documentation only. A third commit later tightened validation after the review.

**Review:** The review was not clean. It flagged six things, and I checked each against the running app:
- Real, fixed: validation was a truthiness check, so `{"name":123,"email":{"a":1}}` returned 200 and was stored. A shared `isValidUserInput` (non-empty strings, basic email shape) now guards both POST and PUT.
- Real, fixed: `PUT /users/abc` returned 404. It now returns 400 for a non-integer id.
- Reported as a crash, but already fine: a request with no body returned 400 even before the change, because Express 4 sets `req.body` to `{}`. I still added a `req.body || {}` guard before destructuring so the 400 doesn't depend on that behaviour.
- Left alone: in-place mutation in `updateUser` (fine for an in-memory store) and the GET id parsing, which is out of scope.
