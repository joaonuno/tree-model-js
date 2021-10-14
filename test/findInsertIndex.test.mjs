/* global describe, it */

import chai from 'chai';
import { findInsertIndex } from '../src/findInsertIndex.mjs';

const { assert } = chai;

chai.config.includeStack = true;

describe('findInsertIndex', function () {
  'use strict';

  it('should get the index to insert the element in the array according to the comparator', function () {
    var targetArray, comparatorFn;

    comparatorFn = function (a, b) {
      return a.id - b.id;
    };

    targetArray = [
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
      { id: 6 },
      { id: 8 },
      { id: 9 },
      { id: 10 },
      { id: 11 },
      { id: 12 },
      { id: 13 },
      { id: 14 },
      { id: 15 },
    ];

    assert.equal(findInsertIndex(comparatorFn, [], { id: 7 }), 0);
    assert.equal(findInsertIndex(comparatorFn, [{ id: 7 }], { id: 7 }), 1);
    assert.equal(findInsertIndex(comparatorFn, targetArray, { id: 7 }), 7);
  });
});
