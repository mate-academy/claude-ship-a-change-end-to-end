# Notes: update-a-user endpoint

## Plan
Added `PUT /users/:id` following the existing GET/POST conventions in
`routes/users.js`: validate the request body first (`name` and `email` are
both required, mirroring the POST handler's check), then look up the user
through a new `updateUser` helper in `db/store.js`. If the user isn't found,
return 404 with the same `{ error: "User not found" }` shape the GET handler
already uses; otherwise respond with the updated user as JSON.

## Model choice
Implemented with Claude Sonnet 5 via Claude Code, using plan mode to explore
the repo conventions and pin down the exact test contract before writing any
code.

## Commit split
Changes are grouped by concern: one commit adds `updateUser` to the data
store, a second adds the `PUT /:id` route handler, and a third adds this
NOTES.md write-up.

## Review findings
Self-review confirmed the validation order (400 before 404) matches the
existing POST handler and satisfies the test that sends a partial body
against a valid existing id. Confirmed `updateUser` mutates the found object
in place rather than replacing it, keeping it consistent with how
`getAllUsers`/`getUserById` hand out live references elsewhere in the file.
Ran `npm test` and `npm run lint` to confirm no regressions.
