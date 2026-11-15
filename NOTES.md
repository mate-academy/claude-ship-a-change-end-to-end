# Notes: PUT /users/:id

## What was in the plan you approved, and did you edit anything before approving?
The plan added `updateUser(id, { name, email })` to `db/store.js`, reusing
`getUserById` and returning `undefined` when the user is missing. It added
`PUT /users/:id` to `routes/users.js`: 400 on bad input, 404 when the user
doesn't exist, and 200 with the updated user otherwise. `NOTES.md` was to be
written last. I approved the plan without editing it.

The plan said "non-empty strings", but the first implementation only checked
that fields were truthy. The review caught that mismatch (see below).

## Which model did you choose, and why?
Planning ran on Sonnet 5.5, and implementation ran on Haiku 5.5. Planning
benefits from a stronger model reading the code and weighing edge cases. Once
the plan was fixed, the work was a small change that copied existing patterns,
so the smaller, faster model was enough.

## How did you split your commits, and why that way?
There are four commits, one logical change each:
1. `db/store.js`: the `updateUser` helper.
2. `routes/users.js`: the `PUT /users/:id` route.
3. `NOTES.md`: the first version of these notes.
4. `routes/users.js` and `NOTES.md`: the validation fix from review.

Each commit is one layer, so its message makes sense without the diff. The
store comes first because the route depends on it. The review fix is its own
commit so the feedback shows up as a separate step in history.

## What did your review catch — or confirm was already fine?
**Caught:** validation only rejected falsy values, so a number or an object
could reach the store as a name or email. The PUT route now requires both fields
to be non-empty strings, with whitespace-only counted as empty. Anything else
returns 400 `name and email must be non-empty strings` before the store is
called.

**Confirmed fine:**
- A non-numeric id (for example `/users/abc`) becomes `NaN`, matches no user,
  and returns 404.
- An empty field returns 400 before any lookup happens.
- The updated user keeps its original id.

**Left alone:** POST still uses the older truthy check. It's outside this
change, so I didn't touch it.
