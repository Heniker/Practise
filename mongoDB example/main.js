const { TextModel, UserModel } = require('./db')
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')

// fix:
const pageSize = 10
console.log('test')

const app = express()

app.use(cors())

app.use((req, res, next) => {
  console.log(req.url)
  next()
})

const user = new UserModel({
  _id: new mongoose.Types.ObjectId(),
  name: 'test',
})

const text = new TextModel({
  _id: new mongoose.Types.ObjectId(),
  text: '123',
  user_id: user.id,
})
user.text_id = text._id

app.get('/users', async (req, res) => {
  console.log('get users')
  const pageNumber = req.query.pagination ? req.query.pagination.page : 0
  const data = await UserModel.find()
    .sort({ name: req.params.name })
    .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
    .limit(pageSize)
    .populate('text')

  res.json(data)
})

app.get('/:user', async (req, res) => {
  await text.save()
  await user.save()
  try {
    const user = await UserModel.findOne({ name: req.params.user }).lean()
    const text = await TextModel.findOne({ user_id: user._id }).lean()
    user.text = text
    res.json(user)
  } catch (err) {
    res.status(404)
    res.end()
  }
})

app.listen(3000)
