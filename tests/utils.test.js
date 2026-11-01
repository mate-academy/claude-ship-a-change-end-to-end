const test = require("node:test");
const assert = require("node:assert");

const {
  parseId,
  isIdInRange,
  isNonEmptyString,
  isValidEmail,
  validateUserInput,
} = require("../utils");
const config = require("../config");

test("parseId accepts plain positive decimal integers", () => {
  assert.strictEqual(parseId("1"), 1);
  assert.strictEqual(parseId("42"), 42);
  assert.strictEqual(parseId("50000"), 50000);
});

test("parseId rejects anything that is not plain positive decimal digits", () => {
  for (const raw of ["abc", "", "0", "-1", "+1", "1.5", "01", "1e2", "0x10", " 1", "1 ", "1\n", "١٢"]) {
    assert.strictEqual(parseId(raw), null, `expected ${JSON.stringify(raw)} to be rejected`);
  }
  for (const raw of [undefined, null, 1, {}, []]) {
    assert.strictEqual(parseId(raw), null);
  }
});

test("isIdInRange enforces 1..maxUserId", () => {
  assert.strictEqual(isIdInRange(1), true);
  assert.strictEqual(isIdInRange(config.maxUserId), true);
  assert.strictEqual(isIdInRange(config.maxUserId + 1), false);
  assert.strictEqual(isIdInRange(0), false);
  assert.strictEqual(isIdInRange(-5), false);
  assert.strictEqual(isIdInRange(1.5), false);
  assert.strictEqual(isIdInRange(NaN), false);
  assert.strictEqual(isIdInRange(Number("99999999999999999999")), false);
  assert.strictEqual(isIdInRange(10, 5), false);
  assert.strictEqual(isIdInRange(5, 5), true);
});

test("isNonEmptyString requires a string with content", () => {
  assert.strictEqual(isNonEmptyString("a"), true);
  assert.strictEqual(isNonEmptyString(" a "), true);
  for (const v of ["", "   ", undefined, null, 5, {}, []]) {
    assert.strictEqual(isNonEmptyString(v), false);
  }
});

test("isValidEmail accepts real addresses", () => {
  for (const e of ["grace.hopper@example.com", "a+tag@sub.example.co", " padded@example.com "]) {
    assert.strictEqual(isValidEmail(e), true, e);
  }
});

test("isValidEmail rejects malformed addresses", () => {
  for (const e of ["a@b", "a@.", "foo@bar", "user@localhost", "a..b@x.com", ".a@x.com", "a@-x.com", "", "plain", 5, null, undefined]) {
    assert.strictEqual(isValidEmail(e), false, String(e));
  }
});

test("validateUserInput returns trimmed data for a valid body", () => {
  const result = validateUserInput({ name: "  Ada  ", email: " ada@example.com " });
  assert.deepStrictEqual(result, { data: { name: "Ada", email: "ada@example.com" } });
});

test("validateUserInput reports a clear error for missing or invalid fields", () => {
  assert.match(validateUserInput({ email: "a@b.co" }).error, /name/);
  assert.match(validateUserInput({ name: "   ", email: "a@b.co" }).error, /name/);
  assert.match(validateUserInput({ name: 5, email: "a@b.co" }).error, /name/);
  assert.match(validateUserInput({ name: "Ada" }).error, /email/);
  assert.match(validateUserInput({ name: "Ada", email: "nope" }).error, /email/);
});

test("validateUserInput tolerates a missing or non-object body", () => {
  for (const body of [undefined, null, [], "text", 5]) {
    assert.ok(validateUserInput(body).error, `body ${JSON.stringify(body)} should give an error`);
  }
});
