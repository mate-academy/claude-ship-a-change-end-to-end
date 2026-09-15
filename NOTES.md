# Implementation Notes: PUT /users/:id

## Plan

The approved plan called for implementing a PUT /users/:id endpoint to update users, with validation and proper 404/400 error handling. The plan was approved as-is with no edits; it covered exactly what was needed: adding `updateUser` to the store, the PUT route with stricter validation (non-empty strings, not just truthy values), and JSON error-handling middleware for malformed request bodies.

## Model Choice

Claude Haiku 4.5 was selected for this task. The project is a small, well-scoped feature (a single endpoint on a 36-line router backed by a 27-line in-memory store) with clear test specs and established conventions to match. Haiku's speed and efficiency suited the straightforward implementation without requiring the extended reasoning of larger models.

## Commit Structure

Three commits were made before NOTES.md:

1. **Add updateUser to the in-memory store** — Added the `updateUser(id, { name, email })` function to `db/store.js`, following the existing pattern of `createUser`. It mutates the user in place and returns null on missing id, decoupling the existence check from the caller.

2. **Add PUT /users/:id to update a user** — Added the route handler with a helper function `isNonEmptyString` to validate that name and email are actual non-empty strings, not just truthy values (stricter than POST, matching the README's "missing or invalid" language). Validates first, then calls the store, then checks for 404.

3. **Return JSON for malformed request bodies** — Added error-handling middleware in `server.js` to catch express.json() parse failures and respond with consistent JSON errors instead of HTML, preventing HTML error pages from leaking through the API on any endpoint.

The split follows the principle of one logical change per commit: store layer, route layer, cross-cutting concern.

## Review Findings

A code review was conducted after implementation. Key checks:

- **Test coverage**: All three update-user test cases pass (update succeeds, 404 for unknown id, 400 for missing/invalid field).
- **Validation robustness**: The stricter `isNonEmptyString` check correctly rejects numeric names (e.g., `{ name: 123 }`), whitespace-only names (e.g., `{ name: "  " }`), and missing fields with a 400 error, matching the test's expectations and the README's requirement.
- **Not-found path**: Returns 404 with the correct error body `{ error: "User not found" }`, matching existing convention.
- **Edge case — non-numeric id**: `PUT /users/abc` with a valid body correctly returns 404 because `Number("abc")` → `NaN`, and `NaN` never matches a stored id, so the update falls through to the 404 path without extra handling.
- **JSON error handling**: Malformed bodies (e.g., `{bad`) now return clean JSON instead of HTML, a pre-existing bug now fixed across all endpoints.
- **Lint and regression**: `npm run lint` passes; all existing tests (GET/POST/health) remain green.
- **Error message consistency**: The 400 response body matches POST's existing message, and the 404 matches GET's — no new error shapes introduced.

No issues were found. The implementation is correct, follows conventions, and handles all documented edge cases.
