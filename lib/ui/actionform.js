var blessed = require('blessed');
var widgets = require('./widgets');
var parent, form, value, clb;
var save, cancel, actionInput, actionHelp, actionList, paramInputs = [];
var state;
var actionHelp = "";
exports.show = function(parent, action, globalState, callback) {
  state = globalState;
  var actionInfo;
  value = { mapping: action.mapping, types: [], id: null, args: []};
  if(typeof(action.original) !== 'undefined') {
    value.id = action.original.fn;
    actionInfo = state.firmware.actions.filter(function(a) { return a.id == value.id; })[0];
    value.types = actionInfo.params.map(function(p) { return p.type; });
    value.args = action.original.args.slice(0).map(function(originalValue, index) {
      var filter = state.firmware.types[value.types[index]].filter;
      //Check if this value should be pre processed
      if(filter)  return filter.pre(originalValue);
      return originalValue;
    });
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
  actionInput.setIndex(1);
  actionInput.on('press', function() {
    actionList.setFront();
    actionList.show();
    actionList.focus();
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
  save.setIndex(10);
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
  cancel.setIndex(11);
  actionList = widgets.listmenu({
    parent: form,
    left: actionInput.rleft,
    //left: '40%',
    width: '50%',
    top: actionInput.rtop - 1,
    bg: 'blue',
    height: '90%',
    keyListener: state.keyListener(),
    border: {
      type: 'line'
    },
    name: "Actions menu",
    padding: {
      top: 0,
      bottom: 0,
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
        bg: 'blue',
        fg: 'white'
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
  save.on('press', function() {
    form.submit();
  });
  cancel.on('press', function() {
    form.cancel();
  });
  updateAction();
  form.on('focus', function() {
    state.setHelp("Esc to exit and discard changes, tab or j/h to navigate fields");
  });
  actionInput.on('focus', function() {
    state.setHelp(actionHelp + ", press enter to change");
  });
  save.on('focus', function() {
    state.setHelp("Save changes");
  });
  cancel.on('focus', function() {
    state.setHelp("Discard changes");
  });
  form.on('submit', function() {
    value.args = value.args.slice(0).map(function(editedValue, index) {
      var filter = state.firmware.types[value.types[index]].filter;
      //Check if this value should be post processed
      if(filter)  return filter.post(editedValue);
      return editedValue;
    });
    clb.save(value);
    //state.keyboard.clearOnce();
  });
  form.on('cancel', function() {
    clb.cancel();
    //state.keyboard.clearOnce();
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
  actionHelp = actionInfo.help;
  value.args = [];
  //Clear form
  paramInputs.forEach(function(el) {
    el.detach();
  });
  //This is necessary to get the form to reendex keyable elements again
  form._children = null;
  paramInputs = [];
  value.types = actionInfo.params.map(function(p) { return p.type; });
  actionInput.setContent(actionInfo.label);
  state.setHelp(actionInfo.help);
  var row = 5;
  //Render form depending on args
  actionInfo.params.forEach(function(param) {
    var lblText = param.required ? param.label : "("+param.label+")";
    var lbl = createLabel(lblText+":", row++);
    paramInputs.push(lbl);
    //Use default value
    var currentValue = "";
    if(i < value.types.length && value.types[i] == param.type) currentValue = previousArgs[i];
    if((!currentValue || currentValue == "") && typeof(param.default) !== 'undefined') currentValue = param.default;
    //But if the previous value was of the same type, keep it
    value.args.push(currentValue);
    //Render form input
    var input;
    var typeInfo = state.firmware.types[param.type];
    var inputHelp = "";
    switch(typeInfo.ui) {
      case 'select_fn_id':
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
      case 'select_key':
        input = widgets.keybox({
          top: row,
          inputOnFocus: true,
          left: 2,
          groups: typeInfo.groups,
          height: 3,
          border: {
            type: 'line'
          },
          keys: true,
          vi: true,
          width: '30%',
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
        input.on('select', function() {
          state.setMode('select');
        });
        input.on('cancel', function(val) {
          input.setValue(input._.originalValue);
        });
        state.debug("Setting value: "+currentValue);
        input.setValue(currentValue);
        inputHelp = ", type value or press space to select";
        input.onceClb = function(event, key) {
          state.getScreen().focusPop();
          var mapping = key.getMapping(state.keyboard.getLayer());
          this.setValue(key.getMapping(state.keyboard.getLayer()));
          state.setMode('normal');
          this.focus();
          return false;
        };
        input.on('focus', function() {
          //state.keyboard.clearOnce();
          state.keyboard.once('select', input.onceClb.bind(input));
        });
        break;
      case 'number':
        input = widgets.numberbox({
          top: row,
          inputOnFocus: true,
          left: 2,
          min: typeInfo.min,
          max: typeInfo.max,
          height: 3,
          border: {
            type: 'line'
          },
          keys: true,
          vi: true,
          width: '30%',
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
        if(param.type == 'layer') {
          input._.layer = state.keyboard.getLayer();
          input.on('change', function(val) {
            state.keyboard.setLayer(val);
          });
          input.on('blur', function() {
            state.keyboard.setLayer(input._.layer);
          });
        }
        input.setValue(currentValue);
        inputHelp = ", use up/down or j/h to change";
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
        inputHelp = ", press enter to save value or tab/escape to discard changes.";
        break;
    }

    input._.originalValue = currentValue;
    input._.argIndex = i + "";
    input.setIndex(i + 2);

    paramInputs.push(input);
    input.on('focus', function() {
      state.setHelp(param.help + inputHelp);
    });
    row++;
    i++;
  });
  //paramInputs[1].focus();
  actionList.setFront();
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
  lbl.setIndex(4);
  return lbl;
}
