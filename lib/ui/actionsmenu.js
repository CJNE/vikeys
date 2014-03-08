var blessed = require('blessed');
var widgets = require('./widgets');
var actionsBox, mainBox, editBox;
var myParent;
var items;
var state = require('../state');
var callback;

exports.show = function(parent, clb) {
  myParent = parent;
  callback = clb;
  if(!mainBox) initUI();
  actionsBox.setItems([]);
  var commands = {};
  var i, label;
  for(i = 0; i < state.firmware.MAX_ACTIONS; i++) {
    label = typeof(state.actions[i]) === 'undefined' ? "Empty" : state.actions[i].fn.slice(7)+" "+state.actions[i].args.join(", ");
    if(i < 10) label = " "+label;
    commands[" FN"+i+" "+label] = {
      action: state.actions[i],
      //prefix: i+'',
      //keys: [i+''],
      callback: function() {
        if(typeof(this.action) === 'undefined') this.action = { fn: "empty", args: [] };
        editBox.setItems([
          {
            text: " "+this.action.fn.slice(7)+": "+this.action.args.join(", "),
            callback: function() {
            }
          },
          {
            text: " Edit",
            callback: function() {
            }
          }
        ]);
        state.getScreen().render();
        state.pushFocus(editBox);
      }
    }
  }
  actionsBox.setItems(commands);
  mainBox.show();
  state.getScreen().render();
  state.pushFocus(actionsBox);
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
  editBox = widgets.listmenu({
    left: '30%',
    width: 'shrink',
    top: '0%',
    bg: 'pink',
    height: '100%',
    keyListener: state.keyListener,
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
  actionsBox = widgets.listmenu({
    width: '30%',
    heigth: '100%',
    left: '0%',
    itemFg: 'white',
    keyListener: state.keyListener,
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
  actionsBox.on('cancel', function() {
    actionsBox.setItems([]);
    state.popFocus();
    state.getScreen().render();
    callback.cancel();
  });

  editBox.on('cancel', function() {
    editBox.setItems([]);
    state.popFocus();
    state.getScreen().render();
  });

  mainBox.append(actionsBox);
  mainBox.append(editBox);
}
