import { findInsertIndex } from './findInsertIndex.js';
import { walkStrategies } from './walkStrategies.js';

/**
 *
 * @param {keyof walkStrategies} strategy
 */
function verifyStrategy(strategy) {
  if (!walkStrategies[strategy]) {
    throw new Error(
      `"${String(strategy)}" is an unknown tree walk strategy. Valid strategies are 'pre' [default], 'post' and 'breadth'.`
    );
  }
}
/**
 * @template T
 */
export class Node {
  /** @type {Node<T> | undefined} */
  parent = undefined;

  /** @type {Node<T>[]} */
  children = [];

  /** @type {import('../types/main').Model<T>} */
  model;

  /**
   * @param {import('../types/main').Config<T>} config
   * @param {import('../types/main').Model<T>} model
   */
  constructor(config, model) {
    this.config = config;
    this.model = model;
  }

  /**
   * @returns {boolean}
   */
  isRoot() {
    return this.parent === undefined;
  }

  hasChildren() {
    return this.children.length > 0;
  }

  /**
   * @param {Node<T>} child
   * @param {number} [insertIndex]
   * @returns
   */
  addChild(child, insertIndex) {
    var index;

    if (!(child instanceof Node)) {
      throw new TypeError('Child must be of type Node.');
    }

    child.parent = this;
    if (!(this.model.children instanceof Array)) {
      this.model.children = [];
    }

    if (typeof this.config.modelComparatorFn === 'function') {
      // Find the index to insert the child
      index = findInsertIndex(this.config.modelComparatorFn, this.model.children, child.model);

      // Add to the model children
      this.model.children.splice(index, 0, child.model);

      // Add to the node children
      this.children.splice(index, 0, child);
    } else {
      if (insertIndex === undefined) {
        this.model.children.push(child.model);
        this.children.push(child);
      } else {
        if (insertIndex < 0 || insertIndex > this.children.length) {
          throw new Error('Invalid index.');
        }
        this.model.children.splice(insertIndex, 0, child.model);
        this.children.splice(insertIndex, 0, child);
      }
    }
    return child;
  }

  /**
   * @param {Node<T>} child
   * @param {number} index
   * @returns {Node<T>}
   */
  addChildAtIndex(child, index) {
    if (this.hasComparatorFunction()) {
      throw new Error('Cannot add child at index when using a comparator function.');
    }

    return this.addChild(child, index);
  }

  /**
   * @param {number} index
   * @returns
   */
  setIndex(index) {
    if (this.hasComparatorFunction()) {
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

    if (this.parent) {
      var oldIndex = this.parent.children.indexOf(this);
      this.parent.children.splice(index, 0, this.parent.children.splice(oldIndex, 1)[0]);
  
      if (this.parent.model && this.parent.model.children) {
        this.parent.model.children.splice(index, 0, this.parent.model.children.splice(oldIndex, 1)[0]);
      }
    }

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

  /**
   * @returns {number}
   */
  getIndex() {
    if (this.isRoot()) {
      return 0;
    }
    return this.parent ? this.parent.children.indexOf(this) : -1;
  }

  /**
   * @param {import('../types/main').Callback<T>} callback
   * @param {Partial<import('../types/main').walkOptions<T>>} options
   */
  walk(callback, { strategy = 'pre' } = {}) {
    verifyStrategy(strategy);
    walkStrategies[strategy](callback, this);
  }

  /**
   * @param {import('../types/main').Callback<T>} predicate
   * @param {Partial<import('../types/main').walkOptions<T>>} options
   * @returns {Node<T>[]}
   */
  all(predicate = () => true, { strategy = 'pre' } = {}) {
    verifyStrategy(strategy);
    /** @type {Node<T>[]} */
    const allNodes = [];
    walkStrategies[strategy]((node) => {
      if (predicate(node)) {
        allNodes.push(node);
      }
      return true;
    }, this);
    return allNodes;
  }

  /**
   * @param {import('../types/main').Callback<T>} predicate
   * @param {Partial<import('../types/main').walkOptions<T>>} options
   * @returns {Node<T> | undefined}
   */
  first(predicate = () => true, { strategy = 'pre' } = {}) {
    verifyStrategy(strategy);
    let firstNode;
    walkStrategies[strategy]((node) => {
      if (predicate(node)) {
        firstNode = node;
        return false;
      }
      return true;
    }, this);
    return firstNode;
  }

  drop() {
    var indexOfChild;
    if (!this.isRoot() && this.parent) {
      indexOfChild = this.parent.children.indexOf(this);
      this.parent.children.splice(indexOfChild, 1);
      if (this.parent.model && this.parent.model.children) {
        this.parent.model.children.splice(indexOfChild, 1);
      }
      this.parent = undefined;
      delete this.parent;
    }
    return this;
  }

  hasComparatorFunction() {
    return typeof this.config.modelComparatorFn === 'function';
  }
}
