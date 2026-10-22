# Notes

## Plan
The plan covered two files: add `updateUser(id, { name, email })` to `db/store.js`, and add `router.put("/:id", ...)` to `routes/users.js`. The route validates name and email first (400, same message as POST), then looks the user up (404, same message as GET), then returns the updated user. I did not edit the plan before implementation. When the plan was presented for approval I declined that prompt and told Claude to go ahead and implement it as written.

## Model
This session ran on Claude Sonnet 5.5 (`claude-sonnet-5-5`). The task is small and well specified: two files, three existing tests, and an existing POST/GET pattern to copy. A mid-sized model fits that. *(Add your own reason here if it differs.)*

## Commits
Two commits, one logical change each, with `npm test` run after each:
1. `66b07c6` adds the store helper. The route tests still failed afterwards, which showed the helper alone doesn't change behaviour.
2. `ef40c7d` adds the PUT route with its validation and 404 handling, after which all 9 tests passed.

Splitting this way keeps each commit revertable on its own and puts the data layer and the HTTP layer in separate commits.

## Review
Confirmed fine: unknown ids return 404; a request with missing fields returns 400 before anything is modified, so there are no partial updates; non-numeric ids like `abc` return 404; a body `id` can't change a user's id; the endpoint matches the existing POST and GET conventions.

Caught as weak spots, not fixed yet:
- Any truthy value is accepted as name or email, including numbers and objects.
- Whitespace-only strings are accepted.
- `Number()` accepts `1.0` and `0x2` as ids.
- Validation runs before the existence check, so `PUT /users/9999` with an empty body returns 400, not 404.
- The tests don't cover any of these.
