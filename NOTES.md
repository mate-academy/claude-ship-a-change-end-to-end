## Notes

Added PUT /users/:id endpoint with name and email validation (400 if missing).
Implemented updateUser in the in-memory store — returns null when the ID is not
found so the route layer can cleanly respond with 404. All tests now pass.

Model used: Claude Sonnet
