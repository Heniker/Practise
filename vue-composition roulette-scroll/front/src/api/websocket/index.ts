import assert from 'assert'

interface ReponseI {
  body: any
  id: number
  success: true | false
  type: string
}

interface ResponseOkI extends ReponseI {
  success: true
}

interface ReponseErrI extends ReponseI {
  success: false
}

class WSConnectionError extends Error {
  constructor(message: string | undefined) {
    super(message)
    this.name = 'WebSocketConnectionError'
  }
}

class WSResponseError extends Error {
  constructor(message: string | undefined) {
    super(message)
    this.name = 'WebSocketResponseError'
  }
}

const ws = new WebSocket('ws://localhost:3000')

const activeMessages = {}

const handlers: Record<
  string,
  [{
    handle: (any) => never
    opts?: { once: boolean }
  }]
> = {}

const checkReadyState = () => {
  let retryCount = 0

  const check = async () => {
    if (retryCount > 4 || [ws.CLOSED, ws.CLOSING].includes(ws.readyState)) {
      console.warn('WS connection error')
      console.log(ws)
      return false
    }

    if (ws.readyState === ws.OPEN) {
      return true
    }

    await new Promise((res, rej) => {
      setTimeout(res, 300)
    })

    retryCount++
    return check()
  }

  return check()
}

ws.addEventListener('message', (message) => {
  let data: ResponseOkI | ReponseErrI | null = null

  try {
    data = JSON.parse(message.data)
  } catch (err) {
    console.warn('Non JSON server reponse')
    return
  }

  if (!data) {
    return false
  }

  const value = data

  if (activeMessages[value.id]) {
    value.success
      ? activeMessages[value.id].resolve(value.body)
      : activeMessages[value.id].reject(new WSResponseError(value.body))
  }

  value.success &&
    handlers[value.type] &&
    handlers[value.type].forEach((it) => {
      it.handle(value.body)
      if (it.opts?.once) {
        handlers[value.type].slice(handlers[value.type].indexOf(it), 1)
      }
    })
})

/**
 * @param {Object} data
 */
const send = async (type: string, data: any) => {
  if (!(await checkReadyState())) {
    throw new WSConnectionError('No websocket connection')
  }
  const id = Math.floor(Math.random() * 1000)

  ws.send(JSON.stringify({ data, type, id }))

  return new Promise((resolve, reject) => {
    activeMessages[id] = { resolve, reject }
  })
}

//

const listen = (messageType: string, handle: any, opts?: { once: boolean }) => {
  if (Array.isArray(handlers[messageType])) {
    handlers[messageType].push({ handle, opts })
  } else {
    handlers[messageType] = [{ handle, opts }]
  }

}

export { send, listen }
