## Notes

**Plan:** Add `PUT /users/:id` to the users route and a matching `updateUser` helper in `db/store.js`, following the existing pattern. Handle 400 for missing fields and 404 for an unknown id. No changes to existing tests or routes.

**Model:** Claude Sonnet 4.6 — sufficient for a small, well-defined feature; no need for a heavier model.

**Commits:** One commit for the store helper and route together — they are a single logical change and make no sense split apart.

**Review:** Validation order (400 before the store lookup) means we never touch the store with bad input. The 404 path relies on `updateUser` returning `null`, which mirrors how `getUserById` signals not-found throughout the rest of the file.
