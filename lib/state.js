var screen = require('blessed').screen();
var info = require('./ui/info.js');
var focusStack = [];
var listeners = {};


function emit(event, data) {
  if(typeof(listeners[event]) === 'undefined') return;
  var i, clb; 
  for(i = 0; i < listeners[event].length; i++) {
    clb = listeners[event][i];
    if(! clb(event, data)) break;
  }
}

exports.keys = [];
exports.currentKey = 0;
exports.screen = screen;
exports.helpMessage = '';
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

exports.selecting = false;
exports.selectingNumber = false;
exports.layer = 0;
exports.getStatusLine = function(width) {
  var line = '';
  if(exports.selecting) line += "{red-bg} SELECT KEY{red-fg}{yellow-bg}⮀";
  else line += "{green-bg} Normal{green-fg}{yellow-bg}⮀";
  line += "{/}{yellow-bg} L:"+exports.layer+" "
  line += "{/}";
  line += exports.helpMessage;
  exports.helpMessage = '';
  return line;
}

exports.keyListener = function(ch, key) {
  exports.helpMessage = key.full;
  //Global keys
  switch(key.full) {
    case 'S-s':
    case 'i':
      exports.selecting = true;
      emit('redraw');
      return false;
    case '-':
      if(exports.layer > 0) exports.layer--;
      emit('redraw');
      return false;
    case '+':
      if(exports.layer < 72) exports.layer++;
      emit('redraw');
      return false;
  }
  if(exports.selecting || key.shift) {
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
  //Select mode keys
  switch(key.full) {
    case 'q':
    case 'escape':
    case 'C-c':
      exports.selecting = false;
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
        

      
