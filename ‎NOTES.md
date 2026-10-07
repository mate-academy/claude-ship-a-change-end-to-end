# Ship a Change: Update User Endpoint

## Plan
The plan identified three files to touch: `db/store.js` (add updateUser helper), `routes/users.js` (add PUT /users/:id route), and create NOTES.md. The plan was approved as-is without edits. It correctly specified that validation (400 on missing fields) should run before the database lookup (404 for unknown users), matching the test expectations.

## Model
Claude Sonnet 5.5 was chosen for this task. The change is small and well-specified: a straightforward CRUD operation following existing patterns in the codebase. Sonnet's speed and capability are well-matched to this scope — no need for a larger model, and the feature was completed efficiently.

## Commit Split
Three logical commits:
1. **Add updateUser to store** — The data layer helper, isolated from the route logic.
2. **Add PUT /users/:id route** — The API endpoint with validation and error handling, once the store method exists.
3. **Add NOTES.md** — The project documentation, committed last once the actual work was verified.

This split keeps each commit focused on a single responsibility and makes the feature easy to review.

## Review
Pre-push review confirmed: all 9 tests pass (7 existing + 2 update-user endpoint tests, plus NOTES.md presence and content). The diff touches only the three intended files. Validation order (400 before 404) matches the test expectations. The error messages ("name and email are required", "User not found") are consistent with existing routes. No edge cases or gaps identified.
