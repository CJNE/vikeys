var blessed = require('blessed');
var widgets = require('./ui/widgets');
var screen = null;
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


exports.keyboardModel = null;
exports.keyboard = null;
exports.firmware = null;
exports.keys = [];
exports.actions = [];
exports.drawStatus = function() {
  var line = '';
  if(mode == 'select') line += "{red-bg} SELECT KEY {red-fg}{yellow-bg}⮀";
  else line += "{green-bg} Normal {green-fg}{yellow-bg}⮀";
  line += "{white-fg}Layer "+exports.keyboard.getLayer()+" {/}{yellow-fg}⮀"
  line += "{/} ";
  line += helpMessage;
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
      emit('keyboard', 'focus');
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
      redraw();
      return false;
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
  exports.drawStatus();
}
exports.redraw = redraw;
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
