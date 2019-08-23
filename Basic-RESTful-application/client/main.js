const name = document.querySelector('#name')
const message = document.querySelector('#message')
const commentsFeed = document.querySelector('#comments-feed')
const deleteButtons = document.querySelectorAll('.delete')
const sumbitButton = document.getElementsByClassName('button')[0]

let captchaStatus = null

window.captchaOk = function() {
	captchaStatus = 'ok'
}

function removeComment(comment) {
	comment.remove()

	fetch('/comments', {
		method: 'DELETE',
		body: JSON.stringify({
			type: 'deleteComment',
			commentId: comment.dataset.id,
		}),
		headers: { 'Content-Type': 'application/json' },
	})
}

function saveNewComment() {
	return fetch('/comments', {
		method: 'POST',
		body: JSON.stringify({
			userName: name.value,
			text: message.value,
			date: null,
		}),
		headers: { 'Content-Type': 'application/json' },
	})
}

function getComments() {
	return fetch('/comments', {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
	})
}

function showComment(comment) {
	commentsFeed.insertAdjacentHTML(
		'afterbegin',
		`
<div class="comment" data-id=${comment.id}>

<header>
	<div class="user-name">
		${comment.userName}
	</div>
	<div class="date">
		<!-- 20.04.2019 в 19:00 -->
		${new Date(comment.date)
			.toLocaleDateString('ru', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
			})
			.replace(',', ' в')}
	</div>
</header>

<div class="text">
	${comment.text}
</div>
<footer>
	<span class="delete">Удалить</span>
</footer>
</div>
`
	)
}

function showNewComments() {
	getComments()
		.then((e) => e.text())
		.then((e) => {
			const comments = JSON.parse(e)
			const keys = Object.keys(comments)

			while (keys.length > commentsFeed.children.length) {
				showComment(comments[keys[commentsFeed.children.length]])
			}
		})
}

sumbitButton.addEventListener('click', (event) => {
	event.preventDefault()

	if (captchaStatus === 'ok') {
		saveNewComment()
			// .then((e) => e.text())
			.then(() => {
				showNewComments()
			})
	} else {
		alert('Please check Captcha')
	}
})

commentsFeed.addEventListener('click', (event) => {
	if (event.target.classList.contains('delete')) {
		removeComment(event.target.closest('div'))
	}
})

window.addEventListener('DOMContentLoaded', () => {
	showNewComments()
})
