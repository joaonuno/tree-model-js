export function hasComparatorFunction(node) {
  return typeof node.config.modelComparatorFn === 'function';
}
