# Notes

## Plan

The approved plan adds an `updateUser` helper to `db/store.js` and a `PUT /users/:id` route that validates input (400), returns 404 for an unknown id, and returns the updated user (200). Before approving, I added a setup step (branch, `npm install`, model choice), trimmed whitespace in validation, kept an `@` check on email (stricter than `POST /users`, noted in the PR), and moved the self-review before writing these notes.

## Model

I used Sonnet for planning, since the task is small and doesn't need a heavier model to reason about it. For the implementation I used Haiku, because by then the plan was detailed and the work was only a matter of following its instructions.

## Commits

The work is split into three commits: `Add updateUser helper to the in-memory store`, then `Add PUT /users/:id with validation and 404 handling`, then `Add NOTES.md describing plan, model, commits and review`. The helper is a data-layer change that stands on its own, and the route builds on it, so each can be reviewed or reverted separately; one code commit would also have worked for a change this small, but two keep the layers clear. The notes come last, in their own commit, because they describe the self-review and are not part of the code.

## Review

The review confirmed the code is fine: `updateUser` follows the store's pattern, the route returns 404 for an unknown or non-numeric id without crashing, and validation rejects missing, non-string, empty and `@`-less values before the lookup. All tests pass and lint is clean. What remained was finishing and committing these notes, then pushing the branch and opening the PR, with a note in its description that PUT validation is stricter than POST. Tests for those extra rules (whitespace-only input, missing `@`) are out of scope for this change and could go in a separate test file later.
