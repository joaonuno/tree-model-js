/**
 * Find the index to insert an element in array keeping the sort order.
 *
 * @param {function} comparatorFn The comparator function which sorted the array.
 * @param {array} arr The sorted array.
 * @param {object} el The element to insert.
 */
export function findInsertIndex(comparatorFn, arr, el) {
  var i, len;
  for (i = 0, len = arr.length; i < len; i++) {
    if (comparatorFn(arr[i], el) > 0) {
      break;
    }
  }
  return i;
}
