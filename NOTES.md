# Notes: PUT /users/:id

**Plan.** I planned the change in Claude Code's plan mode before writing any code. The plan covered the store helper in `db/store.js`, the route in `routes/users.js`, the validation rules, and the 400/404 behavior the tests expect. I approved it with one correction: I first had to add `npm install` so `supertest` loads. Without it every test file failed on a missing module, so the baseline was not a real red.

**Model.** I used Claude Haiku 5.5. The change is small, the spec is clear, and the tests already exist, so a fast, low-cost model is a good fit. I would reach for a stronger model if the task needed more design judgement.

**Commits.** I split the work into two commits. The first adds the `updateUser` store helper, and the second adds the route with its validation and 404 handling. Each commit stands on its own, so a reviewer can check the data layer separately from the HTTP behavior. This file is the third commit.

**Review.** The self-review confirmed the core behavior: an update returns 200, a missing or blank field returns 400, and an unknown id returns 404. It also surfaced two behaviors I kept on purpose. Validation runs before the lookup, so an unknown id with a bad body returns 400 rather than 404. Values are stored untrimmed, the same as POST, so `"  Ada "` keeps its spaces. Lint and the full test suite pass.
