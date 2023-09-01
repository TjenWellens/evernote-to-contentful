var dependencyTree = require('dependency-tree');

// Returns a dependency tree object for the given file
var tree = dependencyTree({
    filename: './src/index.js',
    directory: './src/',
    filter: path => path.indexOf('node_modules') === -1, // optional
    nonExistent: [], // optional
    noTypeDefinitions: false // optional
});
console.log(JSON.stringify(tree))

// // Returns a post-order traversal (list form) of the tree with duplicate sub-trees pruned.
// // This is useful for bundling source files, because the list gives the concatenation order.
// // Note: you can pass the same arguments as you would to dependencyTree()
// var list = dependencyTree.toList({
//     filename: './index.js',
//     directory: './'
// });