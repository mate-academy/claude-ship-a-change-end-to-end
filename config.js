module.exports = {
  // Highest user id the API will accept in a route param.
  maxUserId: 50000,
  // Longest user name accepted, in characters (after trimming).
  maxNameLength: 100,
  // Endpoints whose :id param is validated by the validateId middleware.
  // Keyed by HTTP method, then by full route path, for O(1) lookup.
  idValidatedEndpoints: {
    GET: { "/users/:id": true },
    PUT: { "/users/:id": true },
  },
};
