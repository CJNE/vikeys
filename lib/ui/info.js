var blessed = require('blessed');
 
var infoBox;
var listeners = [];
function emit(msg) {
  listeners.forEach(function(listener) {
    listener(msg);
  });
}
exports.initLayout = function(container) {
  infoBox = blessed.box({
    top: '0%',
    width: '100%',
    height: '80%',
    style: {
      fg: 'white',
      bg: 'blue',
      border: {
        fg: '#f0f0f0'
      }
    }
  });
  container.append(infoBox);
};

exports.print = function(msg) {
  //infoBox.shiftLine(1);
  infoBox.pushLine(msg);
  emit('redraw');
}
exports.addListener = function(listener) {
  listeners.push(listener);
};


