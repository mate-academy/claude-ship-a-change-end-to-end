# NOTES.md

## Context

The test suite `tests/update-user.test.js` was failing because:

- The `PUT /users/:id` route was missing from `routes/users.js`, so Express returned a `404` for all PUT requests instead of the expected `200` / `400` / `404` responses.
- The in-memory data store in `db/store.js` lacked an `updateUser` helper required to mutate an existing user.

## Plan

- Add an `updateUser(id, { name, email })` helper to the data store that finds a user by ID, applies the updates, and returns the updated user (or `undefined` if not found).
- Add a `PUT /users/:id` route that validates the required fields (`name` and `email` → `400` if missing), calls the store helper, and responds with `404` for a missing user or `200` with the updated user.

## Model Choice

Claude Sonnet 4.5 was used for both planning and implementation, as the task was straightforward and required minimal reasoning.

## Commit Split

1. `aefede8` — Add `updateUser` helper to in-memory store.
2. `7697c2f` — Add `PUT /users/:id` endpoint for updating users.

## Review

Ran the full test suite (`npm test`) after the implementation and confirmed that all 9 tests pass, including the user update success, not-found, and validation scenarios.

## Test Results

```
# tests 9
# pass 9
# fail 0
```
