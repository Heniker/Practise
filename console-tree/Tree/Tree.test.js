const Tree = require('./Tree')

const relPath = './Tree/test-data'

/*__ Tree.parseDirectory __*/

test('Tree.parseDirectory() is Object', () => {
	expect(Tree.parseDirectory(relPath)).toBeObject()
})

test('Tree.parseDirectory()[any] is Object', () => {
	expect(Tree.parseDirectory(relPath).dist).toBeObject()
})

test('Tree.parseDirectory()[any] contains stat', () => {
	expect(Tree.parseDirectory(relPath).dist).toContainKey('stat')
	expect(Tree.parseDirectory(relPath).dist.stat).toBeObject()
})

test('Tree.parseDirectory()[any] contains children', () => {
	expect(Tree.parseDirectory(relPath).dist).toContainKey('children')
	expect(Tree.parseDirectory(relPath).dist.children).toBeBoolean()
})

test('Tree.parseDirectory()[any].stat contains isFile', () => {
	const stat = Tree.parseDirectory(relPath).dist.stat
	expect(stat).toContainKey('isFile')
	expect(stat.isFile).toBeBoolean()
})

test('Tree.parseDirectory()[any].stat contains size', () => {
	const stat = Tree.parseDirectory(relPath).dist.stat
	expect(stat).toContainKey('size')
	expect(Number.isInteger(stat.size) || stat.size === false).toBeTrue()
})

test('Tree.parseDirectory()[file].stat contains correct size', () => {
	const size1 = Tree.parseDirectory(relPath)['empty.txt'].stat.size
	const size2 = Tree.parseDirectory(relPath + '/src')['zzz.txt'].stat.size

	expect(size1).toBe(0)
	expect(size2).toBe(21)
})

/*__ new Tree().execute __*/

test('Tree.parseDirectory(path)[file].stat equeal to new Tree(path).execute[file].stat ', () => {
	const staticStat = Tree.parseDirectory(relPath).dist.stat
	const instanceStat = new Tree(relPath).execute().dist.stat
	expect(staticStat).toEqual(instanceStat)
})

test('Tree.parseDirectory(path)[file].isFile equeal to new Tree(path).execute[file].isFile ', () => {
	const staticIsFile = Tree.parseDirectory(relPath).dist.isFile
	const instanceIsFile = new Tree(relPath).execute().dist.isFile
	expect(staticIsFile).toEqual(instanceIsFile)
})

test('new Tree().execute(true).children contains correct keys', () => {
	const children = new Tree(relPath).execute(true)
	expect(children).toContainAllKeys(['dist', 'empty.txt', 'src'])
})

test('new Tree().execute(false).children contains correct keys', () => {
	const children = new Tree(relPath).execute(false)
	expect(children).toContainAllKeys(['dist', 'src'])
})
