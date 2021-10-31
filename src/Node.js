import { findInsertIndex } from './findInsertIndex.js';
import { walkStrategies } from './walkStrategies.js';

/**
 * @param {keyof walkStrategies} strategy
 */
function verifyStrategy(strategy) {
  if (!walkStrategies[strategy]) {
    throw new Error(
      `"${String(
        strategy
      )}" is an unknown tree walk strategy. Valid strategies are 'pre' [default], 'post' and 'breadth'.`
    );
  }
}
/**
 * @template {Record<string, unknown>} TN
 * @template {string} [Key='children']
 */
export class Node {
  /** @type {Node<TN, Key> | undefined} */
  parent = undefined;

  /** @type {Node<TN, Key>[]} */
  children = [];

  /** @type {import('../types/main').Model<TN, Key>} */
  model;

  /**
   * @param {import('../types/main').Config<TN, Key>} config
   * @param {import('../types/main').Model<TN, Key>} model
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

  /**
   * @returns {boolean}
   */
  hasChildren() {
    return this.children.length > 0;
  }

  /**
   * @param {Node<TN, Key>} child
   * @param {number} [insertIndex]
   * @returns
   */
  addChild(child, insertIndex) {
    var index;

    if (!(child instanceof Node)) {
      throw new TypeError('Child must be of type Node.');
    }

    const childProp = this.config.childrenPropertyName;

    child.parent = this;
    if (!(this.model[childProp] instanceof Array)) {
      this.model[childProp] = [];
    }

    if (typeof this.config.modelComparatorFn === 'function') {
      // Find the index to insert the child
      index = findInsertIndex(this.config.modelComparatorFn, this.model[childProp], child.model);

      // Add to the model children
      this.model[childProp].splice(index, 0, child.model);

      // Add to the node children
      this.children.splice(index, 0, child);
    } else {
      if (insertIndex === undefined) {
        this.model[childProp].push(child.model);
        this.children.push(child);
      } else {
        if (insertIndex < 0 || insertIndex > this.children.length) {
          throw new Error('Invalid index.');
        }
        this.model[childProp].splice(insertIndex, 0, child.model);
        this.children.splice(insertIndex, 0, child);
      }
    }
    return child;
  }

  /**
   * @param {Node<TN, Key>} child
   * @param {number} index
   * @returns {Node<TN, Key>}
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

      const childProp = this.config.childrenPropertyName;
      if (this.parent.model && this.parent.model[childProp]) {
        this.parent.model[childProp].splice(
          index,
          0,
          this.parent.model[childProp].splice(oldIndex, 1)[0]
        );
      }
    }

    return this;
  }

  /**
   * @returns {Node<TN, Key>[]}
   */
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
   * @param {import('../types/main').Callback<TN, Key>} callback
   * @param {Partial<import('../types/main').walkOptions<TN, Key>>} options
   */
  walk(callback, { strategy = 'pre' } = {}) {
    verifyStrategy(strategy);

    /** @type {import('../types/main').Strategy<TN, Key>} */
    const strategyFn = walkStrategies[strategy];
    strategyFn(callback, this);
  }

  /**
   * @param {import('../types/main').Callback<TN, Key>} predicate
   * @param {Partial<import('../types/main').walkOptions<TN, Key>>} options
   * @returns {Node<TN, Key>[]}
   */
  all(predicate = () => true, { strategy = 'pre' } = {}) {
    verifyStrategy(strategy);
    /** @type {Node<TN, Key>[]} */
    const allNodes = [];
    /** @type {import('../types/main').Strategy<TN, Key>} */
    const strategyFn = walkStrategies[strategy];
    strategyFn((node) => {
      if (predicate(node)) {
        allNodes.push(node);
      }
      return true;
    }, this);
    return allNodes;
  }

  /**
   * @param {import('../types/main').Callback<TN, Key>} predicate
   * @param {Partial<import('../types/main').walkOptions<TN, Key>>} options
   * @returns {Node<TN, Key> | undefined}
   */
  first(predicate = () => true, { strategy = 'pre' } = {}) {
    verifyStrategy(strategy);
    let firstNode;
    /** @type {import('../types/main').Strategy<TN, Key>} */
    const strategyFn = walkStrategies[strategy];
    strategyFn((node) => {
      if (predicate(node)) {
        firstNode = node;
        return false;
      }
      return true;
    }, this);
    return firstNode;
  }

  /**
   * @returns {Node<TN, Key>}
   */
  drop() {
    if (!this.isRoot() && this.parent) {
      const indexOfChild = this.parent.children.indexOf(this);
      this.parent.children.splice(indexOfChild, 1);
      const childProp = this.config.childrenPropertyName;
      if (this.parent.model && this.parent.model[childProp]) {
        this.parent.model[childProp].splice(indexOfChild, 1);
      }
      this.parent = undefined;
      delete this.parent;
    }
    return this;
  }

  /**
   * @returns {boolean}
   */
  hasComparatorFunction() {
    return typeof this.config.modelComparatorFn === 'function';
  }
}
