// Extra tests for the validation rules shared by POST /users and
// PUT /users/:id, plus id parsing and malformed-body handling.

const test = require("node:test");
const assert = require("node:assert");
const request = require("supertest");

const app = require("../server");
const { validateUserInput } = require("../validators/user");

const VALID = { name: "Katherine Johnson", email: "katherine@example.com" };

async function createUser() {
  const res = await request(app).post("/users").send(VALID);
  return res.body.id;
}

test("PUT /users/:id rejects ids that are not plain positive integers", async () => {
  for (const id of ["abc", "1.5", "-3", "0", "0x1", "1e0", "%201"]) {
    const res = await request(app).put(`/users/${id}`).send(VALID);
    assert.strictEqual(res.status, 400, `id "${id}" should be rejected`);
    assert.strictEqual(res.body.error, "id must be a positive integer");
  }
});

test("GET /users/:id rejects ids that are not plain positive integers", async () => {
  for (const id of ["abc", "0x1", "1e0"]) {
    const res = await request(app).get(`/users/${id}`);
    assert.strictEqual(res.status, 400, `id "${id}" should be rejected`);
  }
});

const INVALID_BODIES = [
  ["missing email", { name: "Only a name" }, "name and email are required"],
  ["missing name", { email: "a@b.co" }, "name and email are required"],
  ["no body", undefined, "name and email are required"],
  ["non-string fields", { name: 123, email: true }, "name and email must be strings"],
  ["blank name", { name: "   ", email: "a@b.co" }, "name and email cannot be empty"],
  ["blank email", { name: "A", email: "" }, "name and email cannot be empty"],
  ["malformed email", { name: "A", email: "not-an-email" }, "email must be a valid email address"],
  [
    "name too long",
    { name: "x".repeat(101), email: "a@b.co" },
    "name must be at most 100 characters",
  ],
  [
    "email too long",
    { name: "A", email: `${"x".repeat(250)}@b.co` },
    "email must be at most 254 characters",
  ],
];

for (const [label, body, message] of INVALID_BODIES) {
  test(`PUT /users/:id returns 400 for ${label}`, async () => {
    const id = await createUser();
    const res = await request(app).put(`/users/${id}`).send(body);
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error, message);
  });

  test(`POST /users returns 400 for ${label}`, async () => {
    const res = await request(app).post("/users").send(body);
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error, message);
  });
}

test("an invalid body does not change the stored user", async () => {
  const id = await createUser();
  await request(app).put(`/users/${id}`).send({ name: "Changed", email: "nope" });

  const res = await request(app).get(`/users/${id}`);
  assert.deepStrictEqual(res.body, { id, ...VALID });
});

test("PUT /users/:id answers 404 for a valid body and an unknown id", async () => {
  const res = await request(app).put("/users/9999").send(VALID);
  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.error, "User not found");
});

test("PUT /users/:id answers 400, not 404, for an unknown id with an invalid body", async () => {
  const res = await request(app).put("/users/9999").send({ name: "" });
  assert.strictEqual(res.status, 400);
});

test("PUT and POST trim name and email before saving", async () => {
  const created = await request(app)
    .post("/users")
    .send({ name: "  Mary Jackson ", email: " mary@example.com " });
  assert.strictEqual(created.body.name, "Mary Jackson");
  assert.strictEqual(created.body.email, "mary@example.com");

  const updated = await request(app)
    .put(`/users/${created.body.id}`)
    .send({ name: " Mary J. ", email: " mj@example.com " });
  assert.strictEqual(updated.body.name, "Mary J.");
  assert.strictEqual(updated.body.email, "mj@example.com");
});

test("a malformed JSON body returns a JSON 400, not an HTML page", async () => {
  const res = await request(app)
    .put("/users/1")
    .set("Content-Type", "application/json")
    .send("{bad");
  assert.strictEqual(res.status, 400);
  assert.match(res.headers["content-type"], /application\/json/);
  assert.strictEqual(res.body.error, "Invalid JSON body");
});

test("validateUserInput does not throw when the body is missing or null", () => {
  for (const body of [undefined, null]) {
    assert.strictEqual(
      validateUserInput(body),
      "name and email are required",
      `body ${body} should be reported as missing fields`,
    );
  }
});

test("PUT and POST return 400 when the body is not JSON or is JSON null", async () => {
  for (const method of ["put", "post"]) {
    const url = method === "put" ? "/users/1" : "/users";
    const send = (type, payload) =>
      request(app)[method](url).set("Content-Type", type).send(payload);

    const text = await send("text/plain", "hola");
    assert.strictEqual(text.status, 400, `${method} with a text/plain body`);

    const jsonNull = await send("application/json", "null");
    assert.strictEqual(jsonNull.status, 400, `${method} with a JSON null body`);
  }
});
