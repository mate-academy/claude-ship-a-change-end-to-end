# Update User Endpoint Implementation

## Plan

Implemented a PUT /users/:id endpoint to update existing users with the following requirements:
- Add updateUser() helper to db/store.js for data access
- Add PUT /users/:id route handler with validation and error handling
- Return 400 if name or email fields are missing
- Return 404 if user doesn't exist
- Return 200 with updated user on success

## Model & Approach

Used Claude Haiku 4.5 for efficient endpoint implementation. Reviewed existing code patterns (GET /:id and POST routes) to ensure consistency in:
- ID parsing (Number conversion)
- Input validation (required field checks)
- Error responses (400/404/200 status codes)
- Response format (json with error messages)

## Implementation

**db/store.js:**
- Added `updateUser(id, { name, email })` function that finds the user by id, updates both fields in-place, and returns the updated user or null if not found

**routes/users.js:**
- Added PUT /:id route with validation for required fields
- Consistent error handling matching existing endpoint patterns

## Test Results

All endpoint tests passing (7/7):
- ✔ PUT /users/:id updates an existing user
- ✔ PUT /users/:id returns 404 for a user that does not exist
- ✔ PUT /users/:id with a missing field returns 400
- ✔ All existing endpoints still pass

## Review

Code review (low effort) found no runtime-correctness issues. Implementation:
- Follows existing patterns for validation and error handling
- Properly handles the not-found case
- Consistent status codes and response formats
- No missing guards or logic errors
