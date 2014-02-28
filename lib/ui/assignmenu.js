var blessed = require('blessed');
var widgets = require('./widgets');
var leftBox, mainBox, keyBox;
var keycodes = require('../keycodes.js');
var myParent;
var items;
var state = require('../state');

var labels = keycodes.groups();
exports.show = function(parent, clb) {
  myParent = parent;
  var screen = parent.screen;
  if(!mainBox) {
    mainBox = blessed.box({
      title: "Assign",
      width: '100%',
      top: '0%',
      bg: 'blue',
      heigth: '100%',
      keys: false
    });
    keyBox = widgets.listmenu({
      left: '20%',
      width: 'shrink',
      top: '0%',
      bg: 'pink',
      height: '100%',
      name: "Key menu",
      itemFg: 'white',
      keys: true,
      vi: true,
      mouse: true,
      style: {
        fg: 'white',
        bg: 'blue',
        border: {
          type: 'bg',
          bg: 'black',
          fg: 'blue'
        },
        selected: {
          prefix: 'white',
          fg: 'blue',
          bg: 'white'
        },
        item: {
          prefix: 'white',
          fg: 'white',
          bg: 'blue'
        }
      }
    });
    leftBox = widgets.listmenu({
      width: '20%',
      heigth: '100%',
      left: '0%',
      itemFg: 'white',

      keys: true,
      padding: 1,
      vi: true,
      name: "Group menu",
      mouse: true,
      style: {
        fg: 'white',
        bg: 'blue',
        border: {
          type: 'line',
          bg: 'blue',
          fg: 'blue'
        },

        selected: {
          prefix: 'white',
          fg: 'blue',
          bg: 'white'
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
      leftBox.setItems([]);
      state.popFocus();
      myParent.screen.render();
      clb.cancel();
    });

    keyBox.on('cancel', function() {
      keyBox.setItems([]);
      state.popFocus();
      myParent.screen.render();
    });

    mainBox.append(leftBox);
    mainBox.append(keyBox);
  }
  var commands = {};
  labels.forEach(function(item, i) {
    commands[" "+item] = {
      //prefix: i+'',
      //keys: [i+''],
      callback: function() {
        items = keycodes.codesForGroup(labels[i]);
        keyBox.setItems(items.map(function(keyitem) { return {
          text: " "+keyitem.code+" "+(keyitem.description ? keyitem.description : ''),
          //prefix: keyitem.code.substring(0,1),
          callback: function() {
            clb.assign(keyitem.code);
          }}}
        ));
        screen.render();
        //console.log(keys[labels[item]]);
        state.pushFocus(keyBox);
      }
    }
  });
  leftBox.setItems(commands);
  screen.render();
  state.pushFocus(leftBox);
};
