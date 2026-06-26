# Notes

- Model: 'opusplan' (Opus for planning, Sonnet for execution)
- Review the plan:
    - Is the approach sound?
    - Are its assumptions right (tools, libraries, paths)?
    - Is anything missing?
- Commit messages: Could a reviewer understand what changed and why from the message alone, without opening the diff?
- Code review: look for bugs, edge cases, readability, anything risky, or anything missing

## Answers

1. The plan covered three changes: a `updateUser` helper in `db/store.js`, a `PUT /users/:id` route in `routes/users.js` with input validation (400) and not-found handling (404), and this NOTES.md. I approved the plan without edits — the file targets, edge cases, and ordering were all correct on the first pass.

2. I chose `opusplan` (Opus for planning, Sonnet for execution). Opus is better at reasoning through edge cases and writing a thorough plan; Sonnet is faster and more than capable for straightforward implementation once the plan is set. The split made the planning phase more careful without slowing down the build.

3. I split into three commits: (1) the store helper, (2) the route handler, (3) a post-review whitespace fix applied to both POST and PUT. The store came first because the route depends on it and each commit should leave the tree in a working state. The whitespace fix was a separate commit because it was a distinct improvement caught during review, not part of the original feature.

4. The review caught that `!name || !email` accepts whitespace-only strings like `"   "`, which would silently overwrite a user's name or email with blanks. I fixed it with an `isBlank` helper applied consistently to both POST and PUT. Two other findings — non-numeric ids returning 404 instead of 400, and missing store-layer validation — were intentionally left out of scope: the first is a pre-existing pattern not covered by tests, and the second is theoretical since the store is only reached through the validated route.

