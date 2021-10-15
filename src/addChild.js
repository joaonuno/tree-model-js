import { findInsertIndex } from './findInsertIndex.js';
import { hasComparatorFunction } from './hasCompareFunction.js';
import { Node } from './Node.js';

export function addChild(self, child, insertIndex) {
  var index;

  if (!(child instanceof Node)) {
    throw new TypeError('Child must be of type Node.');
  }

  child.parent = self;
  if (!(self.model[self.config.childrenPropertyName] instanceof Array)) {
    self.model[self.config.childrenPropertyName] = [];
  }

  if (hasComparatorFunction(self)) {
    // Find the index to insert the child
    index = findInsertIndex(
      self.config.modelComparatorFn,
      self.model[self.config.childrenPropertyName],
      child.model
    );

    // Add to the model children
    self.model[self.config.childrenPropertyName].splice(index, 0, child.model);

    // Add to the node children
    self.children.splice(index, 0, child);
  } else {
    if (insertIndex === undefined) {
      self.model[self.config.childrenPropertyName].push(child.model);
      self.children.push(child);
    } else {
      if (insertIndex < 0 || insertIndex > self.children.length) {
        throw new Error('Invalid index.');
      }
      self.model[self.config.childrenPropertyName].splice(insertIndex, 0, child.model);
      self.children.splice(insertIndex, 0, child);
    }
  }
  return child;
}
