export const walkStrategies = {};

walkStrategies.pre = function depthFirstPreOrder(callback, context) {
  var i, childCount, keepGoing;
  keepGoing = callback.call(context, this);
  for (i = 0, childCount = this.children.length; i < childCount; i++) {
    if (keepGoing === false) {
      return false;
    }
    keepGoing = depthFirstPreOrder.call(this.children[i], callback, context);
  }
  return keepGoing;
};

walkStrategies.post = function depthFirstPostOrder(callback, context) {
  var i, childCount, keepGoing;
  for (i = 0, childCount = this.children.length; i < childCount; i++) {
    keepGoing = depthFirstPostOrder.call(this.children[i], callback, context);
    if (keepGoing === false) {
      return false;
    }
  }
  keepGoing = callback.call(context, this);
  return keepGoing;
};

walkStrategies.breadth = function breadthFirst(callback, context) {
  var queue = [this];
  (function processQueue() {
    var i, childCount, node;
    if (queue.length === 0) {
      return;
    }
    node = queue.shift();
    for (i = 0, childCount = node.children.length; i < childCount; i++) {
      queue.push(node.children[i]);
    }
    if (callback.call(context, node) !== false) {
      processQueue();
    }
  })();
};
