var blessed = require('blessed');

exports.show = function(parent) {
  var box = blessed.box({
    width: '100%',
    height: '100%', 
  });
  parent.append(box);
}


