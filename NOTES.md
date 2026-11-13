# NOTES — Update a user (PUT /users/:id)

## The plan

Before writing any code, Claude read the routes, `db/store.js`, and the provided tests, then posted a plan:

1. Add `updateUser(id, { name, email })` to `db/store.js`. It returns the updated user, or `null` for an unknown id, so the route can answer 404 instead of crashing.
2. Add `PUT /users/:id` in `routes/users.js`. It returns 404 for an unknown id (non-numeric ids are treated the same way, matching GET), 400 with a field-specific message when `name`/`email` is missing, not a string, blank, or not email-shaped, and 200 with the updated user otherwise. Only `name` and `email` are copied from the body, so a client can't overwrite the `id`.
3. Leave POST and the provided test files untouched, so the change stays small.

The plan covered the three cases the tests expect (200, 404, 400), so I didn't edit it before approving. The one judgment call was order: the route checks "does the user exist?" before validating the body, so an unknown id always gets a 404 whatever the body says.

## Model

Claude Opus 5.5. The feature is small, so a faster model would also have managed it. I wanted the strongest reasoning for the planning and self-review steps, where catching an edge case matters more than speed.

## Commits

Three commits, one logical change each:

1. **Store helper** (`db/store.js`) — the data-access layer change. It stands on its own and breaks nothing.
2. **Route** (`routes/users.js`) — the endpoint, validation, and 404. This commit turns the update-user tests green.
3. **NOTES.md** — the write-up.

Splitting along the store/route line mirrors how the app is layered, so each commit message makes sense without opening the diff, and a reviewer can check the data layer separately from the HTTP behaviour.

## What the review caught / confirmed

Before pushing, the diff was reviewed for bugs, edge cases, the not-found path, and validation. It was also tested by hand beyond the provided tests:

- `PUT /users/abc` → 404 (not a crash or a 500)
- blank name `"  "` → 400; `name: 5` → 400; `email: "nope"` → 400
- non-JSON body → 400 "name is required" (Express leaves `req.body` empty, and the validator handles that)
- extra `id: 99` in the body is ignored; values are trimmed

It confirmed the not-found and validation paths were already correct, and `npm run lint` is clean. Nothing needed fixing. Things it noted but left out of scope:

- `POST /users` only checks that the fields are truthy. It doesn't check types or email format, and it doesn't trim, so POST is now looser than PUT. A good follow-up would be to share `validateUserUpdate` with POST.
- No duplicate-email check, on either endpoint.
- The route looks the user up once to decide on a 404 and the store looks again inside `updateUser`. The extra lookup is harmless with an in-memory array, and the store's `null` return is a safety net.
