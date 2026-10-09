# Notes

## The plan
I approved a plan with three parts: add an `updateUser` helper to `db/store.js`, add `PUT /users/:id` to `routes/users.js`, and write these notes. The route validates the body first (400), then looks the user up through the store (404), then returns the updated user (200). I didn't change the plan before approving it. It already covered the store, the route, and the not-found and invalid-input cases the tests expect.

## Model
I chose Sonnet. The change is small and well specified: the tests define the behaviour and the existing POST and GET routes show the pattern to follow. A faster model was enough, and I didn't need a heavier one for this.

## Commits
I made one commit per logical layer. The first adds the store helper, so it can be understood without the route. The second adds the endpoint and its validation, which turns the update-user tests green. The third adds these notes. Each commit message explains the change without needing the diff.

## Review
The review confirmed the main paths were fine. I ran extra cases against the real app: no body, a non-numeric id like `abc`, a blank or whitespace-only name, a non-string name, and a bad body sent to an unknown id. All returned the right status. Missing, blank, and non-string fields get a 400, and a non-numeric or unknown id gets a 404. A bad body sent to an unknown id returns 400, because validation runs before the lookup. One small thing I left alone: values are validated with `trim()` but stored as sent, so surrounding whitespace is kept.
