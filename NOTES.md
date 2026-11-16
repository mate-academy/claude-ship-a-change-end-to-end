# NOTES — PUT /users/:id

## The plan
I wrote the plan in plan mode after reading `tests/update-user.test.js`, `routes/users.js` and `db/store.js`. It had two changes:
- Add an `updateUser(id, { name, email })` helper to `db/store.js`. It reuses `getUserById` and returns `undefined` for an unknown id.
- Add a `PUT /users/:id` route that does three things in order. First it validates the body: `name` and `email` must be non-empty strings, otherwise 400. Then it calls the store and returns 404 if no user was found. Otherwise it returns 200 with the updated user.

It also set out the commit split, explained why validation runs before the lookup, and left `NOTES.md` out of the build steps. I approved the plan as written, without edits.

## Model
I used Claude Opus 5.5. The feature is small, so a faster model could probably have done the coding. I wanted the stronger model for planning and especially for the review step, where catching edge cases mattered more than speed.

## Commits
1. **Add updateUser helper to in-memory store**: the data-access change on its own, following the existing store pattern.
2. **Add PUT /users/:id endpoint with validation and 404**: the route. After this commit the update-user tests turned green.
3. **Reject malformed email addresses in PUT /users/:id**: a fix found during review, kept separate so it's visible as a review outcome.
4. **Add NOTES.md**: this write-up.

I split the store helper from the route so each commit makes sense on its own and could be reverted on its own. The store commit doesn't break anything; it just adds an unused function.

## What the review caught
I checked the diff and ran the endpoint directly against these cases: no body, a whitespace-only name, a numeric name, a non-numeric id, an `id` in the body, padded values, a malformed email, and malformed JSON.
- **Fixed:** any non-empty string was accepted as an email (`"not-an-email"` → 200). The README asks for invalid fields to be rejected, so I added a basic `x@y.z` shape check that returns 400.
- **Confirmed fine:** a missing body or blank/non-string fields → 400. A non-numeric id (`/users/abc`) → 404, no crash. An `id` in the body is ignored, so a user's id can't be changed. Values are trimmed before saving.
- **Left alone (out of scope):** `POST /users` still has the looser validation (no type or email check). Malformed JSON gets Express's default HTML 400 response, which affects every route. There is no email uniqueness check, matching the existing create endpoint.
