var blessed = require('blessed');
var widgets = require('./ui/widgets');

var screen = null;
var listeners = {};
var mode = "normal";
var helpMessage = '';

function emit(event, data) {
  if(typeof(listeners[event]) === 'undefined') return;
  var i, clb; 
  for(i = 0; i < listeners[event].length; i++) {
    clb = listeners[event][i];
    if(! clb(event, data)) break;
  }
}


exports.keyboardModel = null;
exports.keyboard = null;
exports.firmware = null;
exports.keys = [];
exports.actions = [];
exports.fn_ids = [];
exports.getMode = function() {
  return mode;
}
var modeFocus = { normal: null };
var previousMode;
exports.setMode = function(aMode) {
  if(aMode == mode) return mode;
  previousMode = mode;
  modeFocus[previousMode] = screen.focused;
  switch(aMode) {
    case "normal":
      mode = "normal";
      modeFocus.normal.focus();
      break;
    case "select":
      mode = "select";
      emit('keyboard', 'focus');
      break;
    case "command":
      mode = "command";
      commandMode();
      break;
    default: 
      screen.debug("Mode not supported: "+aMode);
      return mode;
  }
  screen.debug("Mode set to "+mode);
  emit('mode', { current: mode, previous: previousMode });
  return mode;
}
exports.getScreen = function() {
  return screen;
}
exports.setScreen = function(s) {
  screen = s;
}
exports.getStatusBar = function() {
  return screen.get('statusbar');
}
exports.currentKey = 0;
exports.statusExtra = '';
exports.debug = function(obj) {
  screen.debug(obj);
}
/*exports.setHelp = function(str) {
  statusBar.setMessage(str);
}*/

exports.getStatusLine = function(width) {
  return line;
}


exports.keyListener = function(ch, key) {
  exports.debug("Getting state key listener");
  if(typeof(key) !== 'undefined') return listener(ch, key);
  return listener;
}
var listener = function(ch, key) {
  exports.debug("State key "+key.full);
  //Global keys
  switch(key.full) {
    case 'S-s':
    case 'i':
      if(mode != 'select') {
        exports.setMode('select');
        redraw();
        return false;
      }
      break;
    case '-':
      emit('keyboard', 'layerdown');
      return false;
    case '+':
      emit('keyboard', 'layerup');
      return false;
    case ':':
      exports.setMode('command');
      return false;
  }

  //Shifted navigation
  if(key.shift) {
    switch(key.name) {
      case 'h':
      case 'left':
        emit('keyboard', 'left');
        return false;
      case 'j':
      case 'down':
        emit('keyboard', 'down');
        return false;
      case 'k':
      case 'up':
        emit('keyboard', 'up');
        return false;
      case 'l':
      case 'right':
        emit('keyboard', 'right');
        return false;
    }
  }
  return true;
}

function redraw() {
  for(i = 0; i < exports.keyboardModel.keys; i++) {
    exports.keys[i].draw();
  }
  screen.render();
}
exports.redraw = redraw;
exports.on = function(event, clb) {
  if(typeof(listeners[event]) === 'undefined') listeners[event] = [];
  listeners[event].push(clb);
}
exports.requestCommand = function(command, callback) {
  previousMode = mode;
  mode = command;
  commandMode(command, callback);
  screen.render();
}
function commandMode(command, callback) {
  var commandLine = widgets.commandbox({
    bottom: 0,
    width: '100%',
    height: 1,
    value: ":",
    style: {
      bg: 'blue',
      fg: 'white'
    },
    content: command || ":"
  });
  var statusBar = screen.get('statusbar');
  statusBar.bottom = 1;
  screen.append(commandLine);
  //saveName.focus();
  commandLine.on('completion', function(matches) {
    exports.debug("Completion");
    var statusBar = screen.get('statusbar');
    if(matches === null || matches.length == 1) {
      exports.statusExtra = '';
      statusBar.height = 1;
      exports.statusExtra = ''; //matches.join(' ');
    } else {
      statusBar.height = 2;
      exports.statusExtra = matches.join(' ');
    }
  });
  commandLine.readInput(function(err, command) {
    //commandLine.focus();
    switch(command) {
      case ':q':
        process.exit(0);
        break;
      case ':':
        //Do nothing
        break;
      default:
        helpMessage = "Command not found: "+command;
        break;
    }
    if(callback) {
      exports.debug("Have callback");
      var ret = callback(command);
      exports.debug("Callback return");
      if(!ret) helpMessage = " exec";
    }
    screen.remove(commandLine);
    statusBar.bottom = 0;
    statusBar.height = 1;
    exports.debug("Restoring mode to "+previousMode);
    exports.setMode(previousMode);
    screen.render();
    exports.debug("Command mode done");
  });
}
