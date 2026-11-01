// Shared, side-effect-free helpers used by the route handlers.

const validator = require("validator");

const config = require("./config");

const ID_PATTERN = /^[1-9]\d*$/;

// Parse a route id param written as plain positive decimal digits, or return
// null if malformed. Stricter than Number(): rejects "abc", "0", "-1", "1.5",
// "01", "1e2", "0x10". Range is checked separately by isIdInRange.
function parseId(raw) {
  if (typeof raw !== "string" || !ID_PATTERN.test(raw)) {
    return null;
  }
  return Number(raw);
}

// True when id is an integer between 1 and the configured maximum.
function isIdInRange(id, max = config.maxUserId) {
  return Number.isInteger(id) && id >= 1 && id <= max;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function isValidEmail(value) {
  return typeof value === "string" && validator.isEmail(value.trim());
}

// Validate a user request body. Returns { error } or { data: { name, email } }
// with both values trimmed.
function validateUserInput(body) {
  const { name, email } = body || {};

  if (!isNonEmptyString(name)) {
    return { error: "name is required and must be a non-empty string" };
  }
  if (name.trim().length > config.maxNameLength) {
    return { error: `name must be at most ${config.maxNameLength} characters` };
  }
  if (!isValidEmail(email)) {
    return { error: "email is required and must be a valid email address" };
  }

  return { data: { name: name.trim(), email: email.trim() } };
}

module.exports = { parseId, isIdInRange, isNonEmptyString, isValidEmail, validateUserInput };
