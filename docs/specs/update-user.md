# Spec: Update a user (`PUT /users/:id`)

**Status:** Draft, ready for implementation
**Branch:** `feature/update-user`
**Acceptance tests:** [`tests/update-user.test.js`](../../tests/update-user.test.js). These tests are fixed; do not edit them.

## 1. Summary

This spec adds an endpoint to the users resource that replaces the `name` and `email` of an existing user. The endpoint:
- validates its input and rejects bad requests with a clear 400 error
- returns 404 when the user doesn't exist
- reads and writes data only through `db/store.js`, like the other user routes

## 2. Endpoint contract

| | |
|---|---|
| **Method** | `PUT` |
| **Path** | `/users/:id` |
| **Request content type** | `application/json` |
| **Request body** | `{ "name": string, "email": string }` |
| **Semantics** | Full replacement of the fields you can change. Both fields are required. |

### Responses

| Status | When | Body |
|---|---|---|
| `200 OK` | The user exists and the input is valid | The updated user: `{ "id": number, "name": string, "email": string }` |
| `400 Bad Request` | `id` is not a positive integer | `{ "error": "id must be a positive integer" }` |
| `400 Bad Request` | `name` or `email` is missing | `{ "error": "name and email are required" }` |
| `400 Bad Request` | `name` is not a string, or is empty or only whitespace | `{ "error": "name must be a non-empty string" }` |
| `400 Bad Request` | `email` is not a string, or is not a valid email address | `{ "error": "email must be a valid email address" }` |
| `404 Not Found` | The input is valid but no user has this `id` | `{ "error": "User not found" }` |

Every error body uses the `{ "error": string }` shape the existing routes already use. The 404 message and the missing-field message are the same strings used by `GET /users/:id` and `POST /users`.

## 3. Validation rules

The endpoint runs these checks in order and returns on the first failure:

1. **`id` path parameter.** Parse it with `Number(req.params.id)`, as `GET /users/:id` does. The result must satisfy `Number.isInteger(id) && id > 0`. This rejects `abc`, `1.5`, `0`, and `-3`.
2. **Required fields.** Read the body as `req.body ?? {}` so a request with no JSON body can't throw. If `name` or `email` is `undefined` or `null`, the request is missing a field.
3. **`name`.** Must be `typeof name === "string"`, and `name.trim()` must not be empty.
4. **`email`.** Must be `typeof email === "string"`, and `email.trim()` must match `^[^\s@]+@[^\s@]+\.[^\s@]+$`. This is a basic format check, not a full RFC 5322 check.
5. **Extra fields.** Every other field in the body is ignored, including `id`. The client can never change a user's id.

### Normalization

`name` and `email` are trimmed before they're saved and before they're returned.

### Why input is validated before the user lookup

A malformed request returns 400 whether or not the user exists. This keeps validation separate from data access, so the route checks the input and then calls the store once. It also means a client can't use the error codes to find out which ids exist when its requests are malformed.

## 4. Data access: `db/store.js`

Add a new exported function:

```js
updateUser(id, { name, email }) -> User | undefined
```

- It finds the user with the existing `getUserById(id)`.
- If there is no user with that id, it returns `undefined` and changes nothing.
- Otherwise it sets `user.name` and `user.email` **on the existing object** and returns that object. Because the object in the `users` array is updated in place, `getAllUsers()` and `getUserById()` return the new values right away.
- It does no validation. The route is responsible for passing clean data, which matches how `createUser` works.
- The `id` and `nextId` values never change.

## 5. Route: `routes/users.js`

Add the handler after `POST /`, in the same style as the existing handlers:

```js
// PUT /users/:id — replace a user's name and email; 400 on invalid input, 404 if missing
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const { name, email } = req.body ?? {};
  if (name == null || email == null) {
    return res.status(400).json({ error: "name and email are required" });
  }
  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "name must be a non-empty string" });
  }
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    return res.status(400).json({ error: "email must be a valid email address" });
  }

  const user = store.updateUser(id, { name: name.trim(), email: email.trim() });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});
```

Define `EMAIL_PATTERN` once, near the top of the module, as `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. The checks stay inline, as they are in `POST /`; don't add a shared validation helper.

## 6. Mapping to the acceptance tests

| Test in `tests/update-user.test.js` | Rule that satisfies it |
|---|---|
| `PUT /users/:id updates an existing user` → 200 with new `name` and `email` | Valid input, user found, `updateUser` returns the changed object (sections 3–5) |
| `PUT /users/:id returns 404 for a user that does not exist` (`/users/9999`) | Valid input, `updateUser` returns `undefined`, so 404 (section 4) |
| `PUT /users/:id with a missing field returns 400` (`/users/1`, name only) | Required-field check (section 3, rule 2) |

## 7. Edge cases

| Request | Expected result |
|---|---|
| `PUT /users/abc` with a valid body | 400 (invalid id) |
| `PUT /users/0` or `/users/-1` or `/users/1.5` | 400 (invalid id) |
| `PUT /users/9999` with `{}` | 400 (the input is checked before the lookup) |
| No body, or a body that isn't JSON | 400 (missing fields), and the server doesn't crash |
| `{ "name": "   ", "email": "a@b.co" }` | 400 (empty name) |
| `{ "name": 123, "email": "a@b.co" }` | 400 (name isn't a string) |
| `{ "name": "Ada", "email": "not-an-email" }` | 400 (invalid email) |
| `{ "name": "  Ada  ", "email": " ada@x.io " }` | 200, and both values are saved trimmed |
| `{ "id": 42, "name": "Ada", "email": "ada@x.io" }` on `/users/1` | 200, and the user's id stays `1` |
| The same valid PUT sent twice | Both return 200 with the same result (PUT is idempotent) |

## 8. Out of scope

- Partial updates (`PATCH /users/:id`)
- Rejecting an email that another user already has
- Saving data between server restarts
- Making `POST /users` validation match these stricter rules
- Authentication and authorization

## 9. Deliverables and verification

- `db/store.js`: add `updateUser`
- `routes/users.js`: add the `PUT /:id` handler
- `NOTES.md` at the project root, at least 80 characters, required by `tests/notes.test.js`. It covers:
  - the plan
  - the model choice
  - how the commits were split
  - what the review found
- Checks:
  - `npm install`
  - `npm test` passes, including the `update-user` and `notes` tests
  - `npm run lint` passes cleanly
  - Try the cases in section 7 with `npm run dev` and `curl`
