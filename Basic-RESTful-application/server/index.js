const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const shortId = require('shortid')

const app = express()
const port = 3000
const indexHtmlPath = path.resolve('../client/index.html')

// 'll turn this into an actual DB later
function getComments() {
	return JSON.parse(fs.readFileSync('comments.json', 'utf8'))
}

function saveComments(json) {
	return fs.writeFileSync('comments.json', json, 'utf8')
}

function addComment(userName, text, date, id) {
	const comments = getComments()

	comments[id] = {
		userName,
		text,
		date,
		id,
	}

	saveComments(JSON.stringify(comments))
}

function deleteComment(commentId) {
	const comments = getComments()

	delete comments[commentId]

	saveComments(JSON.stringify(comments))
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('../client'))

app.get('/', function(req, res) {
	console.log('GET /')

	res.writeHead(200, { 'Content-Type': 'text/html' })
	res.sendFile(indexHtmlPath)
})

app.get('/comments', function(req, res) {
	console.log('GET /comments')

	res.writeHead(200, { 'Content-Type': 'json' })
	res.end(JSON.stringify(getComments()))
})

app.post('/comments', function(req, res) {
	console.log('POST /comments')

	addComment(
		req.body.userName || ' ',
		req.body.text || ' ',
		req.body.date || new Date(),
		shortId.generate()
	)

	res.writeHead(200, { 'Content-Type': 'text/html' })
	res.end('thanks')
	return
})

app.delete('/comments', function(req, res) {
	console.log('DELETE /comments')

	deleteComment(req.body.commentId)

	res.writeHead(200, { 'Content-Type': 'text/html' })
	res.end('done')
})

app.listen(port)
console.log(`Listening at http://localhost:${port}`)
