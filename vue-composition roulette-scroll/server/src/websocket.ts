import * as assert from 'assert'
import * as WebSocket from 'ws'

type HandlerT = (client: symbol, data: any, id?: number | null) => any

//#region constants
const connectionCheckInterval = 30000 // ms
const connectionTTL = 10000 // ms
//#endregion

let wss: WebSocket.Server | null = null

const localClients: Record<symbol, WebSocket> = {}

const typeHandlers: { [s: string]: HandlerT[] } = { connection: [], close: [] }

const executeHandlers = (
  connectionSymbol: symbol,
  type: string,
  body: any,
  id: number | null,
  ws: WebSocket
) => {
  if (!typeHandlers[type]) {
    console.warn('WebSocket message was not handled for type: %s', type)
    return
  }

  typeHandlers[type].forEach(async (it) => {
    try {
      const result = await it(connectionSymbol, body, id)

      if (!result || ['connection', 'close'].includes(type)) {
        return
      }

      ws.send(
        JSON.stringify({
          type,
          body: result,
          success: true,
          id: id || null,
        })
      )
    } catch (err) {
      if (['connection', 'close'].includes(type)) {
        return
      }

      ws.send(
        JSON.stringify({
          type,
          body: err.message,
          success: false,
          id: id || null,
        })
      )
    }
  })
}

const keepAlive = (connectionSymbol: symbol, ws: WebSocket) => {
  let checkAliveIntervalId: NodeJS.Timeout
  let timeoutId: NodeJS.Timeout

  const handleDeath = () => {
    delete localClients[connectionSymbol]
    ws.terminate()
    executeHandlers(connectionSymbol, 'close', {}, null, ws)
    globalThis.clearInterval(checkAliveIntervalId)
    globalThis.clearTimeout(timeoutId)
  }

  ws.on('close', handleDeath)

  {
    const checkAliveOrKill = () => {
      timeoutId = globalThis.setTimeout(handleDeath, connectionTTL)
      ws.ping()

      ws.once('pong', () => {
        globalThis.clearTimeout(timeoutId)
      })
    }

    checkAliveIntervalId = globalThis.setInterval(checkAliveOrKill, connectionCheckInterval)
  }
}

const onstratup = () => {
  assert(wss)

  wss.on('connection', (ws) => {
    const connectionSymbol = Symbol('Connection')

    localClients[connectionSymbol] = ws

    executeHandlers(connectionSymbol, 'connection', {}, null, ws)

    ws.on('message', (message) => {
      let parsedMessage: any = null

      try {
        const messageStr = message.toString()
        parsedMessage = messageStr && messageStr.length ? JSON.parse(messageStr) : {}
      } catch (err) {
        console.warn('Client sent corrupt data:')
        console.warn(message)
        return
      }

      executeHandlers(
        connectionSymbol,
        parsedMessage.type,
        parsedMessage.data,
        parsedMessage.id,
        ws
      )
    })

    ws.on('close', () => {
      executeHandlers(connectionSymbol, 'close', {}, null, ws)
    })

    keepAlive(connectionSymbol, ws)
  })
}

const send = (clientSymb: symbol, message: any, type): boolean => {
  assert(clientSymb, 'No client provided. Use broadcast to send message to all clients')

  const body = message

  if (localClients[clientSymb]) {
    localClients[clientSymb].send(JSON.stringify({ body, type, success: true }))
    return true
  } else {
    return false
  }
}

const broadcast = (message: any, type: string) => {
  assert(type)
  assert(wss)

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ body: message, type, success: true }))
    }
  })
}


const registerNotifier = (
  messageType: string,
  iterable: AsyncIterable<{ client: symbol; data: any }>
) => {
  const startWork = async () => {
    for await (const result of iterable) {
      send(result.client, result.data, messageType)
    }
  }
  startWork()
}

const registerGlobalNotifier = (messageType: string, iterable: AsyncIterable<any>) => {
  const startWork = async () => {
    for await (const result of iterable) {
      broadcast(result, messageType)
    }
  }
  startWork()
}

const registerHandler = (messageType: string, handler: HandlerT) => {
  assert(messageType)
  assert(handler)

  if (typeHandlers[messageType]) {
    typeHandlers[messageType].push(handler)
  } else {
    typeHandlers[messageType] = [handler]
  }
}

const getClientInfo = (clientSymb) => {
  throw new Error('Not implemented')
  // do not return localClients[clientSymb] !
  // instead serialize data and return only what shall be required
}

const startServer = (port: number) => {
  wss = new WebSocket.Server({ port })
  console.log('WebSocket server is listenening on port %s', port)

  onstratup()
}

export {
  registerNotifier,
  registerGlobalNotifier,
  registerHandler,
  getClientInfo,
  startServer
}
