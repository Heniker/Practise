const Readable = require('stream').Readable
const objectView = require('../Tree/views/objectView')
const Tree = require('../Tree/Tree')
const toStringTree = require('./toStringTree')

function createStream(path, includeFiles) {
	const tree = new Tree(path).use(objectView).execute(includeFiles)
	return Readable.from(toStringTree(tree))
}

// createStream('.', true).on('data', console.log)

module.exports = createStream
