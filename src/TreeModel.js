import { Node } from './Node.js';

/**
 * @template {Record<string, unknown>} T
 * @template {string | keyof T} [Key='children']
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
 * @template {string | keyof TM} [Key='children']
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
    const children = model[this.config.childrenPropertyName];

    node = new Node(this.config, model);
    if (children instanceof Array) {
      if (this.config.modelComparatorFn) {
        children.sort(this.config.modelComparatorFn);
      }
      for (
        i = 0, childCount = children.length;
        i < childCount;
        i++
      ) {
        addChildToNode(node, this.parse(children[i]));
      }
    }
    return node;
  }
}
