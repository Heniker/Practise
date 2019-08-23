const createStream = require('./consoleTree/createStream')

const includeFiles = process.argv.includes('-F')
const path = process.argv[2]

createStream(path, includeFiles).pipe(process.stdout)
