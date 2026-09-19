// A tiny in-memory data store. It stands in for a real database so the
// project stays easy to run. Data is not persisted — it resets every time
// the server restarts.

const users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

function getAllUsers() {
  return users;
}

function getUserById(id) {
  return users.find((u) => u.id === id) || null;
}

function createUser({ name, email }) {
  const newUser = {
    id: users.length + 1,
    name,
    email,
  };
  users.push(newUser);
  return newUser;
}

function updateUser(id, updates) {
  const user = getUserById(id);
  if (!user) {
    return null;
  }
  user.name = updates.name;
  user.email = updates.email;
  return user;
}

module.exports = { getAllUsers, getUserById, createUser, updateUser };
