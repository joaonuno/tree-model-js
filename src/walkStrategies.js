/**
 * @template T
 * @param {import('../types/main').Callback<T>} callback
 * @param {import('./Node.js').Node<T>} model
 * @returns {boolean}
 */
function pre(callback, model) {
  var i, childCount, keepGoing;
  keepGoing = callback(model);
  for (i = 0, childCount = model.children.length; i < childCount; i++) {
    if (keepGoing === false) {
      return false;
    }
    keepGoing = pre(callback, model.children[i]);
  }
  return keepGoing;
}

/**
 * @template T
 * @param {import('../types/main').Callback<T>} callback
 * @param {import('./Node.js').Node<T>} model
 * @returns {boolean}
 */
function post(callback, model) {
  var i, childCount, keepGoing;
  for (i = 0, childCount = model.children.length; i < childCount; i++) {
    keepGoing = post(callback, model.children[i]);
    if (keepGoing === false) {
      return false;
    }
  }
  keepGoing = callback(model);
  return keepGoing;
}

/**
 * @template T
 * @param {import('../types/main').Callback<T>} callback
 * @param {import('./Node.js').Node<T>} model
 */
function breadth(callback, model) {
  var queue = [model];
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
}

/**
 * @template T
 * @type {import('../types/main').walkStrategies<T>} */
export const walkStrategies = {
  pre,
  post,
  breadth,
};
