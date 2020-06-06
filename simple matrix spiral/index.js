function spiral(matrix) {
  const arr = []

  while (matrix.length) {
    arr.push(
      ...(matrix.pop() || []),
      ...matrix.map((a) => a.pop() || []).reverse(),
      ...(matrix.shift() || []).reverse(),
      ...matrix.map((a) => a.shift())
    )
  }
  return arr.reverse()
}
