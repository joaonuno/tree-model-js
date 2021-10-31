import { Node } from './Node.js';

/**
 * @template {Record<string, unknown>} T
 * @template {string} [Key='children']
 * @param {Node<T, Key>} node
 * @param {Node<T, Key>} child
 * @returns {Node<T, Key>}
 */
function addChildToNode(node, child) {
  child.parent = node;
  node.children.push(child);
  return child;
}

/**
 * @template {Record<string, unknown>} TM
 * @template {string} [Key='children']
 */
export class TreeModel {
  /** @type {import('../types/main').Config<TM, Key>} */
  config = {
    childrenPropertyName: /** @type {Key} */ ('children'),
  };

  /**
   * @param {Partial<import('../types/main').Config<TM, Key>>} config
   */
  constructor(config = {}) {
    this.config = { ...this.config, ...config };
  }

  /**
   * @param {import('../types/main').Model<TM, Key>} model 
   * @returns {Node<TM, Key>}
   */
  parse(model) {
    var i, childCount, node;

    if (!(model instanceof Object)) {
      throw new TypeError('Model must be of type object.');
    }
    const childProp = this.config.childrenPropertyName;

    node = new Node(this.config, model);
    if (model[childProp] instanceof Array) {
      if (this.config.modelComparatorFn) {
        model[childProp].sort(this.config.modelComparatorFn);
      }
      for (
        i = 0, childCount = model[childProp].length;
        i < childCount;
        i++
      ) {
        addChildToNode(node, this.parse(model[childProp][i]));
      }
    }
    return node;
  }
}
