var convexHull = require('monotone-convex-hull-2d')

var points = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
  [0.5, 0.5]
]

console.log(convexHull(points))