This project is to add an 'update a user' endpoint to the users resource. It should:

- update an existing user by id (PUT /user/:id)
- validate the input, rejecting missing or invalid fields with a clear error
- return a sensible "not found" response when the user doesn't exist, rather than crashing
- go through db/store.js for data access, following the existing pattern.

The tests under tests folder need to be all pass:

- notes.test.js
- update-user.test.js
- usrs.test.js

Use model: Sonnet 5.5

## Write-up

**Plan:** add `updateUser` to `db/store.js` (reusing `getUserById`, returning `undefined` when missing), then `PUT /users/:id` in `routes/users.js` that validates first (400), then looks up (404), then returns the updated user (200).

**Model:** Sonnet 5.5 — the change is small and follows existing patterns, so a mid-size model was enough.

**Commit split:** (1) store helper, (2) route with validation and 404, (3) this write-up.

**Review:** validation runs before the lookup so a bad body gets 400 even for unknown ids; `req.body` is guarded against being undefined; name/email are trimmed and email gets a basic shape check. All 9 tests and lint pass.

What was in the plan you approved, and did you edit anything before approving?

- The plan is described in NOTES.md
- I did not edit anything before approving

Which model did you choose, and why?

- Sonnet 5.5
- The reason is that this model is good enough for this task

How did you split your commits, and why that way?

- (1) store helper, (2) route with validation and 404, (3) this write-up.

What did your review catch — or confirm was already fine?

- My review all look good and confirm was already fine.
- I run the npm test and confirm that all tests are green now
