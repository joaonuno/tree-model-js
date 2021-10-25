import { Node } from './Node.js';

/**
 * @template T
 * @param {Node<T>} node
 * @param {Node<T>} child
 * @returns {Node<T>}
 */
function addChildToNode(node, child) {
  child.parent = node;
  node.children.push(child);
  return child;
}

/**
 * @template T
 */
export class TreeModel {
  /** @type {import('../types/main').Config<T>} */
  config = {
    //childrenPropertyName: /** @type {keyof import('../types/main').Model<T>} */ ('children'),
  };

  /**
   * @param {Partial<import('../types/main').Config<T>>} config
   */
  constructor(config = {}) {
    this.config = { ...this.config, ...config };
  }

  /**
   * @param {import('../types/main').Model<T>} model 
   * @returns {Node<T>}
   */
  parse(model) {
    var i, childCount, node;

    if (!(model instanceof Object)) {
      throw new TypeError('Model must be of type object.');
    }

    node = new Node(this.config, model);
    if (model.children instanceof Array) {
      if (this.config.modelComparatorFn) {
        model.children.sort(this.config.modelComparatorFn);
      }
      for (
        i = 0, childCount = model.children.length;
        i < childCount;
        i++
      ) {
        addChildToNode(node, this.parse(model.children[i]));
      }
    }
    return node;
  }
}
