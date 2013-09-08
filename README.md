# TreeModel

Manipulate and traverse tree-like structures in javascript.

For download and demos, please [visit TreeModel website](http://jnuno.com/tree-model-js).

## Installation

### Node
TreeModel is available as an npm module so you can install it with `npm install tree-model` and use it in your script:

```
var TreeModel = require('tree-model'),
    tree = new TreeModel(),
    root = tree.parse({name: 'a', children: [{name: 'b'}]});
```

### Browser
#### Using [requirejs](http://requirejs.org/)
```
<script src="path/to/require.js"></script>
<script>
    require(["path/to/TreeModel"], function(TreeModel) {
        var tree = new TreeModel(),
            root = tree.parse({name: 'a', children: [{name: 'b'}]});
    });
</script>
```
#### As a global variable
```
<script src="path/to/TreeModel.js"></script>
<script>
    var tree = new TreeModel(),
        root = tree.parse({name: 'a', children: [{name: 'b'}]});
</script>
```

## API Reference
#### `var tree = new TreeModel(options)`
<p>Create a new TreeModel with the given options.</p>
Valid properties for the options object are:

* `childrenPropertyName` - The name for the children array property. Default is `children`;
* `modelComparatorFn` - A comparator function to sort the children when parsing the model and adding children. The default order policy is to keep the parsed order and append new children. The comparator function receives the model for two nodes just like the [Array.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) function. The provided sort algorithm is **stable**.

#### `Node tree.parse(model)`
<p>Parse the given user defined model and return the root Node object.</p>
#### `Boolean node.isRoot()`
<p>Return `true` if this Node is the root, `false` otherwise.</p>
#### `Node node.addChild(node)`
<p>Add the given node as child of this one. Return the child Node.</p>
#### `Array<Node> node.getPath()`
<p>Get the array of Nodes representing the path from the root to this Node (inclusive).</p>
#### `Node node.drop()`
<p>Drop the subtree starting at this node. Returns the node itself, which is now a root node.</p>
#### `Node node.first(predicate)`
<p>Starting from this node, find the first Node that matches the predicate and return it.</p><p>The **predicate** is a function wich receives the visited Node and returns `true` if the Node should be picked and `false` otherwise.</p>
#### `Array<Node> node.all(predicate)`
<p>Starting from this node, find all Nodes that match the predicate and return these.</p>
#### `node.walk(action)`
<p>Starting from this node, traverse the subtree calling the action for each visited node. The action is a function which receives the visited Node as argument. The traversal can be halted by returning `false` from the action.</p>
<br />
**Note** - `first`, `all` and `walk` can optionally receive as first argument an object with traversal options. Currently the only supported option is the traversal `strategy` which can be any of the following:

* `{strategy: 'pre'}` - Depth-first pre-order *[default]*;
* `{strategy: 'post'}` - Depth-first post-order;
* `{strategy: 'breadth'}` - Breadth-first.

## Contributing
#### Running Tests

The tests require npm libraries mocha, chai, and sinon. To install them run: `npm install`

To run tests, type: `npm test`

#### Code Linting
Install [jshint](http://jshint.com): `npm install -g jshint`

Check src and tests: `jshint src/TreeModel.js test/test.js`

<br />
[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/joaonuno/tree-model-js/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
