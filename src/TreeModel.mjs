import { Node } from './Node.mjs';

function addChildToNode(node, child) {
  child.parent = node;
  node.children.push(child);
  return child;
}

export class TreeModel {
  config = {};

  constructor(config) {
    config = config || {};
    this.config = config;
    this.config.childrenPropertyName = config.childrenPropertyName || 'children';
    this.config.modelComparatorFn = config.modelComparatorFn;
  }

  parse(model) {
    var i, childCount, node;

    if (!(model instanceof Object)) {
      throw new TypeError('Model must be of type object.');
    }

    node = new Node(this.config, model);
    if (model[this.config.childrenPropertyName] instanceof Array) {
      if (this.config.modelComparatorFn) {
        model[this.config.childrenPropertyName].sort(this.config.modelComparatorFn);
      }
      for (
        i = 0, childCount = model[this.config.childrenPropertyName].length;
        i < childCount;
        i++
      ) {
        addChildToNode(node, this.parse(model[this.config.childrenPropertyName][i]));
      }
    }
    return node;
  }
}
