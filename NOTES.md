# Course Project Notes

## Plan
The task required making all test cases pass, specifically the PUT /users/:id endpoint tests that were failing. The implementation strategy:
1. Install npm dependencies (supertest was missing)
2. Analyze test expectations in update-user.test.js
3. Add an `updateUser()` function to the store layer for data mutation
4. Implement the PUT route with validation (name and email required)
5. Create NOTES.md documentation

## Model Choice
Used Claude Sonnet 5 during planning phase to design the implementation approach and understand the test requirements. Switched to Claude Haiku 4.5 for efficient code execution and PR workflow (creating branch, pushing, opening PR). Model selection prioritized task clarity (Sonnet 5) followed by execution speed (Haiku 4.5).

## Commit Split
Single consolidated commit with three file changes:
1. **db/store.js** — Added `updateUser(id, { name, email })` function that mutates user data in-place and returns the updated user or null
2. **routes/users.js** — Added PUT /users/:id route with input validation (400 if fields missing) and existence check (404 if user not found)
3. **NOTES.md** — Project documentation

Kept as one commit because the store function and route handler are tightly coupled and meaningless separately.

## Code Review
**What the tests revealed:** Three PUT endpoint tests were failing—the route didn't exist. Test expectations:
- Return 200 with updated user data when valid name and email are provided
- Return 404 when the user ID doesn't exist
- Return 400 when required fields are missing

**Implementation design choices:**
- Validation happens in the route layer (consistent with POST /users pattern)
- Store function mutates the existing user object rather than creating a copy (matches existing createUser behavior)
- Error responses match the same format as other endpoints ({ error: "..." })

**Test outcomes:** All 9 tests now pass—including the 3 new PUT tests, 2 notes validation tests, and 4 existing GET/POST tests.
