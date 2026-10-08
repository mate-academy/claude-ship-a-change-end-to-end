# NOTES.md

## Plan Approved
The plan was to add a `PUT /users/:id` endpoint in `routes/users.js` that:
1. Validates `name` and `email` are present in the request body (400 if missing)
2. Calls `store.updateUser(id, { name, email })` to perform the update
3. Returns 404 if the user doesn't exist, otherwise returns the updated user (200)
4. Adds the corresponding `updateUser` function to `db/store.js` that finds the user by ID, updates the fields, and returns the updated user (or `null` if not found)

I did not edit the plan before approving — it matched the test expectations exactly.

## Model Choice
I used **Claude Sonnet 4** (the default model for this session). It was chosen because:
- The task is a straightforward Express route implementation with clear requirements
- Sonnet provides good code quality for simple CRUD endpoints without needing Opus's deeper reasoning
- Fast iteration was preferred for this small, well-scoped feature

## Commit Split
I split the work into **two logical commits**:

1. **`db/store.js`: add updateUser helper** — Isolates the data-layer change. This makes the store independently testable and follows the existing pattern (getAllUsers, getUserById, createUser).

2. **`routes/users.js`: add PUT /users/:id endpoint`** — Adds the HTTP route that validates input, calls the store, and handles 404/400 responses. Keeping the route separate from the store change lets reviewers see the API contract change distinctly from the data logic.

Each commit message describes *what* and *why* without needing to open the diff.

## Review Findings
I asked Claude to review the changes before committing. The review:
- **Confirmed** the validation logic matches the existing POST `/users` pattern (consistent 400 message)
- **Confirmed** the 404 response format matches GET `/users/:id` (consistent error shape)
- **Caught** a potential issue: the `updateUser` function mutates the existing user object in place. This is fine for this in-memory store but would need consideration if swapping to a real DB (where you'd typically return a new object). Noted in the code with a comment.
- **Confirmed** all test cases are covered: happy path, missing user, missing field

No blocking issues found — the implementation is clean and consistent with the codebase patterns.