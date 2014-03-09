var blessed = require('blessed');
var widgets = require('./widgets');
var state = require('../state');
var parent, form;
exports.show = function(parent, action, callback) {
  var value = {};
  var save, cancel, actionInput, actionHelp;
  var actionInfo = typeof(action) === 'undefined' ? { label: "No action selected", help: "Select an action" } : state.firmware.actions.filter(function(a) { return a.id == action.fn; })[0];
  state.debug(actionInfo);
  this.parent = parent;
  form = blessed.form({
    parent: this.parent,
    keys: true, 
    vi: true,
    width: '100%',
    bg: 'blue',
    fg: 'white',
    height: '100%',
    left: 0,
    top: 0
  });
  actionInput = blessed.button({
    parent: form,
    shrink: true,
    padding: {
      left: 1,
      right: 1
    },
    style: {
      bg: "red", 
      fg: "white",
      focus: { bg: "purple" },
      hover: { fg: "yellow" }
    },
    mouse: true,
    keys: true,
    vi: true,
    bg: 'blue',
    fg: 'white',
    height: 1,
    left: 2,
    top: 0,
    content: actionInfo.label
  });
  actionInput.on('press', function() {
    actionList.show();
    state.pushFocus(actionList);
  });
  actionList = widgets.listmenu({
    parent: form,
    left: '30%',
    width: 'shrink',
    top: '0%',
    bg: 'pink',
    height: '100%',
    keyListener: state.keyListener,
    name: "Actions menu",
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
  var items = {};
  state.firmware.actions.forEach(function(a) {
    items[a.label] = {
      label: a.label,
      callback: function() {
        value.id = a.id;
        state.setHelp(a.help);
        actionInput.setContent(a.label);
        state.debug(a);
        state.popFocus();
        actionList.hide();
      }
    }
  });
  actionList.setItems(items);
  actionList.hide();

  cancel = blessed.button({
    parent: form,
    mouse: true,
    keys: true,
    vi: true,
    shrink: true,
    padding: {
      left: 1,
      right: 1
    },
    bottom: 2,
    left: 40,
    name: 'cancel',
    content: "Cancel",
    style: {
      bg: "red", 
      fg: "white",
      focus: { bg: "bright-red" },
      hover: { fg: "yellow" }
    }
  });
  save = blessed.button({
    parent: form,
    mouse: true,
    keys: true,
    vi: true,
    shrink: true,
    padding: {
      left: 1,
      right: 1
    },
    bottom: 2,
    left: 10,
    name: 'save',
    content: "Save",
    style: {
      bg: "green", 
      fg: "white",
      focus: { bg: "bright-green" },
      hover: { fg: "yellow" }
    }
  });
  save.on('press', function() {
    form.submit();
  });
  cancel.on('press', function() {
    callback.cancel();
  });
  form.on('submit', function() {
    //Compose the action and store in state
    callback.save();
  });
  state.pushFocus(form);
  state.setHelp(actionInfo.help);
  state.getScreen().render();
}
exports.hide = function() {
  state.debug("Hide called");
  this.parent.remove(form);
  state.getScreen().render();
}
