# TreeModel

Manipulate and traverse tree-like structures in javascript.

For download and demos, please [visit TreeModel website](http://jnuno.com/tree-model-js).

[![Build Status](https://travis-ci.org/joaonuno/tree-model-js.svg)](https://travis-ci.org/joaonuno/tree-model-js)
[![Coverage Status](https://coveralls.io/repos/github/joaonuno/tree-model-js/badge.svg?branch=master)](https://coveralls.io/github/joaonuno/tree-model-js?branch=master)

## Installation

### Node

TreeModel is available as an npm module so you can install it with `npm install tree-model` and use it in your script:

```js
var TreeModel = require('tree-model'),
    tree = new TreeModel(),
    root = tree.parse({name: 'a', children: [{name: 'b'}]});
```

#### TypeScript
Type definitions are already bundled with the package, which should just work with npm install.

You can maually find the definition files in the `types` folder.

### Browser

[Visit TreeModel website](http://jnuno.com/tree-model-js) to download browser-ready bundles.

## Questions?

If you have any doubt using this library please post a question on [stackoverflow](http://stackoverflow.com/questions/ask?tags=treemodel) tagged with `treemodel`.

## API Reference

### Create a new TreeModel

Create a new TreeModel with the given options.

```js
var tree = new TreeModel(options)
```

Valid properties for the options object are:

* `childrenPropertyName` - The name for the children array property. Default is `children`;
* `modelComparatorFn` - A comparator function to sort the children when parsing the model and adding children. The default order policy is to keep the parsed order and append new children. The comparator function receives the model for two nodes just like the [Array.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) function. The provided sort algorithm is **stable**.

### Parse the hierarchy object

Parse the given user defined model and return the root Node object.

```js
Node tree.parse(model)
```

### Is Root?

Return `true` if this Node is the root, `false` otherwise.

```js
Boolean node.isRoot()
```

### Has Children?

Return `true` if this Node has one or more children, `false` otherwise.

```js
Boolean node.hasChildren()
```

### Add a child

Add the given node as child of this one. Return the child Node.

```js
Node parentNode.addChild(childNode)
```

### Add a child at a given index

Add the given node as child of this one at the given index. Return the child Node.

```js
Node parentNode.addChildAtIndex(childNode, index)
```

### Set the index of a node among its siblings

Sets the index of the node among its siblings to the given value. Return the node itself.

```js
Node node.setIndex(index)
```

### Get the index of a node among its siblings

Gets the index of the node relative to its siblings. Return the index value.

```js
Int node.getIndex()
```

### Get the node path

Get the array of Nodes representing the path from the root to this Node (inclusive).

```js
Array<Node> node.getPath()
```

### Delete a node from the tree

Drop the subtree starting at this node. Returns the node itself, which is now a root node.

```js
Node node.drop()
```

*Warning* - Dropping a node while walking the tree is not supported. You must first collect the nodes to drop using one of the traversal functions and then drop them. Example:

```js
root.all( /* predicate */ ).forEach(function (node) {
  node.drop();
});
```

### Find a node

Starting from this node, find the first Node that matches the predicate and return it. The **predicate** is a function wich receives the visited Node and returns `true` if the Node should be picked and `false` otherwise.

```js
Node node.first(predicate)
```

### Find all nodes

Starting from this node, find all Nodes that match the predicate and return these.

```js
Array<Node> node.all(predicate)
```

### Walk the tree

Starting from this node, traverse the subtree calling the action for each visited node. The action is a function which receives the visited Node as argument. The traversal can be halted by returning `false` from the action.

```js
node.walk([options], action, [context])
```

**Note** - `first`, `all` and `walk` can optionally receive as first argument an object with traversal options. Currently the only supported option is the traversal `strategy` which can be any of the following:

* `{strategy: 'pre'}` - Depth-first pre-order *[default]*;
* `{strategy: 'post'}` - Depth-first post-order;
* `{strategy: 'breadth'}` - Breadth-first.

These functions can also take, as the last parameter, the *context* on which the action will be called.

## Contributing

### Setup

Fork this repository and run `npm install` on the project root folder to make sure you have all project dependencies installed.

### Code Linting

Run `npm run lint`

This will check both source and tests for code correctness and style compliance.

### Running Tests

Run `npm test`

### Type definitions

To modify the type definitions, look inside the `types` folder. 
`index.d.ts` contains the definition and `tree-model-tests.ts` contains type tests.

To verify changes:

Run `npm run dtslint`.
