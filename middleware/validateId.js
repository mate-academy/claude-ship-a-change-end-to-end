const { parseId, isIdInRange } = require("../utils");

// Build a router.param handler that validates the :id param, but only for the
// method/route pairs listed in `endpoints`, shaped { METHOD: { "/route": true } }.
// Matching is two hash lookups (O(1)): no scanning or regex over the list.
// On success the parsed id is stored on req.userId.
function validateId(endpoints) {
  return (req, res, next, raw) => {
    // Express serves HEAD with the GET handler, so validate it as GET.
    const method = req.method === "HEAD" ? "GET" : req.method;
    const routes = Object.hasOwn(endpoints, method) ? endpoints[method] : null;
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

// Guard for handlers that rely on req.userId. If an :id route was never added
// to config.idValidatedEndpoints, fail loudly instead of looking up undefined
// and answering with a misleading 404.
function requireUserId(req, res, next) {
  if (req.userId === undefined) {
    return next(
      new Error(
        `req.userId is not set for ${req.method} ${req.baseUrl}${req.route.path}: add the endpoint to config.idValidatedEndpoints`,
      ),
    );
  }
  next();
}

module.exports = validateId;
module.exports.requireUserId = requireUserId;
