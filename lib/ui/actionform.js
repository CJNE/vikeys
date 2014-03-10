var blessed = require('blessed');
var widgets = require('./widgets');
var state = require('../state');
var parent, form, value, clb;
var save, cancel, actionInput, actionHelp, actionList, paramInputs = [];
exports.show = function(parent, action, callback) {
  var actionInfo;
  value = { types: [], id: null, args: []};
  if(typeof(action) !== 'undefined') {
    value.id = action.fn;
    value.args = action.args.slice(0);
    var actionInfo = state.firmware.actions.filter(function(a) { return a.id == value.id; })[0];
    value.types = actionInfo.params.map(function(p) { return p.type; });
  }
  this.parent = parent;
  clb = callback;
  form = blessed.form({
    parent: this.parent,
    label: "Edit action",
    keys: true, 
    vi: true,
    width: '100%',
    padding: {
      top: 2,
      left: 2,
      right: 2,
      bottom: 2
    },
    border: {
      type: 'line'
    },
    style: {
      border: {
        fg: 'white'
      }
    },
    bg: 'blue',
    fg: 'white',
    height: '100%',
    left: 0,
    top: 0,
  });
  var actionLbl = createLabel("Action:", 2);
  actionInput = blessed.button({
    parent: form,
    shrink: true,
    padding: {
      left: 1,
      right: 1
    },
    style: {
      fg: "white",
      focus: { fg: "green" },
    },
    mouse: true,
    keys: true,
    vi: true,
    height: 1,
    left: 2,
    top: 3
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
    padding: {
      left: 1,
      right: 1
    },
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
        actionList.hide();
        state.popFocus();
        updateAction();
      }
    }
  });
  actionList.on('cancel', function() {
    actionList.hide();
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
    bottom: 3,
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
    bottom: 3,
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
    clb.cancel();
  });
  updateAction();
  form.on('submit', function() {
    //Compose the action and store in state
    callback.save();
  });
  form.on('keypress', function(ch, key) {
    if(state.keyListener(ch, key)) {
      switch(key.full) {
        case 'h':
        case 'escape':
        case 'C-c':
          clb.cancel();
          return false;
      }
    }
  });
  state.pushFocus(form);
  state.getScreen().render();
}
exports.hide = function() {
  state.debug("Hide called");
  this.parent.remove(form);
  state.getScreen().render();
}
function updateAction() {
  var actionInfo;
  var i = 0;
  if(value.id === null) {
    actionInfo = {
      params: [], 
      id: null, 
      label: "No action selected", 
      help: "Select an action" 
    }
  }
  else actionInfo = state.firmware.actions.filter(function(a) { return a.id == value.id; })[0];
  //Clear form
  paramInputs.forEach(function(el) {
    el.detach();
    state.debug("Removing form input" );
  });
  paramInputs = [];
  actionInput.setContent(actionInfo.label);
  state.setHelp(actionInfo.help);
  var row = 5;
  //Render form depending on args
  actionInfo.params.forEach(function(param) {
    var lblText = param.required ? param.label : "("+param.label+")";
    var lbl = createLabel(lblText+":", row++);
    paramInputs.push(lbl);
    //Use default value
    var currentValue = typeof(param.default) === 'undefined' ? "[not set]" : param.default;
    //But if the previous value was of the same type, keep it
    if(i < value.types.length && value.types[i] == param.type) currentValue = value.args[i];
    if(currentValue == "") currentValue = "[not set]";
    //Render form input
    var input;
    switch(param.type) {
      case 'fn_id':
        input = blessed.button({
          top: row++,
          left: 2,
          height: 1,
          width: 'shrink',
          fg: 'white',
          keys: true,
          style: {
            focus: {
              fg: 'green',
            }
          },
          padding: {
            left: 1,
            right: 1
          },
          content: currentValue
        });
        form.insert(input, i+3);
        break;
      default:
        input = blessed.textbox({
          top: row++,
          //inputOnFocus: true,
          left: 2,
          height: 1,
          keys: true,
          width: '80%',
          fg: 'white',
          style: {
            focus: {
              fg: 'green',
            }
          },
          padding: {
            left: 1,
            right: 1
          },
        });
        input.on('keypress', function(ch, key) {
          if(key.full == 'return') {
            if(input.getValue() == "[not set]") input.setValue("");
            input.readInput(function(err, val) {
              state.debug("Got new value "+val);
              if(val == "") input.setValue("[not set]");
            });
            return false;
          }
          return true;
        });
        form.insert(input, i+3);
        input.setValue(currentValue);
        break;
    }

    paramInputs.push(input);
    input.on('focus', function() {
      state.setHelp(param.help);
    });
    value.types = actionInfo.params.map(function(p) { return p.type; });
    row++;
    i++;
  });
  state.getScreen().render();
}
function createLabel(label, row) {
  var lbl = blessed.box({
    parent: form,
    content: label,
    top: row,
    left: 2,
    padding: {
      left: 1,
      right: 1
    },
    height: 1,
    width: '30%',
  });
  return lbl;
}
