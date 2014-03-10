var blessed = require('blessed');
var widgets = require('./ui/widgets');
var screen = null;
var focusStack = [];
var listeners = {};
var mode = "normal";
var helpMessage = '';
var statusBar = blessed.box({
  bottom: 0,
  left: 0,
  right: 0,
  width: '100%',
  height: 1,
  tags: true,
  style: {
    bg: 'lightyellow',
    fg: 'white',
    border: {
      bg: 'lightyellow',
      fg: 'purple'
    }
  }
});


function emit(event, data) {
  if(typeof(listeners[event]) === 'undefined') return;
  var i, clb; 
  for(i = 0; i < listeners[event].length; i++) {
    clb = listeners[event][i];
    if(! clb(event, data)) break;
  }
}


exports.keyboard = null;
exports.firmware = null;
exports.keys = [];
exports.actions = [];
exports.drawStatus = function() {
  var line = '';
  if(mode == 'select') line += "{red-bg} SELECT KEY {red-fg}{yellow-bg}⮀";
  else line += "{green-bg} Normal {green-fg}{yellow-bg}⮀";
  line += "{white-fg}Layer "+exports.layer+" {/}{yellow-fg}⮀"
  line += "{/} ";
  line += helpMessage;
  helpMessage = '';
  if(exports.statusExtra != '') line += "\n"+exports.statusExtra;
  statusBar.setContent(line);
  screen.render();
}
exports.getMode = function() {
  return mode;
}
exports.setMode = function(aMode) {
  switch(aMode) {
    case "normal":
      mode = "normal";
      break;
    case "select":
      mode = "select";
      break;
    case "command":
      mode = "command";
      commandMode();
      break;
    default: 
      screen.debug("Mode not supported: "+aMode);
      break
  }
  screen.debug("Mode set to "+mode);
  exports.drawStatus();
  return mode;
}
exports.getScreen = function() {
  return screen;
}
exports.setScreen = function(s) {
  screen = s;
}
exports.getStatusBar = function() {
  return statusBar;
}
exports.currentKey = 0;
exports.statusExtra = '';
exports.debug = function(obj) {
  screen.debug(obj);
}
exports.setHelp = function(str) {
  helpMessage = str;
  exports.drawStatus();
}
exports.pushFocus = function(e) {
  focusStack.push(e);
  e.focus();
  return e;
}
exports.popFocus = function() {
  var e = focusStack.pop();
  exports.focus();
  return e;
}
exports.focus = function() {
  if(focusStack.length < 1) return;
  var lastFocus = focusStack[focusStack.length - 1];
  lastFocus.focus();
  return lastFocus;
}

exports.selectingNumber = false;
exports.layer = 0;
exports.getStatusLine = function(width) {
  return line;
}


exports.keyListener = function(ch, key) {
  exports.debug("Getting state key listener");
  if(typeof(key) !== 'undefined') return listener(ch, key);
  return listener;
}
var listener = function(ch, key) {
  exports.debug("Key "+key.full);
  //Global keys
  switch(key.full) {
    case 'S-s':
    case 'i':
      exports.setMode('select');
      emit('redraw');
      return false;
    case '-':
      if(exports.layer > 0) exports.layer--;
      emit('redraw');
      return false;
    case '+':
      if(exports.layer < 32) exports.layer++;
      emit('redraw');
      return false;
    case ':':
      exports.setMode('command');
      return false;
  }

  //Select mode or shifted
  if(mode == 'select' || key.shift) {
    switch(key.name) {
      case 'h':
      case 'left':
        exports.helpMessage = 'left';
        emit('keyboard', 'left');
        break;
      case 'j':
      case 'down':
        emit('keyboard', 'down');
        break;
      case 'k':
      case 'up':
        emit('keyboard', 'up');
        break;
      case 'l':
      case 'right':
        emit('keyboard', 'right');
        break;
      case 'space':
      case 'm':
        exports.keys[exports.currentKey].select();
        break;
    }
  }
  else return true;

  //Select mode unshifted keys
  switch(key.full) {
    case 'q':
    case 'escape':
    case 'C-c':
      exports.setMode('normal');
      break;
    case 'x': //Delete
      emit('keyboard', 'delete');
      break;
    case 'y': //Yank
      emit('keyboard', 'yank');
      break;
    case 'p': //Yank
      emit('keyboard', 'paste');
      break;
    default: 
      break;
  }

  emit('redraw');
  return false;
}

exports.on = function(event, clb) {
  if(typeof(listeners[event]) === 'undefined') listeners[event] = [];
  listeners[event].push(clb);
}
function commandMode() {
  var commandLine = widgets.commandbox({
    bottom: 0,
    width: '100%',
    height: 1,
    value: ":",
    style: {
      bg: 'blue',
      fg: 'white'
    }
  });
  statusBar.bottom = 1;
  screen.append(commandLine);
  //saveName.focus();
  commandLine.on('completion', function(matches) {
    if(matches === null || matches.length == 1) {
      exports.statusExtra = '';
      statusBar.height = 1;
      exports.statusExtra = ''; //matches.join(' ');
    } else {
      statusBar.height = 2;
      exports.statusExtra = matches.join(' ');
    }
    exports.drawStatus();
  });
  commandLine.readInput(function(err, command) {
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
    screen.remove(commandLine);
    statusBar.bottom = 0;
    statusBar.height = 1;
    exports.setMode('normal');
  });
}
