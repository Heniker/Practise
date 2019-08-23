function* toStringTree(tree) {
	const ctx = {
		joined: true,
		spacerNoNeighbour: '   ',
		spacerNeighbour: '│  ',
		keyNoNeighbour: '└─ ',
		keyNeighbour: '├─ ',
	}

	const neighbours = []
	const keys = Object.keys(tree)
		.reverse()
		.map((k) => [k])
	const lookup = [tree]

	while (keys.length !== 0) {
		const key = keys.pop()
		const node = lookup[key.length - 1][key[key.length - 1]]

		neighbours[key.length - 1] =
			keys.length !== 0 && keys[keys.length - 1].length === key.length
		yield [
			neighbours
				.slice(0, key.length - 1)
				.map((n) => (n ? ctx.spacerNeighbour : ctx.spacerNoNeighbour))
				.join(''),
			neighbours[key.length - 1] ? ctx.keyNeighbour : ctx.keyNoNeighbour,
			key[key.length - 1],
			['boolean', 'string', 'number'].includes(typeof node) ? `: ${node}` : '',
		].join('') + '\n'

		if (node instanceof Object && !Array.isArray(node)) {
			keys.push(
				...Object.keys(node)
					.reverse()
					.map((k) => key.concat(k))
			)
			lookup[key.length] = node
		}
	}
}

module.exports = toStringTree
