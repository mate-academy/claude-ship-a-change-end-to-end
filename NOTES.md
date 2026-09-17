# Notes on the update-user change

## The plan

The approved plan was to add `PUT /users/:id` to `routes/users.js`, backed by a new
`updateUser(id, { name, email })` helper in `db/store.js`, following the same style
as the existing GET/POST handlers. Both `name` and `email` are required on every
update (no partial updates), input is validated before the user lookup so a bad
request returns 400 even for a nonexistent id, and the `id` in the URL can never be
changed by the request body. Before writing any code, I turned the plan into a
detailed spec at `docs/specs/update-user.md` covering the endpoint contract,
validation order, error messages, and edge cases, and used that as the source of
truth for the implementation. No changes were made to the provided test file.

## Model choice

Opus 5 for planning and the spec, since the design work (choosing validation order,
error messages, and what belongs in scope) benefited from more careful reasoning.
I switched to Sonnet 5 to build the plan out, since the implementation itself was
small and mechanical once the spec was settled.

## Commit split

I split the work into one logical change per commit: the spec document, the store
helper, the route handler, and finally this notes file. Keeping the spec as its own
commit means the design decisions are reviewable independently of the code that
implements them, and the store/route split mirrors the existing separation between
data access and HTTP handling in this codebase.

## What the review caught

Self-review confirmed the validation order matches the spec (id, then required
fields, then per-field checks, then the store lookup) and that error messages reuse
the exact strings already used by GET and POST for consistency. It also confirmed
`req.body ?? {}` prevents a crash on a request with no JSON body, and that the id in
the request body is ignored rather than allowed to overwrite the URL's id. No bugs
were found that required a fix.
