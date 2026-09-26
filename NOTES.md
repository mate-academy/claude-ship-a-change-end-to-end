# Notes: PUT /users/:id

## Plan
I read `tests/update-user.test.js`, `routes/users.js` and `db/store.js` first, then wrote a plan in plan mode. It had two changes:

- `db/store.js`: add `updateUser(id, { name, email })`. It looks the user up with `getUserById`, changes it in place, and returns `undefined` if it isn't found.
- `routes/users.js`: add `PUT /:id`. It returns 400 if `name` or `email` is missing (same check and message as POST), then 404 if the user doesn't exist (same response as GET `/:id`), then the updated user.

The plan checked validation before the lookup. The provided tests pass with either order, and validation first matches POST. It also assumed `server.js` already had `express.json()`, and that turned out to be true.

I approved the plan as written. I didn't ask for any edits or answer any clarifying questions beforehand. The implementation matched the approved plan exactly.

## Model
This session ran on Claude Sonnet 5 (`claude-sonnet-5`). I don't have a record of why that model was selected, so I can't give a reason beyond that it was the model this session was configured with. The task was small (two known files, a spec in the tests), so nothing here needed a different model.

## Commits
There are two commits on the branch `add-put-users-endpoint`, which I branched off `main`:

1. `Add PUT /users/:id endpoint` (`14bb010`) contains `updateUser` and the route. This is the feature the tests specify, and it turns the three provided tests green.
2. `Validate user input with a shared helper` (`f9ef071`) contains `parseUserInput` (used by POST and PUT) and `tests/user-validation.test.js`.

I split them this way because the second commit came out of the review and goes beyond the original task. It also changes POST's behaviour, so it should be reviewable and revertable on its own without touching the endpoint.

## Review
I reviewed the change by running 13 edge-case requests against PUT. I found no bugs in the endpoint itself. Not-found handling worked for ids like `9999`, `0`, `-1`, `abc` and `1.5`, and an `id` sent in the body was ignored.

What the review caught:

- **Weak validation.** `!name || !email` only checks truthiness, so numbers, arrays, objects and whitespace-only strings were accepted and stored. POST had the same gap. I fixed it in the second commit by requiring non-empty strings after `trim()` and storing the trimmed values.
- **Not fixed:** there is still no email format check, so `"not-an-email"` is accepted. Malformed JSON gets Express's default HTML error page, because `server.js` has no error-handling middleware. Ids like `1e0` and `%201` resolve to user 1 because `Number()` is lenient, and GET behaves the same way.
- **Checked and left as is:** validation runs before the lookup, so a partial body with an unknown id returns 400, not 404.

## Test status
The three PUT tests and the edge-case tests pass, and lint is clean. Before this file existed, `npm test` failed only on `tests/notes.test.js`, which checks for this file.
