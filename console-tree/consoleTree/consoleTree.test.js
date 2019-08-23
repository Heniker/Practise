const consoleTreeSteam = require('./createStream')

test('correct string with excluded files', () => {
	const treeStream = consoleTreeSteam('./Tree/test-data', false)
	let data = ''

	treeStream.on('data', (e) => (data += e))
	// treeStream.on('data', console.log)

	treeStream.on('end', () => {
		expect(data).toBe(
			`├─ dist
│  ├─ css
│  ├─ html
│  └─ js
└─ src
   └─ vue
`
		)
	})
})

test('correct string with included files', () => {
	const treeStream = consoleTreeSteam('./Tree/test-data', true)
	let data = ''

	treeStream.on('data', (e) => (data += e))

	treeStream.on('end', () => {
		expect(data).toBe(
			`├─ dist
│  ├─ css
│  │  └─ app.css (14b)
│  ├─ html
│  │  └─ index.html (15b)
│  └─ js
│     └─ app.js (13b)
├─ src
│  ├─ vue
│  │  └─ main.js (20b)
│  └─ zzz.txt (21b)
└─ empty.txt (empty)
`
		)
	})
})
