# Ship a Change End to End — Notes

## Plan

The plan for this change was straightforward: add a PUT /users/:id endpoint that updates an existing user, with proper validation and not-found handling. The planned approach involved:
1. Adding an `updateUser` helper function to `db/store.js` that looks up a user, updates name/email fields, and returns null if the user doesn't exist.
2. Adding a new PUT route to `routes/users.js` that validates input (name and email required), calls the store helper, and returns appropriate HTTP status codes (200 on success, 400 for missing fields, 404 for nonexistent users).
3. Following existing code patterns for consistency with the rest of the codebase.

No changes were made to the approved plan — it was clear and detailed enough to execute as-is.

## Model Choice

Used Claude Haiku 4.5 for this work. Haiku was appropriate because the task is well-defined and small in scope: a single endpoint that follows existing patterns, with clear test requirements already written. No complex architectural decisions or novel problem-solving was needed, so Haiku's speed and efficiency were well-suited. The tests passing on the first implementation attempt confirmed this was the right model choice for this scope.

## Commit Split

Split the work into three logical commits:

1. **Add updateUser helper to store** — The database access layer change, in isolation. This is the core data operation that the route will use. Committing this separately makes it easy to review the data mutation logic independently.

2. **Add PUT /users/:id route** — The HTTP endpoint and its validation/error-handling logic. This depends on commit 1 but is conceptually separate (HTTP routing vs. data access). Splitting them makes each commit reviewable on its own.

3. **Add NOTES.md write-up** — The documentation of the work, committed last after the implementation and review were complete. This allows the write-up to accurately describe what was actually done rather than what was planned.

This approach makes the git history clear: reviewers can see the data logic, then the route logic, then the explanation. Each commit does one logical thing.

## Review Findings

Self-review focused on the three test scenarios:

- **Not-found case**: Verified that invalid or missing user IDs (e.g., "abc" coerced to NaN, or id 9999) are properly handled. The store's `getUserById` returns undefined, `updateUser` checks and returns null, and the route responds with 404. No crashes, no silent failures.

- **Validation case**: Confirmed that the route validates both `name` and `email` using the same falsy-check pattern as the existing `POST /users` route. Empty strings, missing keys, and null values all correctly trigger a 400 response.

- **Success case**: Verified that a valid update returns 200 with the full updated user object, matching the response format of `POST /users`.

Additional notes:
- The in-memory store mutates the user object in place (`user.name = name`, `user.email = email`), which is consistent with the existing store design and acceptable for this assignment.
- Error messages match the existing pattern ("name and email are required" for validation, "User not found" for missing users).
- ID parsing matches the existing GET /:id approach (coerce to Number), so behavior is consistent across the codebase.

No issues were found. All three update-user tests pass, and the code follows the established patterns in the codebase.
