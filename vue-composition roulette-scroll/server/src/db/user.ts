// imagine we're woeking with database

const users: Object[] = []

const getUser = (id) => users[id]

const updateUser = (id, data) => (users[id] = Object.assign(users[id], data))

const addUser = (data: Object) => users.push(data)

export { getUser, updateUser, addUser }
