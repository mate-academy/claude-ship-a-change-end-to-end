// A tiny in-memory data store. It stands in for a real database so the
// project stays easy to run. Data is not persisted — it resets every time
// the server restarts.

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

function createUser({ name, email }) {
  const user = { id: nextId, name, email };
  nextId += 1;
  users.push(user);
  return user;
}

// Replaces name and email on an existing user. Throws a USER_NOT_FOUND error
// (rather than returning undefined) so callers can't miss the failure.
function updateUser(id, { name, email }) {
  const user = getUserById(id);

  if (!user) {
    const err = new Error(`User not found: ${id}`);
    err.code = "USER_NOT_FOUND";
    throw err;
  }

  user.name = name;
  user.email = email;
  return user;
}

module.exports = { getAllUsers, getUserById, createUser, updateUser };
