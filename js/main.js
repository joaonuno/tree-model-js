$(function () {
  'use strict';

  var tree, root, ui;

  function idIn(ids) {
    return function (node) {
      return ids.indexOf(node.model.id) !== -1;
    };
  }

  // Graphical functions
  ui = {
    markVisited: function (node) {
      ui.animations.push(function () {
        node.ui.circle.attr({
          fill: 'lightgray'
        });  
      });
    },
    markMatch: function (node) {
      ui.animations.push(function () {
        node.ui.circle.attr({
          fill: 'orange'
        });  
      });
    },
    animations: [],
    animate: function () {
      if (ui.animations.length > 0) {
        ui.currentTimeoutId = setTimeout(function () {
          ui.animations.shift()();
          ui.animate();
        }, 500);
      }
    },
    cancelAnimations: function () {
      clearTimeout(ui.currentTimeoutId);
      ui.animations.length = 0;
      root.walk(function (node) {
        node.ui.circle.attr({
          stroke: 'green',
          fill: 'lightgreen'
        });
      });
    },
    parse: {
      fn: function () {
        var RADIUS, INC_X, INC_Y, cx, cy, svg;
        RADIUS = 18;
        INC_X = RADIUS*2;
        INC_Y = RADIUS*2 + 5;
        cx = RADIUS + 2;
        cy = RADIUS + 2;
        svg = d3.select('svg')

        root.walk(function (node) {
          node.ui = {
            circle: svg.append('circle').attr({
              r: RADIUS,
              stroke: 'green',
              fill: 'lightgreen'
            }),
            label: svg.append('text').text(node.model.id).attr({
              stroke: 'green',
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
        ui.cancelAnimations();
        root.first(function (node) {
          if (node.model.id === 12) {
            ui.markMatch(node);
            return true;
          }
          ui.markVisited(node);  
          return false;
        });
        ui.animate();
      }
    },
    all: {
      fn: function () {
        ui.cancelAnimations();
        root.walk(function (node) {
          if (node.model.id > 100) {
            ui.markMatch(node);
          } else {
            ui.markVisited(node);
          }
        });
        ui.animate();
      }
    }
  };

  // Docs builder
  function docFor(section) {
    var $codeEl, code, $demoButton;
    $codeEl = $('.code[name="' + section + '"]');
    code = $('<div/>').html($codeEl.html()).text();
    $demoButton = $('button[name="' + section + '"]');

    $codeEl.empty();
    CodeMirror($codeEl.get(0), {
      value: code,
      mode: 'javascript',
      lineNumbers: !$codeEl.is('.inline'),
      readOnly: true
    });

    eval(code);
    if (ui[section] && ui[section].fn) {
      if ($demoButton.length === 0) {
        ui[section].fn();
      } else {
        $demoButton.on('click', ui[section].fn);
      }
    }
  }

  docFor('parse');
  docFor('first');
  docFor('all');
});