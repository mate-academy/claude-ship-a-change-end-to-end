# Implementation Notes

## Plan
Added a PUT /users/:id endpoint to update existing users with the following features:
- Validates that both name and email fields are provided
- Returns 400 with a clear error message if validation fails
- Returns 404 if the user doesn't exist
- Returns the updated user object on success

## Model
Used Claude Haiku 4.5 for implementation.

## Implementation Approach
1. Added `updateUser(id, { name, email })` function to db/store.js that updates a user by ID and returns the updated user or null if not found
2. Added PUT /users/:id route handler that validates input, checks for user existence, and calls the store function
3. Followed existing patterns from the GET /:id and POST / endpoints for consistency

## Changes Made
- **routes/users.js**: Added PUT endpoint with validation and error handling
- **db/store.js**: Added updateUser function that modifies user fields and returns the updated user

All tests now pass.
