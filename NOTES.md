# Notes

## Plan

The plan was to add `updateUser(id, { name, email })` to `db/store.js` following the same pattern as `createUser`, then wire up a `PUT /users/:id` route in `routes/users.js` following the same shape as the existing GET and POST routes. The plan needed no edits — the test file made the requirements explicit (200 on success, 404 for unknown id, 400 for missing fields).

## Model choice

Claude Sonnet 4.6. The task is straightforward CRUD with clear tests, so the fastest capable model was the right call — no need for extended reasoning.

## Commit split

Two commits: one for the store helper (`updateUser`) and one for the route (`PUT /users/:id`). Each commit is independently understandable and the store change is useful even without the route.

## What the review caught

The review confirmed the implementation was correct: validation runs before the store lookup (so a 400 is returned before attempting an update), and `updateUser` returns `null` on a miss so the route can return 404 cleanly. No issues found.
