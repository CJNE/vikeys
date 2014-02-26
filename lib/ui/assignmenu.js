var blessed = require('blessed');
var widgets = require('./widgets');
var leftBox, mainBox, keyBox;
var keycodes = require('../keycodes.js');
var myParent;
var items;

var labels = keycodes.groups();
exports.show = function(parent, clb) {
  myParent = parent;
  var screen = parent.screen;
  if(!mainBox) {
    mainBox = blessed.box({
      title: "Assign",
      width: '100%',
      top: '0%',
      bg: 'pink',
      heigth: '100%',
      keys: true
    });
    keyBox = widgets.listmenu({
      left: '25%',
      width: '75%',
      top: '0%',
      bg: 'pink',
      height: '100%',
      selectedFg: 'red',
      itemFg: 'white',
      keys: true,
      vi: true,
      mouse: true,
      style: {
        fg: 'white',
        bg: 'blue',
        selected: {
          prefix: 'white',
          fg: 'red',
          bg: 'blue'
        },
        item: {
          prefix: 'white',
          fg: 'white',
          bg: 'blue'
        }
      }
    });
    leftBox = widgets.listmenu({
      width: '25%',
      heigth: '100%',
      left: '0%',
      selectedFg: 'red',
      itemFg: 'white',
      keys: true,
      vi: true,
      mouse: true,
      style: {
        fg: 'white',
        bg: 'blue',
        selected: {
          prefix: 'white',
          fg: 'red',
          bg: 'blue'
        },
        item: {
          prefix: 'white',
          fg: 'white',
          bg: 'blue'
        }
      }
    });

    myParent.append(mainBox);
    leftBox.on('cancel', function() {
      clb.cancel();
    });

    keyBox.on('cancel', function() {
      keyBox.setItems([]);
      leftBox.focus();
      myParent.screen.render();
    });

    mainBox.append(leftBox);
    mainBox.append(keyBox);
    var commands = {};
    labels.forEach(function(item, i) {
      commands[item] = {
        prefix: i+'',
        keys: [i+''],
        callback: function() {
          items = keycodes.codesForGroup(labels[i]);
          keyBox.setItems(items.map(function(keyitem) { return {
            text: keyitem.code+" "+(keyitem.description ? keyitem.description : ''),
            prefix: keyitem.code.substring(0,1),
            callback: function() {
              clb.assign(keyitem.code);
            }}}
          ));
          screen.render();
          //console.log(keys[labels[item]]);
          keyBox.focus();
        }
      }
    });
    leftBox.setItems(commands);
  }
  screen.render();
  leftBox.focus();
  screen.grabKeys = true;
  keyBox.key(['escape', 'q', 'C-c'], function(ch, key) {
    leftBox.focus();
  });
};
