function convertObj(obj, path) {
	const result = []

	for (let i in obj) {
		const currFile = result[result.push({}) - 1]
		const file = /\..+$/.exec(i)

		currFile.id = path + i
		currFile.file = file ? file[0] : ''
		currFile.name = i
		currFile.path = path

		if (!obj[i].isFile) {
			currFile.children = []
		}
	}

	return result
}

module.exports = convertObj
