var blessed = require('blessed');
var widgets = require('./widgets');
var parent, form, value, clb;
var save, cancel, actionInput, actionHelp, actionList, paramInputs = [];
var state;
exports.show = function(parent, action, globalState, callback) {
  state = globalState;
  var actionInfo;
  value = { types: [], id: null, args: []};
  if(typeof(action.original) !== 'undefined') {
    value.id = action.original.fn;
    value.args = action.original.args.slice(0);
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
    actionList.setFront();
    actionList.focus();
    //state.pushFocus(actionList);
  });
  actionList = widgets.listmenu({
    parent: form,
    left: '30%',
    width: 'shrink',
    top: '0%',
    bg: 'pink',
    height: '100%',
    keyListener: state.keyListener(),
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
        actionInput.focus();
        actionList.hide();
        updateAction();
      }
    }
  });
  actionList.on('cancel', function() {
    actionList.hide();
    actionInput.focus();
  });
  actionList.setItems(items);
  actionList.hide();
  cancel = blessed.button({
    parent: form,
    mouse: true,
    keys: true,
    vi: true,
    shrink: true,
    border: {
      type: 'line'
    },
    padding: {
      left: 1,
      right: 1
    },
    bottom: 3,
    left: 40,
    name: 'cancel',
    content: "Cancel",
    style: {
      fg: "white",
      focus: { 
        border: {
          fg: "red" 
        }
      },
      hover: { fg: "yellow" }
    }
  });
  save = blessed.button({
    parent: form,
    mouse: true,
    keys: true,
    vi: true,
    shrink: true,
    border: {
      type: 'line'
    },
    padding: {
      left: 1,
      right: 1
    },
    bottom: 3,
    left: 10,
    name: 'save',
    content: "Save",
    style: {
      fg: "white",
      focus: { 
        border: {
          fg: "red" 
        }
      },
      hover: { fg: "yellow" }
    }
  });
  save.on('press', function() {
    form.submit();
  });
  cancel.on('press', function() {
    form.cancel();
  });
  updateAction();
  form.on('submit', function() {
    //Compose the action and store in state
    clb.save(value);
  });
  form.on('cancel', function() {
    clb.cancel();
  });
  form.on('keypress', function(ch, key) {
    if(state.keyListener(ch, key)) {
      switch(key.full) {
        case 'h':
        case 'escape':
        case 'C-c':
          form.cancel();
          return false;
      }
    }
  });
  form.focus();
  //state.pushFocus(form);
  state.getScreen().render();
}
exports.hide = function() {
  paramInputs.forEach(function(el) {
    el.detach();
  });
  form.detach();
  state.getScreen().render();
}
function updateAction() {
  var actionInfo;
  var i = 0;
  var previousArgs = value.args.slice(0);
  if(value.id === null) {
    actionInfo = {
      params: [], 
      id: null, 
      label: "No action selected", 
      help: "Select an action" 
    }
  }
  else actionInfo = state.firmware.actions.filter(function(a) { return a.id == value.id; })[0];
  value.args = [];
  //Clear form
  paramInputs.forEach(function(el) {
    el.detach();
  });
  //This is necessary to get the form to reendex keyable elements again
  form._children = null;
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
    if(i < value.types.length && value.types[i] == param.type) currentValue = previousArgs[i];
    value.args.push(currentValue);
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
            fg: 'white',
            focus: {
              fg: 'green',
              bg: 'white'
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
          top: row,
          inputOnFocus: true,
          left: 2,
          height: 3,
          border: {
            type: 'line'
          },
          keys: true,
          vi: true,
          width: '80%',
          fg: 'white',
          style: {
            focus: {
              fg: 'green',
              border: {
                fg: 'red'
              }
            }
          },
          padding: {
            left: 1,
            right: 1
          },
        });
        row += 3;
        form.insert(input, i+3);
        input.on('submit', function(val) {
          input._.originalValue = val;
          value.args[input._.argIndex] = val;
        });
        input.on('cancel', function(val) {
          input.setValue(input._.originalValue);
        });
        input.setValue(currentValue);
        break;
    }

    input._.originalValue = currentValue;
    input._.argIndex = i + "";
    paramInputs.push(input);
    input.on('focus', function() {
      state.setHelp(param.help);
    });
    value.types = actionInfo.params.map(function(p) { return p.type; });
    row++;
    i++;
  });
  //paramInputs[1].focus();
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
