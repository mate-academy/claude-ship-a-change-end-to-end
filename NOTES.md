# Notes

## Implementation

Added `PUT /users/:id` to update an existing user by ID. The endpoint validates that both `name` and `email` are provided, returns `400` when either field is missing, returns `404` when the requested user does not exist, and returns the updated user with status `200` on success.

The in-memory store now provides an `updateUser` helper that finds the user, updates its name and email, and returns the updated record.

## Testing

The existing grading tests were left unchanged. The implementation is designed to satisfy the success, missing-user, and missing-field cases covered by those tests.

## Design decision

Validation is performed in the route before calling the store helper, while the store helper is responsible only for locating and updating the user. This keeps HTTP concerns in the route and data operations in the store.
