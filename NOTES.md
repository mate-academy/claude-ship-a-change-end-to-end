# Implementation Notes

## Plan
Implemented PUT /users/:id endpoint to update existing users. The implementation required two changes:
1. Added `updateUser(id, { name, email })` function to `db/store.js` that finds and mutates the user in-memory
2. Added PUT /:id route handler to `routes/users.js` with validation and error handling

## Model Choice
Used Claude Sonnet 5 and Haiku 4.5 for rapid, accurate planning and implementation within existing project conventions.

## Commit Strategy
Single coherent commit: both `db/store.js` and `routes/users.js` changes form one logical feature (PUT endpoint) and should ship together.

## Review Findings
Code review verified:
- All three new tests pass (200 on update, 404 on not-found, 400 on validation failure)
- No regressions in existing GET/POST tests
- Follows established patterns: named exports, validation-before-existence check order, consistent error response shape
- ESLint passes with no warnings
