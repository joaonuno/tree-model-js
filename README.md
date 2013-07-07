# TreeModel

Manipulate and traverse tree-like structures in javascript.

For download, API and demos, please [visit tree-model-js website](http://jnuno.com/tree-model-js).

## Instalation

### Node
TreeModel is available as a npm module so you can install it with `npm install tree-model` and use it in your script:

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

## Configuration
You can pass the property name of the children array and a comparator function to be used by `parse` and by `addChild`:
```
var tree = new TreeModel({
    // Default is 'children'
    childrenPropertyName: 'dependencies',
    modelComparatorFn: function (a, b) {
        // Reverse order by name
        return a.name < b.name;
    }
});
```