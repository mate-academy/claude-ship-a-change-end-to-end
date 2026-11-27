# NOTES — PUT /users/:id

## Plan
Add an "update a user" endpoint, following the existing route → store pattern:

1. `db/store.js`: new `updateUser(id, { name, email })`. It looks the user up with `getUserById`, changes that record in place (so later `GET` calls see the update), and returns it. It returns `undefined` when there's no such id, which is the same "not found" signal `getUserById` already gives.
2. `routes/users.js`: new `PUT /:id` handler. It validates the body, calls the store, and returns `404 { error: "User not found" }` when the store returns nothing, using the same body as `GET /:id`.

## Choices
- **PUT replaces the whole record.** Both `name` and `email` are required. Partial updates would be a `PATCH`, which is out of scope here.
- **Validation runs before the lookup.** The body check doesn't need the store, and a malformed request gets a 400 whatever the id is. A request has to be valid before it can learn whether an id exists.
- **What counts as invalid:** a missing field; a field that isn't a string; a field that is empty or only whitespace; an email without a basic `x@y.z` shape. Each case returns a 400 with a specific `error` message. Values are trimmed before they're saved.
- **Ids that aren't numbers** (e.g. `/users/abc`) become `NaN`, match no user, and get a 404. This is the same behaviour as `GET /:id`.
- `POST /users` validation is looser (it only checks that the fields are truthy). I left it alone to keep this change focused. Making it share the PUT validation would be a sensible follow-up.

## Model
Claude Opus 5.5 (Claude Code). It planned first in plan mode, then implemented.

## Commit split (suggested)
1. `store: add updateUser helper`
2. `users: add PUT /users/:id with validation and 404`
3. `docs: add NOTES.md`

## Review
Self-review checked these cases: ids that aren't numbers, values that are only whitespace, non-string values (e.g. `{ name: 123 }`), that the stored record is changed in place rather than replaced, and that the existing user tests still pass.
