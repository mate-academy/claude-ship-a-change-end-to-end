# Ship a Change - Implementation Notes

## Plan
The plan was to add a PUT endpoint for updating users. The implementation required two changes:
1. Add an `updateUser` function to `db/store.js` that finds a user by ID and updates their name and email
2. Add a PUT route to `routes/users.js` that validates input (both name and email required), handles the not-found case (404), and returns the updated user (200)

I did not need to edit the plan — it was clear and complete.

## Model Choice
I used Claude Haiku (haiku-4.5-20251001) because this is a small, straightforward feature with clear requirements from the tests. The task involves following an existing pattern (similar to POST endpoint) and the logic is simple enough that a faster model is efficient here.

## Commit Split
I made one commit containing both file changes:
- `db/store.js`: Added the `updateUser` function
- `routes/users.js`: Added the PUT endpoint with validation

This is one logical change (adding the update user feature) and fits together naturally — the route needs the store function, so splitting them would create a temporarily broken state.

## Review Findings
The implementation correctly handles all three test cases:
- ✅ Updates an existing user and returns 200 with the updated data
- ✅ Returns 404 when the user doesn't exist
- ✅ Returns 400 when required fields are missing

The validation logic mirrors the POST endpoint, ensuring consistency. No issues found.
