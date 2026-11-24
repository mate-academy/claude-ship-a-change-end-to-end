# NOTES — PUT /users/:id

## Approach
I will initially do this in plan mode in claude. Make sure that it creates a branch and generally see what it suggests. Then i will review the changes.
If they are good then i will ask cluade code to do the changes. I will then ask it to run npm tests. I will then ask it to commit. Then lastly create a pull request to submit the change on the branch.

## The plan I approved
The plan, made in plan mode, touched only `db/store.js` (a new `updateUser` helper that returns `undefined` for an unknown id, the same way `getUserById` does) and `routes/users.js` (a new `PUT /:id` handler). The main choices:
- PUT replaces the whole user, so `name` and `email` are both required.
- Blank or non-string values get a 400 with the same message POST uses.
- A malformed email gets its own 400.
- An unknown id gets a 404 that matches GET.
- Input is validated before the lookup.
- It works on a new `feature/update-user` branch.

I read the plan and asked where its information came from before approving. I approved it without changing the design. I did restart once: I undid a first attempt so I could split planning and building across two models.

## Model
I planned with Claude Opus 5.5 and built with Claude Sonnet 5.5. Planning is where the judgment calls are (what PUT should mean, what to validate, what order to check things in), so I used the stronger model there. Once the plan was fixed, the building was a small, well-specified change, so the faster model was enough.

## Commits
1. `Add updateUser helper to the in-memory store`: the data-access layer on its own.
2. `Add PUT /users/:id endpoint with validation and 404 handling`: the route, which turns the provided tests green.
3. `Add NOTES.md`: this write-up.

I split the commits by layer so each one makes sense alone and can be reverted on its own.

## Review
After `npm test` (9/9) and `npm run lint` passed, I checked these cases by hand: a valid update gives 200, `/users/9999` and `/users/abc` give 404, and a missing email, a malformed email, a blank name, a non-string name and a non-JSON body all give 400. An `id` in the body is ignored.

The review found one real problem: my notes file was named `Notes.md`. The test passes on Windows, which ignores filename case, but it would fail on Linux CI, so I renamed it to `NOTES.md`.

It also found that ids are parsed with `Number()`, so `/users/0x1`, `/users/1.0` and `/users/1e0` all resolve to user 1. The existing GET route already does this. I kept PUT consistent with GET and left stricter id parsing for both routes as a possible follow-up.
