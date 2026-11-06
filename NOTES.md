# Notes

## Plan
Added `PUT /users/:id`. I explored `routes/users.js`, `db/store.js` and `tests/update-user.test.js` first, then wrote a plan: add an `updateUser` helper to the store, add a route that validates input, returns 404 for unknown users, and calls the store.

## Model choice
Sonnet 5.5. The change is small and follows existing patterns, so a faster, cheaper model fits.

## Commit split
1. `store: add updateUser`
2. `users: add PUT /users/:id with validation`
3. `docs: add NOTES.md`
4. A follow-up commit for the review fixes below.

## What review caught
I reviewed the change after the first three commits by probing the endpoint with edge cases. It found:
- **Loose id parsing:** `Number()` accepted `0x1` and `1.0` as user 1, on GET and PUT alike. Ids are now parsed strictly (digits only).
- **POST and PUT disagreed:** PUT trimmed and rejected non-strings, but POST stored `" x "` untrimmed and accepted `name: 123`. Both now share one validator.
- **Malformed JSON:** a bad body gave an empty 400 and a stack trace in the console. A small error middleware now returns a clear 400.
- **NOTES.md itself:** the first version listed design decisions as review findings. This section replaces it.

## Not done
- No new tests: the test files were off-limits for this change, so the edge cases above were checked by hand.
- No email format or duplicate-email checks.
