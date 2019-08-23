const fetch = require('node-fetch')

test('Correct response', () => {
	fetch(
		'http://localhost:3000/home/mark/Code%20Workplace/web-tree/server/test-data/'
	)
		.then((e) => e.json()).then( (data) => {
			expect(data).toEqueal([
				{
					id: '/home/mark/Code Workplace/web-tree/server/test-data/dist',
					file: '',
					name: 'dist',
					path: '/home/mark/Code Workplace/web-tree/server/test-data',
					children: []
				},
				{
					id: '/home/mark/Code Workplace/web-tree/server/test-data/empty.txt',
					file: '.txt',
					name: 'empty.txt',
					path: '/home/mark/Code Workplace/web-tree/server/test-data'
				},
				{
					id: '/home/mark/Code Workplace/web-tree/server/test-data/src',
					file: '',
					name: 'src',
					path: '/home/mark/Code Workplace/web-tree/server/test-data',
					children: []
				}
			])
		})
})
