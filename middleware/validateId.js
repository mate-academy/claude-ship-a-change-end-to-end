const { parseId, isIdInRange } = require("../utils");

// Build a router.param handler that validates the :id param, but only for the
// method/route pairs listed in `endpoints`, shaped { METHOD: { "/route": true } }.
// Matching is two hash lookups (O(1)): no scanning or regex over the list.
// On success the parsed id is stored on req.userId.
function validateId(endpoints) {
  return (req, res, next, raw) => {
    const routes = Object.hasOwn(endpoints, req.method) ? endpoints[req.method] : null;
    const path = req.baseUrl + req.route.path; // route pattern, e.g. "/users/:id"

    if (!routes || !Object.hasOwn(routes, path) || routes[path] !== true) {
      return next();
    }

    const id = parseId(raw);
    if (id === null) {
      return res.status(400).json({ error: "id must be a positive integer" });
    }
    if (!isIdInRange(id)) {
      return res.status(400).json({ error: "id is out of range" });
    }

    req.userId = id;
    next();
  };
}

module.exports = validateId;
