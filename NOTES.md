# Notes: update-user endpoint

## The plan I approved
I ran `npm test` first to see the target: the update-user tests failed with 404
because no `PUT /users/:id` route existed. Then I planned in plan mode, after
reading `routes/users.js`, `db/store.js` and `server.js`. The plan had three
parts: add an `updateUser(id, { name, email })` helper to `db/store.js`
(returning `undefined` for an unknown id, like `getUserById`), add the `PUT`
route in `routes/users.js` (validate, then update, then 400/404/200), and write
this file. I approved it without editing it. One thing the plan called out: the
"404 for unknown user" test already passed by accident, because any `PUT` got a
404 before the route existed, so it had to keep passing for the right reason.

## Model choice
The plan was written with Opus 5.5 in plan mode, and the implementation and
commits were done with Sonnet 5.5. The change is small (about 35 lines in two
files), so the main work was getting the plan and the edge cases right rather
than writing a lot of code.

## How I split the commits
1. `Add updateUser helper to the in-memory store` — the data-access change on
   its own, so the route could build on it.
2. `Add PUT /users/:id endpoint with validation and 404 handling` — the route,
   which turned the three update-user tests green.
3. `Tighten email validation on PUT /users/:id` — a separate fix from the
   self-review, kept apart so it is visible as a review finding rather than
   hidden in the first version of the route.
4. This `NOTES.md`.

Each commit does one thing and its message says what and why.

## What the review caught
- **Fixed:** the first email check only required an `@`, so `"@"` was accepted
  and stored. It now needs text before the `@`, a dotted domain after it, and
  no whitespace (commit 3).
- **Confirmed fine:** valid update returns 200 with trimmed values; missing,
  blank or non-string `name`/`email` return 400; an unknown or non-numeric id
  (`abc`) returns 404 instead of crashing; a missing request body returns 400.
- **Left alone on purpose:** ids like `1e0` or `0x2` resolve to real users
  because `Number()` accepts them. `GET /users/:id` behaves the same way, so
  changing only `PUT` would make the two inconsistent. Duplicate emails are not
  rejected, matching `POST`. The body is validated before the lookup, so an
  unknown id with a bad body returns 400, not 404.
- **Not covered by tests:** the provided test file can't be edited, so the
  edge cases above were checked by hand with a throwaway script, not committed
  tests.
