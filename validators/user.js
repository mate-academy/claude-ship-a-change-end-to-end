const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254; // practical limit for an email address (RFC 5321)

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Returns an error message for an invalid { name, email } body, or null if valid.
// The body can be undefined or null (e.g. no body was parsed), so it is not
// destructured in the parameter list.
function validateUserInput(body) {
  const { name, email } = body ?? {};
  if (name === undefined || email === undefined) {
    return "name and email are required";
  }
  if (typeof name !== "string" || typeof email !== "string") {
    return "name and email must be strings";
  }
  if (!name.trim() || !email.trim()) {
    return "name and email cannot be empty";
  }
  if (name.trim().length > MAX_NAME_LENGTH) {
    return `name must be at most ${MAX_NAME_LENGTH} characters`;
  }
  if (email.trim().length > MAX_EMAIL_LENGTH) {
    return `email must be at most ${MAX_EMAIL_LENGTH} characters`;
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return "email must be a valid email address";
  }
  return null;
}

// Parses a route id. Only plain digits are accepted ("0x1", "1e0" or " 1" are
// not), and the id must be positive. Returns the number, or null if invalid.
function parseId(raw) {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return id > 0 ? id : null;
}

module.exports = { validateUserInput, parseId };
