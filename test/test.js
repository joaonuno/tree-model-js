/* global describe, it, beforeEach */

var chai, assert, sinon, TreeModel;
chai = require('chai');
sinon = require('sinon');
TreeModel = require('..');
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
    var treeModel;

    beforeEach(function () {
      treeModel = new TreeModel();
    });

    describe('parse()', function () {
      it('should throw an error when model is a number (not an object)', function () {
        assert.throws(treeModel.parse.bind(treeModel, 1), TypeError, 'Model must be of type object.');
      });

      it('should throw an error when model is a string (not an object)', function () {
        assert.throws(treeModel.parse.bind(treeModel, 'string'), TypeError, 'Model must be of type object.');
      });

      it('should throw an error when some child in the model is not an object', function () {
        assert.throws(
          treeModel.parse.bind(treeModel, {children: ['string']}),
          TypeError,
          'Model must be of type object.');
      });

      it('should create a root node when given a model without children', function () {
        var root;

        root = treeModel.parse({id: 1});

        assert.isUndefined(root.parent);
        assert.isArray(root.children);
        assert.lengthOf(root.children, 0);
        assert.deepEqual(root.model, {id: 1});
      });

      it('should create a root and the respective children when given a model with children', function () {
        var root, node12;

        root = treeModel.parse({
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
        root = treeModel.parse({id: 1, children: [{id: 11}, {id: 12}]});
      });

      it('should add child to the end', function () {
        root.addChild(treeModel.parse({id: 13}));
        root.addChild(treeModel.parse({id: 10}));
        assert.deepEqual(root.model.children, [{id: 11}, {id: 12}, {id: 13}, {id: 10}]);
      });

      it('should throw an error when child is not a Node', function () {
        assert.throws(root.addChild.bind(root, {children: []}), TypeError, 'Child must be of type Node.');
      });

      it('should add child at index', function () {
        root.addChildAtIndex(treeModel.parse({ id: 13 }), 1);
        assert.deepEqual(root.model.children, [{ id: 11 }, { id: 13 }, { id: 12 }]);
        assert.equal(root.children[1].model.id, 13);
      });

      it('should add child at the end when index matches the children number', function () {
        root.addChildAtIndex(treeModel.parse({ id: 13 }), 2);
        assert.deepEqual(root.model.children, [{ id: 11 }, { id: 12 }, { id: 13 }]);
      });

      it('should add child at index 0 of a leaf', function () {
        var leaf = root.first(idEq(11));
        leaf.addChildAtIndex(treeModel.parse({ id: 111 }), 0);
        assert.deepEqual(leaf.model.children, [{ id: 111 }]);
      });

      it('should throw an error when adding child at negative index', function () {
        var child;

        child = treeModel.parse({ id: 13 });
        assert.throws(root.addChildAtIndex.bind(root, child, -1), Error, 'Invalid index.');
      });

      it('should throw an error when adding child at a too high index', function () {
        var child;

        child = treeModel.parse({ id: 13 });
        assert.throws(root.addChildAtIndex.bind(root, child, 3), Error, 'Invalid index.');
      });
    });

    describe('setIndex()', function () {
      var root;

      beforeEach(function () {
        root = treeModel.parse({id: 1, children: [{id: 11}, {id: 12}, {id:13}]});
      });

      it('should set the index of the node among its siblings', function () {
        var child, i;
        child = root.children[0];
        for (i = 0; i < root.children.length; i++) {
          child.setIndex(i);
          assert.equal(child.getIndex(), i);
          assert.equal(root.model[child.config.childrenPropertyName].indexOf(child.model), i);
        }
      });

      it('keeps the order of all other nodes', function () {
        var child, oldOrder, i, j, k, l;
        child = root.children[0];
        for (i = 0; i < root.children.length; i++) {
          oldOrder = [];
          for (j = 0; j < root.children.length; j++) {
            if (root.children[j] !== child) {
              oldOrder.push(root.children[j]);
            }
          }

          child.setIndex(i);
          for (k = 0; k < root.children.length; k++) {
            for (l = 0; l < root.children.length; l++) {
              if (root.children[k] !== child && root.children[l] !== child) {
                assert.equal(k < l, oldOrder.indexOf(root.children[k]) < oldOrder.indexOf(root.children[l]));
              }
            }
          }
        }
      });

      it('should return itself', function () {
        var child = root.children[0];
        assert.equal(child.setIndex(1), child);
      });

      it('should throw an error when node is a root and the index is not zero', function () {
        assert.throws(function () {root.setIndex(1);}, Error, 'Invalid index.');
      });

      it('should allow to set the root node index to zero', function () {
        assert.strictEqual(root.setIndex(0), root);
      });

      it('should throw an error when setting to a negative index', function () {
        assert.throws(function () {root.children[0].setIndex(-1);}, Error, 'Invalid index.');
      });

      it('should throw an error when setting to a too high index', function () {
        assert.throws(function () {root.children[0].setIndex(root.children.length);}, Error, 'Invalid index.');
      });
    });

    describe('getPath()', function () {
      var root;

      beforeEach(function () {
        root = treeModel.parse({
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
        pathToRoot = root.getPath();
        assert.lengthOf(pathToRoot, 1);
        assert.strictEqual(pathToRoot[0].model.id, 1);
      });

      it('should get an array of nodes from the root to the node (included)', function () {
        var pathToNode121;
        pathToNode121 = root.first(idEq(121)).getPath();
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
        root = treeModel.parse({
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
          root.walk(spy121, this);
          assert.strictEqual(spy121.callCount, 5);
          assert(spy121.alwaysCalledOn(this));
          assert(spy121.getCall(0).calledWithExactly(root.first(idEq(1))));
          assert(spy121.getCall(1).calledWithExactly(root.first(idEq(11))));
          assert(spy121.getCall(2).calledWithExactly(root.first(idEq(111))));
          assert(spy121.getCall(3).calledWithExactly(root.first(idEq(12))));
          assert(spy121.getCall(4).calledWithExactly(root.first(idEq(121))));
        });
      });

      describe('walk depthFirstPostOrder', function () {
        it('should traverse the nodes until the callback returns false', function () {
          root.walk({strategy: 'post'}, spy121, this);
          assert.strictEqual(spy121.callCount, 3);
          assert(spy121.alwaysCalledOn(this));
          assert(spy121.getCall(0).calledWithExactly(root.first(idEq(111))));
          assert(spy121.getCall(1).calledWithExactly(root.first(idEq(11))));
          assert(spy121.getCall(2).calledWithExactly(root.first(idEq(121))));
        });
      });

      describe('walk depthFirstPostOrder (2)', function () {
        it('should traverse the nodes until the callback returns false', function () {
          root.walk({strategy: 'post'}, spy12, this);
          assert.strictEqual(spy12.callCount, 5);
          assert(spy12.alwaysCalledOn(this));
          assert(spy12.getCall(0).calledWithExactly(root.first(idEq(111))));
          assert(spy12.getCall(1).calledWithExactly(root.first(idEq(11))));
          assert(spy12.getCall(2).calledWithExactly(root.first(idEq(121))));
          assert(spy12.getCall(3).calledWithExactly(root.first(idEq(122))));
          assert(spy12.getCall(4).calledWithExactly(root.first(idEq(12))));
        });
      });

      describe('walk breadthFirst', function () {
        it('should traverse the nodes until the callback returns false', function () {
          root.walk({strategy: 'breadth'}, spy121, this);
          assert.strictEqual(spy121.callCount, 5);
          assert(spy121.alwaysCalledOn(this));
          assert(spy121.getCall(0).calledWithExactly(root.first(idEq(1))));
          assert(spy121.getCall(1).calledWithExactly(root.first(idEq(11))));
          assert(spy121.getCall(2).calledWithExactly(root.first(idEq(12))));
          assert(spy121.getCall(3).calledWithExactly(root.first(idEq(111))));
          assert(spy121.getCall(4).calledWithExactly(root.first(idEq(121))));
        });
      });

      describe('walk using unknown strategy', function () {
        it('should throw an error warning about the strategy', function () {
          assert.throws(
            root.walk.bind(root, {strategy: 'unknownStrategy'}, callback121, this),
            Error,
            'Unknown tree walk strategy. Valid strategies are \'pre\' [default], \'post\' and \'breadth\'.');
        });
      });
    });

    describe('all()', function () {
      var root;

      beforeEach(function () {
        root = treeModel.parse({
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
        idLt0 = root.all(function (node) {
          return node.model.id < 0;
        });
        assert.lengthOf(idLt0, 0);
      });

      it('should get all nodes if no predicate is given', function () {
        var allNodes;
        allNodes = root.all();
        assert.lengthOf(allNodes, 6);
      });

      it('should get an array with the node itself if only the node matches the predicate', function () {
        var idEq1;
        idEq1 = root.all(idEq(1));
        assert.lengthOf(idEq1, 1);
        assert.deepEqual(idEq1[0], root);
      });

      it('should get an array with all nodes that match a given predicate', function () {
        var idGt100;
        idGt100 = root.all(function (node) {
          return node.model.id > 100;
        });
        assert.lengthOf(idGt100, 3);
        assert.strictEqual(idGt100[0].model.id, 111);
        assert.strictEqual(idGt100[1].model.id, 121);
        assert.strictEqual(idGt100[2].model.id, 122);
      });

      it('should get an array with all nodes that match a given predicate (2)', function () {
        var idGt10AndChildOfRoot;
        idGt10AndChildOfRoot = root.all(function (node) {
          return node.model.id > 10 && node.parent === root;
        });
        assert.lengthOf(idGt10AndChildOfRoot, 2);
        assert.strictEqual(idGt10AndChildOfRoot[0].model.id, 11);
        assert.strictEqual(idGt10AndChildOfRoot[1].model.id, 12);
      });
    });

    describe('first()', function () {
      var root;

      beforeEach(function () {
        root = treeModel.parse({
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

      it('should get the first node when the predicate returns true', function () {
        var first;
        first = root.first(function () {
          return true;
        });
        assert.equal(first.model.id, 1);
      });

      it('should get the first node when no predicate is given', function () {
        var first;
        first = root.first();
        assert.equal(first.model.id, 1);
      });

      it('should get the first node with a different strategy when the predicate returns true', function () {
        var first;
        first = root.first({strategy: 'post'}, function () {
          return true;
        });
        assert.equal(first.model.id, 111);
      });

      it('should get the first node with a different strategy when no predicate is given', function () {
        var first;
        first = root.first({strategy: 'post'});
        assert.equal(first.model.id, 111);
      });
    });

    describe('drop()', function () {
      var root;

      beforeEach(function () {
        root = treeModel.parse({
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
        assert.deepEqual(root.drop(), root);
      });

      it('should give back the dropped node, which no longer be found in the original root', function () {
        assert.deepEqual(root.first(idEq(11)).drop().model, {id: 11, children: [{id: 111}]});
        assert.isUndefined(root.first(idEq(11)));
      });
    });

    describe('hasChildren()', function () {
      var root;

      beforeEach(function () {
        root = treeModel.parse({
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
        assert.equal(root.hasChildren(), true);
      });

      it('should return false for node without children', function () {
        assert.equal(root.first(idEq(111)).hasChildren(), false);
      });
    });
  });

  describe('with custom children and comparator', function () {
    var treeModel;

    beforeEach(function () {
      treeModel = new TreeModel({
        childrenPropertyName: 'deps',
        modelComparatorFn: function (a, b) {
          return b.id - a.id;
        }
      });
    });

    describe('parse()', function () {
      it('should create a root and stable sort the respective children according to the comparator', function () {
        var root, node12, i;

        root = treeModel.parse({
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
        root = treeModel.parse({id: 1, deps: [
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
        root.addChild(treeModel.parse({id: 13, stable: 2}));
        root.addChild(treeModel.parse({id: 10, stable: 1}));
        root.addChild(treeModel.parse({id: 10, stable: 2}));
        root.addChild(treeModel.parse({id: 12, stable: 4}));
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
        root = treeModel.parse({id: 1, deps: [{id: 12}, {id: 11}]});
        root.addChild(treeModel.parse({id: 13}));
        root.addChild(treeModel.parse({id: 10}));
        assert.lengthOf(root.children, 4);
        assert.deepEqual(root.model.deps, [{id: 13}, {id: 12}, {id: 11}, {id: 10}]);

        assert.equal(root.children[0].model.id, 13);
        assert.equal(root.children[1].model.id, 12);
        assert.equal(root.children[2].model.id, 11);
        assert.equal(root.children[3].model.id, 10);
      });

      it('should throw an error when adding child at index but a comparator was provided', function () {
        var root, child;

        root = treeModel.parse({id: 1, deps: [{id: 12}, {id: 11}]});
        child = treeModel.parse({ id: 13 });
        assert.throws(
          root.addChildAtIndex.bind(root, child, 1),
          Error,
          'Cannot add child at index when using a comparator function.');
      });
    });

    describe('setIndex()', function () {
      it('should throw an error when setting a node index but a comparator was provided', function () {
        var root, child;

        root = treeModel.parse({id: 1, deps: [{id: 12}, {id: 11}]});
        child = root.children[0];

        assert.throws(
          function () {child.setIndex(0);},
          Error,
          'Cannot set node index when using a comparator function.');
      });
    });

    describe('drop()', function () {
      var root;

      beforeEach(function () {
        root = treeModel.parse({
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
        assert.deepEqual(root.drop(), root);
      });

      it('should give back the dropped node, which no longer be found in the original root', function () {
        assert.deepEqual(root.first(idEq(11)).drop().model, {id: 11, deps: [{id: 111}]});
        assert.isUndefined(root.first(idEq(11)));
      });
    });

    describe('hasChildren()', function () {
      var root;

      beforeEach(function () {
        root = treeModel.parse({
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
        assert.equal(root.hasChildren(), true);
      });

      it('should return false for node without children', function () {
        assert.equal(root.first(idEq(111)).hasChildren(), false);
      });
    });
  });
});
