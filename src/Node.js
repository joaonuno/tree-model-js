import { addChild } from './addChild.js';
import { hasComparatorFunction } from './hasCompareFunction.js';
import { walkStrategies } from './walkStrategies.js';

/**
 * Parse the arguments of traversal functions. These functions can take one optional
 * first argument which is an options object. If present, this object will be stored
 * in args.options. The only mandatory argument is the callback function which can
 * appear in the first or second position (if an options object is given). This
 * function will be saved to args.fn. The last optional argument is the context on
 * which the callback function will be called. It will be available in args.ctx.
 *
 * @returns Parsed arguments.
 */
function parseArgs() {
  var args = {};
  if (arguments.length === 1) {
    if (typeof arguments[0] === 'function') {
      args.fn = arguments[0];
    } else {
      args.options = arguments[0];
    }
  } else if (arguments.length === 2) {
    if (typeof arguments[0] === 'function') {
      args.fn = arguments[0];
      args.ctx = arguments[1];
    } else {
      args.options = arguments[0];
      args.fn = arguments[1];
    }
  } else {
    args.options = arguments[0];
    args.fn = arguments[1];
    args.ctx = arguments[2];
  }
  args.options = args.options || {};
  if (!args.options.strategy) {
    args.options.strategy = 'pre';
  }
  if (!walkStrategies[args.options.strategy]) {
    throw new Error(
      'Unknown tree walk strategy. Valid strategies are \'pre\' [default], \'post\' and \'breadth\'.'
    );
  }
  return args;
}

function k(result) {
  return function () {
    return result;
  };
}

export class Node {
  constructor(config, model) {
    this.config = config;
    this.model = model;
    this.children = [];
  }

  isRoot() {
    return this.parent === undefined;
  }

  hasChildren() {
    return this.children.length > 0;
  }

  addChild(child) {
    return addChild(this, child);
  }

  addChildAtIndex(child, index) {
    if (hasComparatorFunction(this)) {
      throw new Error('Cannot add child at index when using a comparator function.');
    }

    return addChild(this, child, index);
  }

  setIndex(index) {
    if (hasComparatorFunction(this)) {
      throw new Error('Cannot set node index when using a comparator function.');
    }

    if (this.isRoot()) {
      if (index === 0) {
        return this;
      }
      throw new Error('Invalid index.');
    }

    if (index < 0 || index >= this.parent.children.length) {
      throw new Error('Invalid index.');
    }

    var oldIndex = this.parent.children.indexOf(this);

    this.parent.children.splice(index, 0, this.parent.children.splice(oldIndex, 1)[0]);

    this.parent.model[this.parent.config.childrenPropertyName].splice(
      index,
      0,
      this.parent.model[this.parent.config.childrenPropertyName].splice(oldIndex, 1)[0]
    );

    return this;
  }

  getPath() {
    var path = [];
    (function addToPath(node) {
      path.unshift(node);
      if (!node.isRoot()) {
        addToPath(node.parent);
      }
    })(this);
    return path;
  }

  getIndex() {
    if (this.isRoot()) {
      return 0;
    }
    return this.parent.children.indexOf(this);
  }

  walk() {
    var args;
    args = parseArgs.apply(this, arguments);
    walkStrategies[args.options.strategy].call(this, args.fn, args.ctx);
  }

  all() {
    var args,
      all = [];
    args = parseArgs.apply(this, arguments);
    args.fn = args.fn || k(true);
    walkStrategies[args.options.strategy].call(
      this,
      function (node) {
        if (args.fn.call(args.ctx, node)) {
          all.push(node);
        }
      },
      args.ctx
    );
    return all;
  }

  first() {
    var args, first;
    args = parseArgs.apply(this, arguments);
    args.fn = args.fn || k(true);
    walkStrategies[args.options.strategy].call(
      this,
      function (node) {
        if (args.fn.call(args.ctx, node)) {
          first = node;
          return false;
        }
      },
      args.ctx
    );
    return first;
  }

  drop() {
    var indexOfChild;
    if (!this.isRoot()) {
      indexOfChild = this.parent.children.indexOf(this);
      this.parent.children.splice(indexOfChild, 1);
      this.parent.model[this.config.childrenPropertyName].splice(indexOfChild, 1);
      this.parent = undefined;
      delete this.parent;
    }
    return this;
  }
}
