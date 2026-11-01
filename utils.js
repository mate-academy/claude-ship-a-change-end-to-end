// Shared, side-effect-free helpers used by the route handlers.

const ID_PATTERN = /^[1-9]\d*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;

// Parse a route id param into a positive safe integer, or null if malformed.
// Stricter than Number(): rejects "abc", "0", "-1", "1.5", "01", "1e2", "0x10".
function parseId(raw) {
  if (typeof raw !== "string" || !ID_PATTERN.test(raw)) {
    return null;
  }
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function isValidEmail(value) {
  return typeof value === "string" && EMAIL_PATTERN.test(value.trim());
}

// Validate a user request body. Returns { error } or { data: { name, email } }
// with both values trimmed.
function validateUserInput(body) {
  const { name, email } = body || {};

  if (!isNonEmptyString(name)) {
    return { error: "name is required and must be a non-empty string" };
  }
  if (!isValidEmail(email)) {
    return { error: "email is required and must be a valid email address" };
  }

  return { data: { name: name.trim(), email: email.trim() } };
}

module.exports = { parseId, isNonEmptyString, isValidEmail, validateUserInput };
