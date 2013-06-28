var tree, root;

$(function () {
  'use strict';

  var COLOR_MATCH,
    COLOR_NO_MATCH,
    COLOR_VISITED,
    COLOR_NODE_STROKE,
    COLOR_TEXT_STROKE,
    COLOR_NODE_FILL,
    COLOR_DROP_FILL,
    ui,
    svg;

  COLOR_MATCH = '#B7FFCD';
  COLOR_NO_MATCH = '#FFC1B7';
  COLOR_VISITED = '#B4B4B4';
  COLOR_NODE_STROKE = '#141414';
  COLOR_TEXT_STROKE = '#141414';
  COLOR_NODE_FILL = '#F1F1F1';
  COLOR_DROP_FILL = '#FFC1B7';

  // Add play buttons
  $('[data-fn]').each(function (i, el) {
    $(el)
      .after('<button data-play="' + $(el).data('fn') + '" class="btn btn-mini btn-primary" type="button">play</button>')
      /*.after('<div>' +
          '<label><input type="radio" value="depthFirstPreOrder" name="strategy"><span>depth-first pre-order</span></label>' +
          '<label><input type="radio" value="depthFirstPostOrder" name="strategy"><span>depth-first post-order</span></label>' +
          '<label><input type="radio" value="breadthFirst" name="strategy"><span>breadth-first</span></label>' +
        '</div>')*/;
  });
  $('body').on('click', '[data-play]', function (ev) {
    ui[$(ev.currentTarget).data('play')].fn();
  });

  // Helper function to check if a node id matches any of the given ids
  function idIn(ids) {
    return function (node) {
      return ids.indexOf(node.model.id) !== -1;
    };
  }

  function getColorByMark(mark /* visited | match | noMatch */) {
    if (mark === 'visited') return COLOR_VISITED;
    else if (mark === 'match') return COLOR_MATCH;
    else if (mark === 'noMatch') return COLOR_NO_MATCH;
  }

  function markNode(mark , node, i) {
    ui.animations.push(function () {
      node.ui.circle.transition().delay(0).duration(150).attr({
        // fill: match ? '#58ED62' : '#F7F09E',
        fill: getColorByMark(mark),
        r: '20'
      });
      node.ui.circle.transition().delay(150).duration(250).attr({
        r: '18'
      });
      svg.append('text').text(i).transition().delay(250).attr({
        stroke: COLOR_TEXT_STROKE,
        'font-family': 'Verdana',
        'font-size': '10px',
        'text-anchor': 'middle',
        'x': 18 + parseInt(node.ui.circle.attr('cx'), 10),
        'y': 21 + parseInt(node.ui.circle.attr('cy'), 10)
      });
    });
  }

  // Graphical functions
  ui = {
    reset: function () {
      resetRoot();
      if (svg) {
        svg.remove();
      }
      $('#svg').append('<svg width="400" height="400"></svg>');
      svg = d3.select('svg');
      ui.parse.fn();
    },
    markVisited: markNode.bind(this, 'visited'),
    markNoMatch: markNode.bind(this, 'noMatch'),
    markMatch: markNode.bind(this, 'match'),
    animations: [],
    animate: function () {
      if (ui.animations.length > 0) {
        ui.currentTimeoutId = setTimeout(function () {
          ui.animations.shift()();
          ui.animate();
        }, 400);
      }
    },
    cancelAnimations: function () {
      clearTimeout(ui.currentTimeoutId);
      ui.animations.length = 0;
    },
    parse: {
      fn: function () {
        var RADIUS, INC_X, INC_Y, cx, cy;
        RADIUS = 18;
        INC_X = RADIUS*2 + 5;
        INC_Y = RADIUS*2 + 5;
        cx = RADIUS + 75;
        cy = RADIUS + 5;

        root.walk(function (node) {
          node.ui = {
            circle: svg.append('circle').attr({
              r: RADIUS,
              stroke: COLOR_NODE_STROKE,
              fill: COLOR_NODE_FILL
            }),
            label: svg.append('text').text(node.model.id).attr({
              stroke: COLOR_TEXT_STROKE,
              'font-family': 'Verdana',
              'font-size': '12px',
              'text-anchor': 'middle'
            })
          };
          
          if (!node.isRoot()) {
            cx = parseInt(node.parent.ui.circle.attr('cx'), 10) + INC_X;
            cy += INC_Y;
          }
          node.ui.circle.attr('cx', cx);
          node.ui.circle.attr('cy', cy);
          node.ui.label.attr('x', cx);
          node.ui.label.attr('y', cy + 5);
        });
      }
    },
    first: {
      fn: function () {
        var i = 1;
        ui.reset();
        ui.cancelAnimations();
        root.first(function (node) {
          if (node.model.id === 12) {
            ui.markMatch(node, i++);
            return true;
          }
          ui.markNoMatch(node, i++);
          return false;
        });
        ui.animate();
      }
    },
    all: {
      fn: function () {
        var i = 1;
        ui.reset();
        ui.cancelAnimations();
        root.walk(function (node) {
          if (node.model.id > 100) {
            ui.markMatch(node, i++);
          } else {
            ui.markNoMatch(node, i++);
          }
        });
        ui.animate();
      }
    },
    walk: {
      fn: function () {
        var i = 1;
        ui.reset();
        ui.cancelAnimations();
        root.walk(function (node) {
          ui.markVisited(node, i++);
          if (node.model.id === 121) {
            return false;
          }
        });
        ui.animate();
      }
    },
    drop: {
      fn: function () {
        var node12, node13, vGap;
        ui.reset();
        ui.cancelAnimations();
        node12 = root.first(idIn([12])).drop();
        vGap = parseInt(node12.ui.circle.attr('cy'), 10) - parseInt(root.ui.circle.attr('cy'), 10);

        node12.walk(function (node) {
          node.ui.circle.transition().delay(0).duration(1000).attr({
            fill: COLOR_DROP_FILL
          });
          node.ui.circle.transition().delay(1000).duration(500).attr({
            cx: parseInt(node.ui.circle.attr('cx'), 10) + 100
          });
          node.ui.label.transition().delay(1000).duration(500).attr({
            x: parseInt(node.ui.label.attr('x'), 10) + 100
          });
          node.ui.circle.transition().delay(1500).duration(500).attr({
            cy: parseInt(node.ui.circle.attr('cy'), 10) - vGap
          });
          node.ui.label.transition().delay(1500).duration(500).attr({
            y: parseInt(node.ui.label.attr('y'), 10) - vGap
          });
        });

        node13 = root.first(idIn([13]))
        node13.ui.circle.transition().delay(1500).duration(500).attr({
          cy: parseInt(node12.ui.circle.attr('cy'), 10)
        });
        node13.ui.label.transition().delay(1500).duration(500).attr({
          y: parseInt(node12.ui.label.attr('y'), 10)
        });
      }
    }
  };

  $('.code').each(function (i, el) {
    var $el, code, cm;
    $el = $(el);
    code = $('<div/>').html($el.html()).text();
    $el.empty();
    cm = CodeMirror($el.get(0), {
      value: code,
      mode: 'javascript',
      lineNumbers: !$el.is('.inline'),
      readOnly: true
    });
    if (!$el.is('[data-fn]')) {
      //eval(code);
    } else {
      ui[$el.data('fn')].cm = cm;
    }
  });

  function resetRoot() {
    tree = new TreeModel();
    root = tree.parse({
      id: 1,
      children: [
          {
              id: 11,
              children: [{id: 111}]
          },
          {
              id: 12,
              children: [{id: 121}, {id: 122}]
          },
          {
              id: 13
          }
      ]
    });
  }

  resetRoot();

  ui.reset();
});