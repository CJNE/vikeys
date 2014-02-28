var screen = require('blessed').screen();
var focusStack = [];

exports.screen = screen;
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
exports.layer = 0;
exports.getStatusLine = function(width) {
  var line = '';
  if(exports.selecting) line += "{red-bg} SELECT KEY{red-fg}{yellow-bg}⮀";
  else line += "{green-bg} Normal{green-fg}{yellow-bg}⮀";
  line += "{/}{yellow-bg} L:"+exports.layer+" "
  line += "{/}";
  return line;
}

