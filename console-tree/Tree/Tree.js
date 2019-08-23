const fs = require('fs')

class Tree {
	constructor(currentDir = process.cwd()) {
		this.currentDir = currentDir

		this._parser = (arg) => arg // can be moved out of constructor
	}

	static parseDirectory(path) {
		const files = fs.readdirSync(path)
		const result = {}

		files.forEach((name) => {
			const fsStat = fs.statSync(path + '/' + name)

			if (fsStat.isFile()) {
				result[name] = {
					stat: {
						isFile: true,
						size: fsStat.size
					},
					children: false,
				}
			} else {
				result[name] = {
					stat: {
						isFile: false,
						size: false,
					},
					children: true,
				}
			}
		})

		return result
	}

	setDirectory(path) {
		this.currentDir = path
		return this
	}

	use(func) {
		this._parser = func
		return this
	}

	execute(includeFiles = true) {
		return this._parser(this._default(includeFiles))
	}

	_default(includeFiles = true) {
		const recursiveCheck = (path, obj) => {
			if (!path) {
				return
			}

			for (let i in obj) {
				if (!obj[i].stat.isFile) {
					obj[i].children = Tree.parseDirectory(path + '/' + i)
					recursiveCheck(path + '/' + i, obj[i].children)
				} else {
					if (!includeFiles) {
						delete obj[i]
					}
				}
			}

			return obj
		}

		return recursiveCheck(this.currentDir, Tree.parseDirectory(this.currentDir))
	}
}

module.exports = Tree
