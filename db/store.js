// A tiny in-memory data store. It stands in for a real database so the
// project stays easy to run. Data is not persisted — it resets every time
// the server restarts.

const config = require("../config");
const { isNonEmptyString } = require("../utils");

let users = [
  { id: 1, name: "Ada Lovelace", email: "ada@example.com" },
  { id: 2, name: "Alan Turing", email: "alan@example.com" },
];

let nextId = 3;

function getAllUsers() {
  return users;
}

function getUserById(id) {
  return users.find((user) => user.id === id);
}

// Throws a RangeError once the next id would exceed config.maxUserId, because
// the API rejects such ids and the user would be unreachable.
function createUser({ name, email }) {
  if (nextId > config.maxUserId) {
    throw new RangeError(`user limit of ${config.maxUserId} reached`);
  }
  const user = { id: nextId, name, email };
  nextId += 1;
  users.push(user);
  return user;
}

// Update an existing user's name and email in place.
// Returns the updated user, or undefined if no user has that id.
// Throws a TypeError if name or email is missing or not a non-empty string,
// so a direct caller can never wipe a field with undefined.
function updateUser(id, { name, email } = {}) {
  if (!isNonEmptyString(name) || !isNonEmptyString(email)) {
    throw new TypeError("updateUser requires non-empty string name and email");
  }

  const user = getUserById(id);
  if (!user) {
    return undefined;
  }
  user.name = name;
  user.email = email;
  return user;
}

module.exports = { getAllUsers, getUserById, createUser, updateUser };
