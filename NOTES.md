# Notes

**Plan.** The failing tests in `tests/update-user.test.js` asked for `PUT /users/:id`. I planned two small changes: a `updateUser` helper in `db/store.js`, and a route in `routes/users.js` that returns 400 for a missing field, 404 for an unknown id, and 200 with the updated user.

**Model.** I used Claude Sonnet 5.5 in Claude Code. I used plan mode first, then wrote the code.

**Commit split.** One commit for the endpoint code and one for this file.

**Review.** I have not run a separate review on this change yet. The update tests and lint pass.
