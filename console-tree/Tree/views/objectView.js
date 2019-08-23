function toObject(obj) {
	for (let i in obj) {
		if (!obj[i].children) {
			obj[i + ` (${obj[i].stat.size ? obj[i].stat.size + 'b' : 'empty'})`] = {}
			delete obj[i]
		} else {
			obj[i] = obj[i].children
			toObject(obj[i])
		}
	}

	return obj
}

module.exports = toObject
