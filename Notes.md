# Notes: Add PUT /users/:id (update user)

## Plan
Add a small, self-contained update endpoint that mirrors the existing GET/POST
patterns rather than introducing anything new. Concretely: add an `updateUser`
function to `db/store.js` that reuses `getUserById` to look up the record,
returns `undefined` when the id doesn't exist, and otherwise mutates and
returns the user — matching how `createUser` already behaves. Export it
alongside the other store functions. Then add a `PUT /:id` handler to
`routes/users.js`, placed after the existing POST handler, that validates
`name` and `email` the same way POST does (400 with `{ error: "name and
email are required" }` on missing fields), calls `store.updateUser`, and
returns 404 with the same `{ error: "User not found" }` shape used by the
existing GET/:id handler when the user isn't found. No new libraries or
dependencies were introduced — everything reuses patterns already present in
the codebase.

## Model used
Claude Sonnet 5 (model id `claude-sonnet-5`), via Claude Code.

## Commit split
Two commits: one for the `db/store.js` change (the `updateUser` function and
its export), and one for the `routes/users.js` change (the `PUT /:id` route
handler). This NOTES.md file rides along with both — it started life as part
of the store commit and was updated again alongside the route commit so its
description stays accurate as the work landed. Splitting store vs. route
keeps each commit reviewable independently — the store commit is pure
data-layer logic with no HTTP concerns, and the route commit is pure
request/response wiring that depends on the store function already existing.

## Self-review notes
- Confirmed the 400 validation check in the PUT handler runs *before* the
  store lookup/404 check, so a request with a missing `name` or `email`
  always gets a 400 even if the `:id` in the URL doesn't exist — this
  matches the order of checks a caller would expect (validate the request
  shape first, then check whether the resource exists).
- Confirmed the error response shape (`{ error: "..." }`) is identical to
  the shape already used by the GET/:id 404 and the POST 400, so API
  consumers see one consistent error format across all user routes rather
  than a new one-off shape for PUT.
- Confirmed `updateUser` returns `undefined` (not `null` or throwing) when
  the user isn't found, consistent with how `getUserById` already signals
  "not found" via `Array.prototype.find`, so the route handler's `if
  (!user)` check works the same way it does for GET/:id.
