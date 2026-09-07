# Choices made

- Chose to write the plan in details with testing of the test steps
- Chose Sonnet 5 on Medium for the execution an chaned to palning mode first accepting a written plan and making som ajustments in details about how to respon on errors, before accepting

# Plan Notes: Add PUT /users/:id (update user)

## Plan

1. **Run `npm test` first** to see the suite fail/error because there was no
   PUT support yet (`update-user.test.js` existed as the target spec, but the
   route and store function it needed didn't exist). This also surfaced that
   `node_modules` wasn't installed, so `npm install` was needed before the
   real failures were visible.

2. **Add `updateUser(id, { name, email })` to `db/store.js`**, following the
   existing store pattern (`getUserById`, `createUser`):
   - Look up the user with the existing `getUserById` helper.
   - If no user matches — including a nonexistent id, a non-numeric id
     (`Number("abc")` → `NaN`), or a negative id — return `undefined` instead
     of throwing. The store never crashes; it just signals "no such user."
   - If found, mutate `name` and `email` in place and return the updated
     user object.

3. **Add `router.put("/:id", ...)` to `routes/users.js`**, following the
   existing route patterns (GET by id, POST create):
   - Validate that `name` and `email` are both present, reusing the same
     inline truthy check as POST → `400 { error: "name and email are
     required" }` if either is missing. This check runs before the lookup,
     so a missing field on an *existing* id still returns 400, not 404.
   - Parse `id` with `Number(req.params.id)` and call
     `store.updateUser(id, { name, email })`.
   - If the store returns falsy (not found, bad id, or any other edge case)
     → `404 { error: "User not found" }`, matching the shape already used by
     `GET /users/:id`. This is the "sensible not found" response — the
     endpoint never crashes or 500s on an unexpected/invalid id.
   - Otherwise → `200` with the updated user JSON.

4. **Run `npm test` until green.** Confirmed `users.test.js` and
   `update-user.test.js` pass (7/9 total tests). The remaining 2 failures are
   the pre-existing `notes.test.js` checks for this very file, unrelated to
   the endpoint work.

5. **Manual verification** with a running server and `curl`, covering the
   crash-avoidance requirement explicitly:
   - `PUT /users/9999` (valid but nonexistent id) → `404`
   - `PUT /users/abc` (non-numeric id → `NaN`) → `404`
   - `PUT /users/-1` (negative id) → `404`
   - `PUT /users/1` with a full body (existing id) → `200` with updated user

## Model choice

Used the existing in-memory `db/store.js` pattern rather than introducing a
database, ORM, or new validation library — the codebase has no persistence
layer or validation utilities, so the smallest consistent change was to add
one function (`updateUser`) and one route (`PUT /:id`) that mirror the
conventions already used by `getUserById`/`createUser` and their routes.

## Commit split

Changes were kept to the two files that needed to change for this feature:
- `db/store.js` — new `updateUser` function.
- `routes/users.js` — new `PUT /:id` route.

No unrelated files, refactors, or abstractions were introduced.

## Review

- Verified the "not found" path can't crash the server by testing invalid
  inputs (non-numeric id, negative id, nonexistent id) against a live
  server — all return a clean `404` rather than an exception or `500`.
- Verified the 400-vs-404 precedence: validation of the request body runs
  before the existence check, so a malformed request to a real user id still
  gets `400`, not `404`, matching the grading test's expectations.
- Left `tests/update-user.test.js` and `tests/notes.test.js` untouched, since
  the task was scoped to implementing the endpoint, not modifying the
  grading tests.
