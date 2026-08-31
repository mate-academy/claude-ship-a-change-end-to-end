# CLAUDE.md

Small Express API (CommonJS, Node's built-in test runner). Routes live in `routes/`, all data
access goes through `db/store.js`, and `server.js` exports `app` so tests can import it without
opening a port.

- `npm test` — runs `node --test`
- `npm run dev` — `node --watch server.js`
- `npm run lint` — eslint

Current task: add `PUT /users/:id` to `routes/users.js`, with the store helper it needs in
`db/store.js`. `tests/update-user.test.js` is the spec — do not edit it.

## Models

Plan with **Opus**, execute with **Sonnet**.

Use Opus in plan mode to decide the approach — which files change, how validation and the
not-found path work, how the work splits into commits. Switch to Sonnet (`/model sonnet`) to
write the code, run tests, and commit. If a plan turns out to be wrong mid-execution, stop and
re-plan with Opus rather than improvising in Sonnet.

## Commits

One logical change per commit. Write the message from the actual diff — read what changed, then
describe it; do not paraphrase the task description.

Run `npm test` as you go, not just at the end. The `update-user` tests turn green once the
endpoint is right; that is the signal the feature is done.

Each message must be understandable without opening the diff. A reader scanning `git log`
should know what changed and why.

    Good:  Add updateUser helper to store, returning undefined for unknown ids
    Bad:   Update store.js

Do not bundle the store helper, the route, and `NOTES.md` into one commit — they are separate
logical changes.

## Review before the PR

Before opening the pull request, review the changes yourself — `git diff main...HEAD` — and
report what you find. Look specifically for:

- bugs and edge cases (non-numeric `:id`, empty-string vs missing field, extra body fields)
- the not-found path — 404, not a crash or a 500
- the validation path — 400 with a clear error, matching the shape `POST /users` already uses

Present what you flag as findings for me to judge. I decide what is real; fix those, and say
plainly which ones I chose to skip.

A green test run and a clean review are signals, not a guarantee. Do not describe the change as
verified on the strength of passing tests alone — say what was actually checked and what was not.

## PR

The description must say what changed, why, and what a reviewer should test — including the
not-found and invalid-input cases.
