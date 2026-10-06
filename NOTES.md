   ## 1. My model:

   I decided to use Sonnet 5.5. Why:

   - this task is not complex
   - there is only one feature
   - the tests are already written, so the expected result is clear

   ## 2. Claude's plan (I approved it without changes):

   Plan: PUT /users/:id (update a user)

   Context

   The users resource has list, get-by-id and create, but no update.
   tests/update-user.test.js
   (already written, must not be edited) expects PUT /users/:id to return
   200 with the updated
   user, 404 for an unknown id, and 400 when a field is missing. Goal:
   make those tests green,
   following the existing pattern (route -> db/store.js), and ship it in
   clean commits with a
   NOTES.md. Branch: feature/update-user (already created, same commit as
   main).

   Existing patterns to reuse

   - routes/users.js: id parsed with Number(req.params.id),
     store.getUserById(id),
     404 as res.status(404).json({ error: "User not found" }), 400 as
     res.status(400).json({ error: "..." }) (see POST).
   - db/store.js: in-memory users array, plain functions exported at the
     bottom.

   Changes

   1. db/store.js - add updateUser(id, { name, email })

   - Find the user by id; if missing, return undefined (same contract as
     getUserById).
   - Otherwise update name and email on the stored user and return it.
   - Add it to module.exports.

   2. routes/users.js - add PUT /:id

   - Parse id like the GET route.
   - Validate body first: name and email must both be present, strings,
     and non-blank
     (after trim()). Otherwise 400 with a clear message, e.g.
     "name and email are required and must be non-empty strings".
     PUT means full replacement, so both fields are required (consistent
     with POST).
   - Call store.updateUser(id, { name, email }); if it returns undefined,
     respond 404
     { error: "User not found" }. A non-numeric id becomes NaN, matches
     nothing, and                                                          ↓

## 3. How I split the commits:

I made one commit for each logical change, so every commit can be
understood and reverted on its own:

1. `Add updateUser helper to the data store` - only `db/store.js`. This is
   the data layer, and it does not depend on HTTP.
2. `Add PUT /users/:id with validation and 404 handling` - only
   `routes/users.js`. This is the endpoint (400, 404, 200) and it uses the
   helper from the first commit.
3. `Add NOTES.md` - the write-up, committed last so it can describe the
   result of the review.

I split by layer (store first, then route) because the route depends on the
store function, and each commit message explains what changed and why
without opening the diff.

