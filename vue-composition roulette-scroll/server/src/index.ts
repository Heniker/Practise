import * as jwt from 'jsonwebtoken'
import * as assert from 'assert'
import * as path from 'path'

import { getUser, updateUser, addUser } from './db/user'
import * as ws from './websocket'

import { nanoid } from 'nanoid'

const userAuthSalt = 'super-secret'
const queuedUsers = new Map()

const gameInterval = 1000 //ms

const genRandomInt = (min: number, max: number) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const generateGame = () => {
  const salt = nanoid()
  const numbers = Array.from(Array(3)).map(() => genRandomInt(0, 9))
  const validity = jwt.sign({ salt, numbers }, salt)
  return {
    numbers,
    salt,
    validity,
  }
}

const retriveGame = (validity, salt) => {
  const result = jwt.decode(validity, salt)
  if (!result) {
    return false
  }

  return result.numbers
}

const checkAuth = (auth) => {
  if (!auth) {
    return false
  }

  try {
    const id = jwt.verify('' + auth, userAuthSalt)
    return id
  } catch (err) {
    return false
  }
}

ws.registerHandler('get_authentication', (client, data) => {
  // save user IP and other info here
  // also implement token refreshing if it can expire

  return jwt.sign('' + addUser({}), userAuthSalt)
})

ws.registerHandler('subscribe_to_game', (client, data) => {
  const id = checkAuth(data.auth)
  assert(id)

  queuedUsers.set(client, id)
  return true
})

// this can be easily done on client side tho ...
ws.registerHandler('retrive_game', (client, data) => {
  return retriveGame(data.validity, data.salt)
})

ws.registerNotifier(
  'game_finished',
  (async function* () {
    while (true) {
      const game = generateGame()

      for (const [clientSymb, clientId] of queuedUsers.entries()) {
        yield { client: clientSymb, data: game }
      }

      queuedUsers.clear()
      await new Promise((res, rej) => setTimeout(res, gameInterval))
    }
  })()
)

ws.startServer(3000)