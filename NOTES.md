# Notes: update-a-user endpoint

## The plan
The plan added `PUT /users/:id` in two parts:
- **Store:** a new `updateUser(id, { name, email })` helper in `db/store.js`.
- **Route:** a new handler in `routes/users.js` that follows the existing routes. It checks that `name` and `email` are both non-empty strings and returns 400 if not. It returns 404 for an unknown id and 200 with the updated user otherwise.

Before approving, I edited the plan to remove the step that wrote this `NOTES.md`, so that the first pass stayed focused on the endpoint. I'm writing it now as a separate step.

## Model
I used Claude Opus 5.5 for planning and implementation.

## Commits
The work is in two commits:
1. `Add updateUser helper to the in-memory store`
2. `Add PUT /users/:id endpoint with validation and 404 handling`

The data-access change and the HTTP change are separate. Each commit makes sense on its own, and the codebase works after either one. The route depends on the helper, so the helper comes first. This NOTES.md is its own commit.

## Review
The update-user tests cover 200, 404 and 400, and all three pass. Reading the diff, the following were already fine:
- A non-numeric id, like `/users/abc`, becomes `NaN` and returns 404 instead of crashing.
- The 400 check runs before the store lookup, so an invalid request never changes data.
- Extra fields in the request body are ignored. Only `name` and `email` are saved, so a client can't overwrite `id`.

Two minor points I left as they are:
- `name` and `email` are validated after trimming, but saved without trimming.
- There's no email format check. POST doesn't have one either, so the two routes stay consistent.
