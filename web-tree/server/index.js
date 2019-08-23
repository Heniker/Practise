const express = require('express')
const bodyParser = require('body-parser')
const Tree = require('./Tree')
const convertObj = require('./convertObj')
const cors = require('cors')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

app.get('/favicon.ico', function(req, res) {
	res.send('Go away')
})

app.get('/*', function(req, res) {
	console.log('GET /*')

	const path = decodeURIComponent('/' + /.*?\/(.*$)/.exec(req.url)[1])
	console.log(path)

	res.send(convertObj(Tree.parseDirectory(path), path))
})

app.listen(3000)

console.log('Server listening on port 3000')
