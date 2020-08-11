import { send, listen } from './index'
import assert from 'assert'

const getAuth = () => send('get_authentication', {})

const subscribeToGame = (auth) => send('subscribe_to_game', { auth })

const getGameResults = (): Promise<{
  numbers: number[]
  salt: string
  validity: string
}> => {
  const promise = new Promise((res, rej) => {
    listen('game_finished', res, { once: true })
  })

  return promise as Promise<any>
}

const retriveGame = (validity: string, salt: string): Promise<number[]> => {
  return send('retrive_game', { validity, salt }) as Promise<any>
}

export { getAuth, subscribeToGame, getGameResults, retriveGame }
