var mergeSort, findInsertIndex;
mergeSort = require('mergesort');
findInsertIndex = require('find-insert-index');

module.exports = (function () {
  'use strict';

  var walkStrategies;

  walkStrategies = {};

  function fromExternal(config, model) {
    var _config, _model;
    if (arguments.length === 1) {
      _config = {};
      _model = config;
    } else {
      _config = config;
      _model = model;
    }
    _config.childrenPropertyName = _config.childrenPropertyName || 'children';
    _config.modelComparatorFn = _config.modelComparatorFn;
    return from(_config, _model);
  }

  function from(config, model) {
    var i, childCount, node;

    if (!(model instanceof Object)) {
      throw new TypeError('Model must be of type object.');
    }

    node = new Node(config, model);
    if (model[config.childrenPropertyName] instanceof Array) {
      if (config.modelComparatorFn) {
        model[config.childrenPropertyName] = mergeSort(
          config.modelComparatorFn,
          model[config.childrenPropertyName]);
      }
      for (i = 0, childCount = model[config.childrenPropertyName].length; i < childCount; i++) {
        _addChildToNode(node, from(config, model[config.childrenPropertyName][i]));
      }
    }
    return node;
  }

  function _addChildToNode(node, child) {
    child.parent = node;
    node.children.push(child);
    return child;
  }

  function Node(config, model) {
    this.config = config;
    this.model = model;
    this.children = [];
  }

  function isRoot(node) {
    return node.parent === undefined;
  }

  function isLeaf(node) {
    return node.children.length === 0;
  }

  function addChild(node, child) {
    var index;

    if (!(child instanceof Node)) {
      throw new TypeError('Child must be of type Node.');
    }

    child.parent = node;
    if (!(node.model[node.config.childrenPropertyName] instanceof Array)) {
      node.model[node.config.childrenPropertyName] = [];
    }

    if (node.config.modelComparatorFn) {
      // Find the index to insert the child
      index = findInsertIndex(
        node.config.modelComparatorFn,
        node.model[node.config.childrenPropertyName],
        child.model);
      // Add to the model children
      node.model[node.config.childrenPropertyName].splice(index, 0, child.model);
      // Add to the node children
      node.children.splice(index, 0, child);
    } else {
      node.model[node.config.childrenPropertyName].push(child.model);
      node.children.push(child);
    }
    return child;
  }

  function path(node) {
    var pathFromRoot = [];
    (function addToPath(node) {
      pathFromRoot.unshift(node);
      if (!isRoot(node)) {
        addToPath(node.parent);
      }
    })(node);
    return pathFromRoot;
  }

  /**
   * Parse the arguments of traversal functions. These functions can take one optional
   * first argument which is an options object. If present, this object will be stored
   * in args.options. The only mandatory argument is the callback function which can
   * appear in the first or second position (if an options object is given). This
   * function will be saved to args.fn. The last argument is the node on which to start
   * the traversal.
   *
   * @returns Parsed arguments.
   */
  function parseArgs(conf, fn, node) {
    var _conf, _fn, _node;

    if (typeof conf === 'function') {
      _conf = {};
      _fn = conf;
      _node = fn;
    } else {
      _conf = conf;
      _fn = fn;
      _node = node;
    }
    if (!_conf.strategy) {
      _conf.strategy = 'pre';
    }
    if (!walkStrategies[_conf.strategy]) {
      throw new Error('Unknown tree walk strategy. Valid strategies are \'pre\' [default], \'post\' and \'breadth\'.');
    }
    return {options: _conf, fn: _fn, node: _node};
  }

  function walk(config, callback, node) {
    var args;
    args = parseArgs(config, callback, node);
    walkStrategies[args.options.strategy](args.fn, args.node);
  }

  walkStrategies.pre = function depthFirstPreOrder(callback, node) {
    var i, childCount, keepGoing;
    keepGoing = callback(node);
    for (i = 0, childCount = node.children.length; i < childCount; i++) {
      if (keepGoing === false) {
        return false;
      }
      keepGoing = depthFirstPreOrder(callback, node.children[i]);
    }
    return keepGoing;
  };

  walkStrategies.post = function depthFirstPostOrder(callback, node) {
    var i, childCount, keepGoing;
    for (i = 0, childCount = node.children.length; i < childCount; i++) {
      keepGoing = depthFirstPostOrder(callback, node.children[i]);
      if (keepGoing === false) {
        return false;
      }
    }
    keepGoing = callback(node);
    return keepGoing;
  };

  walkStrategies.breadth = function breadthFirst(callback, node) {
    var queue = [node];
    (function processQueue() {
      var i, childCount, node;
      if (queue.length === 0) {
        return;
      }
      node = queue.shift();
      for (i = 0, childCount = node.children.length; i < childCount; i++) {
        queue.push(node.children[i]);
      }
      if (callback(node) !== false) {
        processQueue();
      }
    })();
  };

  function all(config, predicate, node) {
    var args, allMatchingPredicate = [];
    args = parseArgs(config, predicate, node);
    walkStrategies[args.options.strategy](function (node) {
      if (args.fn(node)) {
        allMatchingPredicate.push(node);
      }
    }, args.node);
    return allMatchingPredicate;
  }

  function first(config, predicate, node) {
    var args, firstMatchingPredicate;
    args = parseArgs(config, predicate, node);
    walkStrategies[args.options.strategy](function (node) {
      if (args.fn(node)) {
        firstMatchingPredicate = node;
        return false;
      }
    }, args.node);
    return firstMatchingPredicate;
  }

  function drop(node) {
    var indexOfChild;
    if (!isRoot(node)) {
      indexOfChild = node.parent.children.indexOf(node);
      node.parent.children.splice(indexOfChild, 1);
      node.parent.model[node.config.childrenPropertyName].splice(indexOfChild, 1);
      node.parent = undefined;
      delete node.parent;
    }
    return node;
  }

  return {
    from: fromExternal,
    path: path,
    walk: walk,
    all: all,
    drop: drop,
    first: first,
    isRoot: isRoot,
    isLeaf: isLeaf,
    addChild: addChild
  };
})();
