# NOTES

## Plan
Add `PUT /users/:id` following the existing pattern: the route in `routes/users.js` handles HTTP concerns (parsing the id, validation, status codes) and delegates data access to a new `updateUser` function in `db/store.js`.

## Choices
- **Full replace semantics:** PUT requires both `name` and `email`, mirroring the POST validation. A missing field returns 400.
- **Validation before lookup:** the body is checked first, so a malformed request gets 400 regardless of whether the id exists. Unknown ids with a valid body return 404.
- **Store returns `undefined` when not found**, matching `getUserById`; the route turns that into a 404.
- No new dependencies and no changes to the test files.

## Model
Claude Sonnet 5.5 via Claude Code. The change is small and the tests specify the behavior exactly, so a larger model wasn't needed.

## Commit split
1. `Add PUT /users/:id endpoint`: store function and route.
2. `Add NOTES.md`: this write-up.

## Review
I did not run a separate review pass. I checked the diff against the tests and the existing code style. Possible follow-ups: `id` is not validated as numeric (`NaN` simply yields 404), and email format is not checked, which POST doesn't do either.
