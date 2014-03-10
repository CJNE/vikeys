var blessed = require('blessed');
var widgets = require('./widgets');
var leftBox, mainBox, keyBox;
var keycodes = require('../keycodes.js');
var myParent;
var items;
var state;
var labels = keycodes.groups();
var callback;
exports.show = function(parent, globalState, clb) {
  myParent = parent;
  state = globalState;
  callback = clb;
  if(!mainBox) {
    initUI();
  }
  leftBox.setItems([]);
  var commands = {};
  labels.forEach(function(item, i) {
    commands[" "+item] = {
      callback: function() {
        items = keycodes.codesForGroup(labels[i]);
        keyBox.setItems(items.map(function(keyitem) { return {
          text: " "+keyitem.code+" "+(keyitem.description ? keyitem.description : ''),
          callback: function() {
            callback.assign(keyitem.code);
          }}}
        ));
        state.getScreen().render();
        state.pushFocus(keyBox);
      }
    }
  });
  commands[" Actions"] = {
    callback: function() {
      keyBox.setItems(state.actions.map(function(action) { 
        return {
          text: " "+action.mapping+" "+action.fn.slice(7)+" "+action.args.join(", "),
          callback: function() {
            callback.assign(action.mapping);
          }
        }
      }));
      state.getScreen().render();
      state.pushFocus(keyBox);
    }
  };
  leftBox.setItems(commands);
  mainBox.show();
  state.getScreen().render();
  state.pushFocus(leftBox);
};
exports.hide = function() {
  mainBox.hide();
  state.getScreen().render();
}
function initUI() {
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
    keyListener: state.keyListener(),
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
    keyListener: state.keyListener(),
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
    state.getScreen().render();
    callback.cancel();
  });

  keyBox.on('cancel', function() {
    keyBox.setItems([]);
    state.popFocus();
    state.getScreen().render();
  });

  mainBox.append(leftBox);
  mainBox.append(keyBox);
}
