const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../server");
const store = require("../db/store");
const config = require("../config");

test("updateUser updates an existing user and returns it", () => {
  const created = store.createUser({ name: "Before", email: "before@example.com" });
  const updated = store.updateUser(created.id, { name: "After", email: "after@example.com" });

  assert.strictEqual(updated.id, created.id);
  assert.strictEqual(updated.name, "After");
  assert.strictEqual(store.getUserById(created.id).email, "after@example.com");
});

test("updateUser returns undefined for an unknown id", () => {
  assert.strictEqual(store.updateUser(999999, { name: "N", email: "n@example.com" }), undefined);
});

test("updateUser rejects missing or invalid fields and leaves the user unchanged", () => {
  const created = store.createUser({ name: "Keep", email: "keep@example.com" });

  const bad = [
    { name: "Only name" },
    { email: "only@example.com" },
    {},
    undefined,
    { name: undefined, email: "x@example.com" },
    { name: "N", email: undefined },
    { name: "   ", email: "x@example.com" },
    { name: "N", email: "" },
    { name: 5, email: "x@example.com" },
  ];
  for (const fields of bad) {
    assert.throws(() => store.updateUser(created.id, fields), TypeError, JSON.stringify(fields));
  }

  const after = store.getUserById(created.id);
  assert.strictEqual(after.name, "Keep");
  assert.strictEqual(after.email, "keep@example.com");
});

test("createUser stops at config.maxUserId so every user stays reachable", async () => {
  let last;
  for (let i = 0; i < config.maxUserId + 10; i += 1) {
    try {
      last = store.createUser({ name: "Bulk", email: "bulk@example.com" });
    } catch (err) {
      assert.ok(err instanceof RangeError);
      assert.match(err.message, /user limit/i);
      break;
    }
  }

  assert.strictEqual(last.id, config.maxUserId);
  assert.throws(() => store.createUser({ name: "Over", email: "over@example.com" }), RangeError);

  // The last allowed user is still reachable over HTTP.
  const res = await request(app).get(`/users/${config.maxUserId}`);
  assert.strictEqual(res.status, 200);

  // And POST reports the limit instead of crashing.
  const post = await request(app).post("/users").send({ name: "Over", email: "over@example.com" });
  assert.strictEqual(post.status, 507);
  assert.match(post.body.error, /user limit/i);
});
