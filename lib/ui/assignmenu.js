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
        keyBox.focus();
        //state.//pushFocus(keyBox);
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
      keyBox.focus();
    }
  };
  leftBox.setItems(commands);
  mainBox.show();
  state.getScreen().render();
  leftBox.focus();
};
exports.hide = function() {
  mainBox.hide();
  state.getScreen().render();
}
function initUI() {
  mainBox = blessed.box({
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
    height: '100%',
    keyListener: state.keyListener(),
    itemFg: 'white',
    keys: true,
    vi: true,
    mouse: true,
    style: {
      fg: 'white',
      bg: 'blue',
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
    padding: {
      left: 1,
      right: 1
    },
    keyListener: state.keyListener(),
    keys: true,
    vi: true,
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
    state.getScreen().render();
    callback.cancel();
  });

  keyBox.on('cancel', function() {
    keyBox.setItems([]);
    leftBox.focus();
    state.getScreen().render();
  });

  mainBox.append(leftBox);
  mainBox.append(keyBox);
}
