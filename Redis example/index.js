// #bug> in case of network connectivity lose for the time longer than TTL -
// unexpected bad things gonna happen - e.g. zombie task handler might spawn, that is
// not correctly displayed in Redis. #NOT_HANDLED_CASE

// Possible degradation of network connection is not handled in this solution.
// It won't be that hard to implement, but the scope of the problem
// is probably out of test-task example

// I know the code looks messy, but I made it easy to refactor with clear dependencies.

const redis = require('redis')
const { promisify } = require('util')
const crypto = require('crypto')

const client = redis.createClient()
const listener = redis.createClient({})

const redisAsync = {}
//#region
redisAsync.incr = promisify(client.incr).bind(client)
redisAsync.set = promisify(client.set).bind(client)
redisAsync.rpush = promisify(client.rpush).bind(client)
redisAsync.lpop = promisify(client.lpop).bind(client)
redisAsync.expire = promisify(client.expire).bind(client)
redisAsync.get = promisify(client.get).bind(client)
redisAsync.lrange = promisify(client.lrange).bind(client)
redisAsync.del = promisify(client.del).bind(client)
redisAsync.zadd = promisify(client.zadd).bind(client)
redisAsync.zrem = promisify(client.zrem).bind(client)
redisAsync.zrank = promisify(client.zrank).bind(client)
//#endregion

if (process.argv[2] === '--getErrors') {
  const extractErrors = () => {
    return redisAsync.lrange('errors', 0, -1)
  }

  extractErrors().then((arg) => {
    redisAsync.del('errors')
    console.log(arg)
    process.exit()
  })
}

const taskThreshold = 10

const local = {
  id: null,
  wantDoTasks: true,
}

const startProvideTasks = (interval) => {
  const getRandomString = () => {
    // not true random, but good enough, i hope
    // generates a random string from 80 to 100 chars
    return crypto.randomBytes(~~(Math.random() * 10) + 41).toString('hex')
  }

  setInterval(() => {
    redisAsync.rpush('tasks', getRandomString())
  }, interval * 1000)
}

const startDoTasks = async (timeout) => {
  /**
   * @param {string} task
   */
  const doTask = (task) => {
    // pretend we're doing some long, non blocking task

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.05) {
          reject() // 5% error
        } else {
          resolve()
        }
      }, task.length * taskThreshold)
    })
  }

  while (true) {
    const task = await redisAsync.lpop('tasks')

    if (!local.wantDoTasks) {
      return false
    }

    if (!task) {
      break
    }

    console.log('Doing task %s:', task)
    try {
      await doTask(task)
    } catch (err) {
      redisAsync.rpush('errors', task)
      console.log('Task rejected %s:', task)
    }
    console.log('Finished task %s:', task)
  }

  console.log('No tasks left. Rescan in %s', timeout)

  setTimeout(startDoTasks.bind(null, timeout), timeout * 1000)
}

const keepAlive = (key, ttl, heartbeat) => {
  setInterval(redisAsync.expire.bind(null, key, ttl), heartbeat)
}

const imGenerator = async (id, ttl, heartbeat, interval) => {
  console.info('I am the new generator with id %s', id)
  await redisAsync.set(`generator`, id)
  keepAlive('generator', ttl, heartbeat)
  local.wantDoTasks = false
  startProvideTasks(interval)
}

/**
 * @param {number} position
 * @param {number} timeout
 */
const maybeTakeover = async (position, timeout, ttl, heartbeat, taskGenInterval) => {
  const takeoverTimeout = position * timeout
  console.info('Takeover attempt in %s', takeoverTimeout)

  setTimeout(async () => {
    const generatorId = await redisAsync.get('generator')
    if (generatorId) {
      console.info('New generator with id %s found. Takeover abort.', generatorId)
    } else {
      imGenerator(position, ttl, heartbeat, taskGenInterval)
    }
  }, takeoverTimeout * 1000)
}

const runtime = Object.freeze({
  clientTTL: 30,
  heartbeat: 5,
  takeoverTimeout: 10,
  taskCheckTimeout: 30,
  taskGenTimeout: 0.5,
})

listener.on('error', (error) => {
  console.error(error)
})
client.on('error', (error) => {
  console.error(error)
})

listener.config('set', 'notify-keyspace-events', 'Kx')
listener.psubscribe('__keyspace*__:*')

listener.on('pmessage', async (_, info) => {
  const key = /:(.*)/.exec(info)[1]
  if (key === 'generator') {
    console.info('Generator dead. Attempt takeover')
    maybeTakeover(
      await redisAsync.zrank('clients', local.id),
      runtime.takeoverTimeout,
      runtime.clientTTL,
      runtime.heartbeat,
      runtime.taskGenTimeout
    )
  } else {
    const id = /client:(.+):/.exec(key)
    redisAsync.zrem('clients', id)
  }
})

//
;(async () => {
  const id = await redisAsync.incr('next_client_id')
  await redisAsync.zadd('clients', id, id)
  local.id = id

  // #optimization> use a single transaction with MULTI
  if (id === 1 || (await redisAsync.get('generator')) === null) {
    imGenerator(id, runtime.clientTTL, runtime.heartbeat, runtime.taskGenTimeout)
  } else {
    startDoTasks(runtime.taskCheckTimeout)
  }

  await redisAsync.set(`client:${id}:alive`, 1)
  keepAlive(`client:${id}:alive`, runtime.clientTTL, runtime.heartbeat)
})()
