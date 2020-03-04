const mongoose = require('mongoose')

const URI = 'mongodb://localhost/test-task'

// mongoDB is not a relation DB...
const TextSchema = new mongoose.Schema({
  _id: String,
  text: String,
  user_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
})

const UserSchema = new mongoose.Schema({
  _id: String,
  name: String,
  text_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Text' }],
})

const TextModel = mongoose.model('Text', TextSchema)
const UserModel = mongoose.model('User', UserSchema)
const db = mongoose.connection

mongoose.connect(URI, {
  useNewUrlParser: true,
  useFindAndModify: false,
})

db.on('error', console.error.bind(console, 'DB: connection error'))
db.once('open', console.log.bind(console, 'DB: connected'))

module.exports = { TextModel, UserModel }
