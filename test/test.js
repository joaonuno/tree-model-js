/* global describe, it, beforeEach */

var chai, assert, sinon, spy, treeModel, _;
chai = require('chai');
sinon = require('sinon');
spy = sinon.spy;
treeModel = require('..');
_ = require('underscore');
assert = chai.assert;
chai.config.includeStack = true;

describe('TreeModel', function () {
  'use strict';

  function idEq(id) {
    return function (node) {
      return node.model.id === id;
    };
  }

  describe('with default configuration', function () {
    describe('from()', function () {
      function makeFrom(model) {
        return function () {
          return treeModel.from(model);
        };
      }

      it('should throw an error when model is a number (not an object)', function () {
        assert.throws(makeFrom(1), TypeError, 'Model must be of type object.');
      });

      it('should throw an error when model is a string (not an object)', function () {
        assert.throws(makeFrom('string'), TypeError, 'Model must be of type object.');
      });

      it('should throw an error when some child in the model is not an object', function () {
        assert.throws(makeFrom({children: ['string']}), TypeError, 'Model must be of type object.');
      });

      it('should create a root node when given a model without children', function () {
        var root;

        root = treeModel.from({id: 1});

        assert.isUndefined(root.parent);
        assert.isArray(root.children);
        assert.lengthOf(root.children, 0);
        assert.deepEqual(root.model, {id: 1});
      });

      it('should create a root and the respective children when given a model with children', function () {
        var root, node12;

        root = treeModel.from({
          id: 1,
          children: [
            {
              id: 11,
              children: [{id: 111}]
            },
            {
              id: 12,
              children: [
                {id: 121},
                {id: 122},
                {id: 123},
                {id: 124},
                {id: 125},
                {id: 126},
                {id: 127},
                {id: 128},
                {id: 129},
                {id: 1210},
                {id: 1211}
              ]
            }
          ]
        });

        assert.isUndefined(root.parent);
        assert.isArray(root.children);
        assert.lengthOf(root.children, 2);
        assert.deepEqual(root.model, {
          id: 1,
          children: [
            {
              id: 11,
              children: [{id: 111}]
            },
            {
              id: 12,
              children: [
                {id: 121},
                {id: 122},
                {id: 123},
                {id: 124},
                {id: 125},
                {id: 126},
                {id: 127},
                {id: 128},
                {id: 129},
                {id: 1210},
                {id: 1211}
              ]
            }
          ]
        });

        assert.deepEqual(root, root.children[0].parent);
        assert.deepEqual(root, root.children[1].parent);

        node12 = root.children[1];
        assert.isArray(node12.children);
        assert.lengthOf(node12.children, 11);
        assert.deepEqual(node12.model, {
          id: 12,
          children: [
            {id: 121},
            {id: 122},
            {id: 123},
            {id: 124},
            {id: 125},
            {id: 126},
            {id: 127},
            {id: 128},
            {id: 129},
            {id: 1210},
            {id: 1211}
          ]
        });

        assert.deepEqual(node12, node12.children[0].parent);
        assert.deepEqual(node12, node12.children[1].parent);
      });
    });

    describe('addChild()', function () {
      var root;

      beforeEach(function () {
        root = treeModel.from({id: 1, children: [{id: 11}, {id: 12}]});
      });

      it('should add child to the end', function () {
        treeModel.addChild(root, treeModel.from({id: 13}));
        treeModel.addChild(root, treeModel.from({id: 10}));
        assert.deepEqual(root.model.children, [{id: 11}, {id: 12}, {id: 13}, {id: 10}]);
      });

      it('should throw an error when child is not a Node', function () {
        assert.throws(treeModel.addChild.bind(null, root, {children: []}), TypeError, 'Child must be of type Node.');
      });
    });

    describe('getPath()', function () {
      var root;

      beforeEach(function () {
        root = treeModel.from({
          id: 1,
          children: [
            {
              id: 11,
              children: [{id: 111}]
            },
            {
              id: 12,
              children: [{id: 121}, {id: 122}]
            }
          ]
        });
      });

      it('should get an array with the root node if called on the root node', function () {
        var pathToRoot;
        pathToRoot = treeModel.path(root);
        assert.lengthOf(pathToRoot, 1);
        assert.strictEqual(pathToRoot[0].model.id, 1);
      });

      it('should get an array of nodes from the root to the node (included)', function () {
        var pathToNode121;
        pathToNode121 = treeModel.path(treeModel.first(idEq(121), root));
        assert.lengthOf(pathToNode121, 3);
        assert.strictEqual(pathToNode121[0].model.id, 1);
        assert.strictEqual(pathToNode121[1].model.id, 12);
        assert.strictEqual(pathToNode121[2].model.id, 121);
      });
    });

    describe('traversal', function () {
      var root, spy121, spy12;

      function callback121(node) {
        if (node.model.id === 121) {
          return false;
        }
      }

      function callback12(node) {
        if (node.model.id === 12) {
          return false;
        }
      }

      beforeEach(function () {
        root = treeModel.from({
          id: 1,
          children: [
            {
              id: 11,
              children: [{id: 111}]
            },
            {
              id: 12,
              children: [{id: 121}, {id: 122}]
            }
          ]
        });

        spy121 = sinon.spy(callback121);
        spy12 = sinon.spy(callback12);
      });

      describe('walk depthFirstPreOrder by default', function () {
        it('should traverse the nodes until the callback returns false', function () {
          treeModel.walk(spy121, root);
          assert.strictEqual(spy121.callCount, 5);
          //assert(spy121.alwaysCalledOn(this));
          assert(spy121.getCall(0).calledWithExactly(treeModel.first(idEq(1), root)));
          assert(spy121.getCall(1).calledWithExactly(treeModel.first(idEq(11), root)));
          assert(spy121.getCall(2).calledWithExactly(treeModel.first(idEq(111), root)));
          assert(spy121.getCall(3).calledWithExactly(treeModel.first(idEq(12), root)));
          assert(spy121.getCall(4).calledWithExactly(treeModel.first(idEq(121), root)));
        });
      });

      describe('walk depthFirstPostOrder', function () {
        it('should traverse the nodes until the callback returns false', function () {
          treeModel.walk({strategy: 'post'}, spy121, root);
          assert.strictEqual(spy121.callCount, 3);
          //assert(spy121.alwaysCalledOn(this));
          assert(spy121.getCall(0).calledWithExactly(treeModel.first(idEq(111), root)));
          assert(spy121.getCall(1).calledWithExactly(treeModel.first(idEq(11), root)));
          assert(spy121.getCall(2).calledWithExactly(treeModel.first(idEq(121), root)));
        });
      });

      describe('walk depthFirstPostOrder (2)', function () {
        it('should traverse the nodes until the callback returns false', function () {
          treeModel.walk({strategy: 'post'}, spy12, root);
          assert.strictEqual(spy12.callCount, 5);
          //assert(spy12.alwaysCalledOn(this));
          assert(spy12.getCall(0).calledWithExactly(treeModel.first(idEq(111), root)));
          assert(spy12.getCall(1).calledWithExactly(treeModel.first(idEq(11), root)));
          assert(spy12.getCall(2).calledWithExactly(treeModel.first(idEq(121), root)));
          assert(spy12.getCall(3).calledWithExactly(treeModel.first(idEq(122), root)));
          assert(spy12.getCall(4).calledWithExactly(treeModel.first(idEq(12), root)));
        });
      });

      describe('walk breadthFirst', function () {
        it('should traverse the nodes until the callback returns false', function () {
          treeModel.walk({strategy: 'breadth'}, spy121, root);
          assert.strictEqual(spy121.callCount, 5);
          //assert(spy121.alwaysCalledOn(this));
          assert(spy121.getCall(0).calledWithExactly(treeModel.first(idEq(1), root)));
          assert(spy121.getCall(1).calledWithExactly(treeModel.first(idEq(11), root)));
          assert(spy121.getCall(2).calledWithExactly(treeModel.first(idEq(12), root)));
          assert(spy121.getCall(3).calledWithExactly(treeModel.first(idEq(111), root)));
          assert(spy121.getCall(4).calledWithExactly(treeModel.first(idEq(121), root)));
        });
      });

      describe('walk using unknown strategy', function () {
        it('should throw an error warning about the strategy', function () {
          assert.throws(function () {
              treeModel.walk({strategy: 'unknownStrategy'}, callback121, root);
            },
            Error,
            'Unknown tree walk strategy. Valid strategies are \'pre\' [default], \'post\' and \'breadth\'.');
        });
      });
    });

    describe('all()', function () {
      var root;

      beforeEach(function () {
        root = treeModel.from({
          id: 1,
          children: [
            {
              id: 11,
              children: [{id: 111}]
            },
            {
              id: 12,
              children: [{id: 121}, {id: 122}]
            }
          ]
        });
      });

      it('should get an empty array if no nodes match the predicate', function () {
        var idLt0;
        idLt0 = treeModel.all(function (node) {
          return node.model.id < 0;
        }, root);
        assert.lengthOf(idLt0, 0);
      });

      it('should get an array with the node itself if only the node matches the predicate', function () {
        var idEq1;
        idEq1 = treeModel.all(idEq(1), root);
        assert.lengthOf(idEq1, 1);
        assert.deepEqual(idEq1[0], root);
      });

      it('should get an array with all nodes that match a given predicate', function () {
        var idGt100;
        idGt100 = treeModel.all(function (node) {
          return node.model.id > 100;
        }, root);
        assert.lengthOf(idGt100, 3);
        assert.strictEqual(idGt100[0].model.id, 111);
        assert.strictEqual(idGt100[1].model.id, 121);
        assert.strictEqual(idGt100[2].model.id, 122);
      });

      it('should get an array with all nodes that match a given predicate (2)', function () {
        var idGt10AndChildOfRoot;
        idGt10AndChildOfRoot = treeModel.all(function (node) {
          return node.model.id > 10 && node.parent === root;
        }, root);
        assert.lengthOf(idGt10AndChildOfRoot, 2);
        assert.strictEqual(idGt10AndChildOfRoot[0].model.id, 11);
        assert.strictEqual(idGt10AndChildOfRoot[1].model.id, 12);
      });
    });

    describe('drop()', function () {
      var root;

      beforeEach(function () {
        root = treeModel.from({
          id: 1,
          children: [
            {
              id: 11,
              children: [{id: 111}]
            },
            {
              id: 12,
              children: [{id: 121}, {id: 122}]
            }
          ]
        });
      });

      it('should give back the dropped node, even if it is the root', function () {
        assert.deepEqual(treeModel.drop(root), root);
      });

      it('should give back the dropped node, which no longer be found in the original root', function () {
        assert.deepEqual(treeModel.drop(treeModel.first(idEq(11), root)).model, {id: 11, children: [{id: 111}]});
        assert.isUndefined(treeModel.first(idEq(11), root));
      });
    });

    describe('isLeaf()', function () {
      var root;

      beforeEach(function () {
        root = treeModel.from({
          id: 1,
          children: [
            {
              id: 11,
              children: [{id: 111}]
            },
            {
              id: 12,
              children: [{id: 121}, {id: 122}]
            }
          ]
        });
      });

      it('should return true for node with children', function () {
        assert.equal(treeModel.isLeaf(root), false);
      });

      it('should return false for node without children', function () {
        assert.equal(treeModel.isLeaf(treeModel.first(idEq(111), root)), true);
      });
    });
  });

  describe('with custom children and comparator', function () {
    var conf = {
      childrenPropertyName: 'deps',
      modelComparatorFn: function (a, b) {
        return b.id - a.id;
      }
    };
    var customFrom = _.partial(treeModel.from, conf);

    describe('parse()', function () {
      it('should create a root and stable sort the respective children according to the comparator', function () {
        var root, node12, i;

        root = customFrom({
          id: 1,
          deps: [
            {
              id: 11,
              deps: [{id: 111}]
            },
            {
              id: 12,
              deps: [
                {id: 122, stable: 1},
                {id: 121, stable: 1},
                {id: 121, stable: 2},
                {id: 121, stable: 3},
                {id: 121, stable: 4},
                {id: 121, stable: 5},
                {id: 121, stable: 6},
                {id: 121, stable: 7},
                {id: 121, stable: 8},
                {id: 121, stable: 9},
                {id: 121, stable: 10},
                {id: 121, stable: 11},
                {id: 121, stable: 12},
                {id: 121, stable: 13},
                {id: 121, stable: 14},
                {id: 121, stable: 15},
                {id: 122, stable: 2}
              ]
            }
          ]
        });

        assert.isUndefined(root.parent);
        assert.isArray(root.children);
        assert.lengthOf(root.children, 2);
        assert.deepEqual(root.model, {
          id: 1,
          deps: [
            {
              id: 12,
              deps: [
                {id: 122, stable: 1},
                {id: 122, stable: 2},
                {id: 121, stable: 1},
                {id: 121, stable: 2},
                {id: 121, stable: 3},
                {id: 121, stable: 4},
                {id: 121, stable: 5},
                {id: 121, stable: 6},
                {id: 121, stable: 7},
                {id: 121, stable: 8},
                {id: 121, stable: 9},
                {id: 121, stable: 10},
                {id: 121, stable: 11},
                {id: 121, stable: 12},
                {id: 121, stable: 13},
                {id: 121, stable: 14},
                {id: 121, stable: 15}
              ]
            },
            {
              id: 11,
              deps: [{id: 111}]
            }
          ]
        });

        assert.deepEqual(root, root.children[0].parent);
        assert.deepEqual(root, root.children[1].parent);

        node12 = root.children[0];
        assert.isArray(node12.children);
        assert.lengthOf(node12.children, 17);
        assert.deepEqual(node12.model, {
          id: 12,
          deps: [
            {id: 122, stable: 1},
            {id: 122, stable: 2},
            {id: 121, stable: 1},
            {id: 121, stable: 2},
            {id: 121, stable: 3},
            {id: 121, stable: 4},
            {id: 121, stable: 5},
            {id: 121, stable: 6},
            {id: 121, stable: 7},
            {id: 121, stable: 8},
            {id: 121, stable: 9},
            {id: 121, stable: 10},
            {id: 121, stable: 11},
            {id: 121, stable: 12},
            {id: 121, stable: 13},
            {id: 121, stable: 14},
            {id: 121, stable: 15}
          ]
        });

        for (i = 0; i < 17; i++) {
          assert.deepEqual(node12, node12.children[i].parent);
        }
      });
    });

    describe('addChild()', function () {
      it('should add child respecting the given comparator', function () {
        var root;
        root = customFrom({id: 1, deps: [
          {id: 12, stable: 1},
          {id: 11, stable: 1},
          {id: 11, stable: 2},
          {id: 11, stable: 3},
          {id: 11, stable: 4},
          {id: 11, stable: 5},
          {id: 11, stable: 6},
          {id: 11, stable: 7},
          {id: 12, stable: 2},
          {id: 11, stable: 8},
          {id: 11, stable: 9},
          {id: 11, stable: 10},
          {id: 11, stable: 11},
          {id: 11, stable: 12},
          {id: 11, stable: 13},
          {id: 11, stable: 14},
          {id: 11, stable: 15},
          {id: 13, stable: 1},
          {id: 12, stable: 3}
        ]});
        treeModel.addChild(root, customFrom({id: 13, stable: 2}));
        treeModel.addChild(root, customFrom({id: 10, stable: 1}));
        treeModel.addChild(root, customFrom({id: 10, stable: 2}));
        treeModel.addChild(root, customFrom({id: 12, stable: 4}));
        assert.lengthOf(root.children, 23);
        assert.deepEqual(root.model.deps, [
          {id: 13, stable: 1},
          {id: 13, stable: 2},
          {id: 12, stable: 1},
          {id: 12, stable: 2},
          {id: 12, stable: 3},
          {id: 12, stable: 4},
          {id: 11, stable: 1},
          {id: 11, stable: 2},
          {id: 11, stable: 3},
          {id: 11, stable: 4},
          {id: 11, stable: 5},
          {id: 11, stable: 6},
          {id: 11, stable: 7},
          {id: 11, stable: 8},
          {id: 11, stable: 9},
          {id: 11, stable: 10},
          {id: 11, stable: 11},
          {id: 11, stable: 12},
          {id: 11, stable: 13},
          {id: 11, stable: 14},
          {id: 11, stable: 15},
          {id: 10, stable: 1},
          {id: 10, stable: 2}
        ]);
      });

      it('should keep child nodes and model child nodes positions in sync', function () {
        var root;
        root = customFrom({id: 1, deps: [{id: 12}, {id: 11}]});
        treeModel.addChild(root, customFrom({id: 13}));
        treeModel.addChild(root, customFrom({id: 10}));
        assert.lengthOf(root.children, 4);
        assert.deepEqual(root.model.deps, [{id: 13}, {id: 12}, {id: 11}, {id: 10}]);

        assert.equal(root.children[0].model.id, 13);
        assert.equal(root.children[1].model.id, 12);
        assert.equal(root.children[2].model.id, 11);
        assert.equal(root.children[3].model.id, 10);
      });
    });

    describe('drop()', function () {
      var root;

      beforeEach(function () {
        root = customFrom({
          id: 1,
          deps: [
            {
              id: 11,
              deps: [{id: 111}]
            },
            {
              id: 12,
              deps: [{id: 121}, {id: 122}]
            }
          ]
        });
      });

      it('should give back the dropped node, even if it is the root', function () {
        assert.deepEqual(treeModel.drop(root), root);
      });

      it('should give back the dropped node, which no longer be found in the original root', function () {
        assert.deepEqual(treeModel.drop(treeModel.first(idEq(11), root)).model, {id: 11, deps: [{id: 111}]});
        assert.isUndefined(treeModel.first(idEq(11), root));
      });
    });

    describe('isLeaf', function () {
      var root;

      beforeEach(function () {
        root = customFrom({
          id: 1,
          deps: [
            {
              id: 11,
              deps: [{id: 111}]
            },
            {
              id: 12,
              deps: [{id: 121}, {id: 122}]
            }
          ]
        });
      });

      it('should return true for node with children', function () {
        assert.equal(treeModel.isLeaf(root), false);
      });

      it('should return false for node without children', function () {
        assert.equal(treeModel.isLeaf(treeModel.first(idEq(111), root)), true);
      });
    });
  });
});
