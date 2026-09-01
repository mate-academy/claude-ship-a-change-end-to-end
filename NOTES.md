I have chosen Opus Plan Mode (Opus for plan mode, Sonnet otherwise) to use more advanced model for more difficult work.


The delivered plan contains this:

# Add `PUT /users/:id` to the users resource

## Context

The users resource in this small Express API supports listing, fetching, and creating users, but there is no way to update one. `tests/update-user.test.js` is already committed and currently fails — it is the target contract for this change:

- `PUT /users/:id` on an existing user → `200` with the full updated user object
- `PUT /users/9999` (unknown id) → `404`, not a crash
- `PUT /users/1` with a missing field → `400`

The change must go through `db/store.js` for data access, following the pattern the existing routes already use. Scope for this plan is the code change only — branching, commits, `NOTES.md`, and the PR are handled separately.

## Approach

Two files, mirroring the existing conventions exactly: CommonJS, plain synchronous handlers (no async/await, no `next(err)` — there is no error middleware in [server.js](server.js), so a throw would fall through to Express's HTML 500), `{ error: "..." }` bodies, and a `// METHOD /path — description` comment above each route.

### 1. [db/store.js](db/store.js) — add `updateUser`

Add alongside `createUser` (which it should mirror in shape: destructured-object param, returns the user object) and export it.

```js
function updateUser({ id, name, email }) {
  const user = getUserById(id);

  if (!user) {
    return undefined;
  }

  user.name = name;
  user.email = email;
  return user;
}
```

Key points:
- Reuse the existing `getUserById` rather than a second `users.find(...)`.
- Signal not-found with `undefined`, matching `getUserById`'s existing contract (falsy, never `null`, never a throw) so the route can use the same `if (!user)` check as `GET /users/:id` at [routes/users.js:16](routes/users.js#L16).
- Mutate in place so the user keeps its position in `users` and its `id` is untouched. `id` is never taken from the request body.
- Add to the `module.exports` object on the last line.

### 2. [routes/users.js](routes/users.js) — add the `PUT /:id` handler

Place it after the `POST /` handler, before `module.exports`.

```js
// A pragmatic check: something before the @, something after it, and a dot in
// the domain. Full RFC-correct email validation is not worth the complexity here.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// PUT /users/:id — replace an existing user's name and email
router.put("/:id", (req, res) => {
  const { name, email } = req.body;

  if (typeof name !== "string" || name.trim() === "") {
    return res
      .status(400)
      .json({ error: "name is required and must be a non-empty string" });
  }

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
    return res
      .status(400)
      .json({ error: "email is required and must be a valid email address" });
  }

  const id = Number(req.params.id);
  const user = store.updateUser({ id, name: name.trim(), email: email.trim() });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});
```

Key points:
- **Validate before the existence check.** A malformed request is a client error regardless of whether the id exists, and it matches the shape of the `POST` handler. Both grading tests pass under this ordering (the 404 test sends a complete body; the 400 test targets the existing id 1).
- **Per-field error messages** rather than one combined string, so the caller knows which field is wrong — this is the "clear error" the requirement asks for. The existing `POST` handler's combined message stays as-is; changing it is out of scope.
- **`Number(req.params.id)`** matches [routes/users.js:13](routes/users.js#L13). A non-numeric id such as `/users/abc` becomes `NaN`, matches nothing in the store, and falls through to the 404 branch — no crash.
- **`req.body` is always an object** — `express.json()` is mounted globally in [server.js](server.js#L9) and defaults to `{}` for an empty or non-JSON body, so destructuring is safe and an empty body lands on the 400 branch.
- Trim before storing so a padded value isn't persisted with surrounding whitespace.

## Verification

Run from the project root:

```
npm test        # node --test over tests/*.test.js
npm run lint    # eslint — CI runs this BEFORE the tests, so it must be clean too
```

Expect all three `tests/update-user.test.js` cases green, plus the existing `tests/users.test.js` and `tests/notes.test.js` still passing. Do not edit `tests/update-user.test.js`.

Manual smoke check against a running server (`npm run dev`, port 3000) for the cases the tests don't cover:

```bash
# 200 — happy path
curl -X PUT localhost:3000/users/1 -H 'Content-Type: application/json' \
  -d '{"name":"Ada L.","email":"ada@example.com"}'

# 400 — invalid email shape (not just missing)
curl -i -X PUT localhost:3000/users/1 -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"not-an-email"}'

# 400 — wrong type
curl -i -X PUT localhost:3000/users/1 -H 'Content-Type: application/json' \
  -d '{"name":123,"email":"ada@example.com"}'

# 404 — non-numeric id, must not crash
curl -i -X PUT localhost:3000/users/abc -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com"}'

# 400 — empty body
curl -i -X PUT localhost:3000/users/1 -H 'Content-Type: application/json' -d '{}'
```

Then `curl localhost:3000/users` to confirm the updated user kept its `id` and its position in the list.

===============

I like the plan and I have chosen auto-accept it. I did not change anything.
Then I have run tests and they are all OK.
Then I have tested new endpoints with Bruno app and it was OK.
My review did not discover any mistake. Confirm was fine.

Suggested split (3 commits):

1.
db/store.js — add the updateUser data-access helper. It's a self-contained addition to the store layer, reviewable on its own.

2.
routes/users.js — add the PUT /users/:id route (validation + not-found handling) that consumes updateUser. Depends on commit 1, so it comes second and is the one that actually turns the grading tests green.

3.
NOTES.md — your plan/model-choice/commit-split/review write-up. Kept separate since it's not code and shouldn't be bundled into the feature commit.