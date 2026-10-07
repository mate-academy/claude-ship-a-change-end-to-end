# Shipping the user update endpoint

Plan: inspect the supplied tests and existing route/store pattern, add a
store update helper, then PUT /users/:id with validation and a not-found
response. Review strengthened the initial missing-field check to reject
non-string and whitespace-only values and invalid IDs before any mutation.
The route uses the store rather than reaching into its data directly.

Model choice (theoretical): Sonnet fits this small, well-specified Express
feature; Opus planning would be unnecessary overhead. Codex actually
implemented and tested the change. Claude Code could not run without a paid
plan, so no Claude planning session, approval, or execution is claimed.

Commit split: data-store helper first, HTTP validation and route second,
then these workflow notes. Each commit has one clear purpose. The final
branch contains the complete feature and is submitted to the upstream repo.

Review: confirmed unknown IDs return 404, invalid input cannot change a
user, the existing ID is preserved, and only name/email are updated.
Validation intentionally checks types and non-empty strings; it does not
claim full email syntax validation or persistence in this in-memory starter.
All nine supplied tests pass without editing the grading tests; lint passes.
