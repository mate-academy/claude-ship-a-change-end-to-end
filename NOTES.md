# Implementation notes

## Plan

The approved plan was to add an `updateUser` data-access helper in `db/store.js`, then implement `PUT /users/:id` in `routes/users.js`. The route would validate `name` and `email`, return `400` for invalid input, call the store instead of accessing data directly, and return `404` when the requested user does not exist. I kept that plan unchanged because it covered the route, store boundary, and both required error paths.

## Model choice

I chose Sonnet because this was a small but real repository-level change where careful handling of validation and HTTP responses mattered. It offered a good balance of speed, cost, and implementation reliability without requiring the strongest model.

## Commit split

I split the work into logical commits: first the store helper, then the validated API route, and finally this implementation record. This keeps data access, HTTP behavior, and documentation independently reviewable and gives each commit a message that explains its purpose.

## Review

The self-review confirmed that missing users do not crash the handler, missing or non-string fields return a clear `400`, email input receives a basic validity check, and saved values are trimmed. It also confirmed that the provided update, not-found, and validation tests pass without modifying the grading tests.
