# Implementation Notes

## Plan
I added an `updateUser` function to the in-memory store and implemented the `PUT /users/:id` endpoint. The endpoint validates the required `name` and `email` fields, returns 404 when the user does not exist, and returns the updated user when successful.

## Model choice
I used ChatGPT powered by GPT-6 as an alternative to Claude Code. It helped plan the implementation, write the code, and review the changes.

## Commit split
1. `Add user update functionality to the store` — added the updateUser function.
2. `Add PUT endpoint for updating users` — implemented the route and input validation.
3. `Document implementation decisions in NOTES.md` — documented the plan, model choice, commits, and review.

## Review
The review caught an input validation issue: checking trimmed values without negation would reject valid non-empty strings. I corrected the validation to reject non-string and blank values while accepting valid input. I also verified that the existing POST validation remained unchanged.

## Tests
All 9 tests pass, including the new PUT endpoint tests.
