var blessed = require('blessed');
var numberOfKeys = 76;
var left, right;

function isLeft(index) {
  return index < 38;
}
exports.getNumberOfKeys = function() {
  return numberOfKeys;
};
exports.addKey = function(key) {
  if(isLeft(key.getIndex())) left.append(key.getBox(exports));
  else right.append(key.getBox(exports));
};
exports.getPos = function(key) {
  var isLeft = key.getIndex() < 38;
  var offsetIndex = key.getIndex() - (isLeft ? 0 : 38);
  var x = 0, y = 0, w = 1, h= 1;
  switch(offsetIndex) {
    case 0: w = isLeft ? 2 : 1; break;
    case 6: x = isLeft ? 7 : 6; w = isLeft ? 1 : 2; break;
    case 7: y = 1; h = isLeft ? 1 : 2; w = isLeft ? 2 : 1; break;
    case 13: x = isLeft ? 7 : 6; y = 1; h = isLeft ? 2 : 1; w = isLeft ? 1 : 2; break;
    case 14: x = isLeft ? 0 : 1; y = 2; w = isLeft ? 2 : 1; break;
    case 19: x = isLeft ? 6 : 6; y = 2; w = isLeft ? 1 : 2; break;
    case 20: y = 3; h = isLeft ? 1 : 2; w = isLeft ? 2 : 1; break;
    case 26: x = isLeft ? 7 : 6; y = 3; h = isLeft ? 2 : 1; w = isLeft ? 1 : 2; break;
    case 32: y = 5; x = isLeft ? 5 : 1; break;
    case 33: y = 5; x = isLeft ? 6 : 2; break;
    case 34: y = 6; x = isLeft ? 6 : 1; break;
    case 35: y = isLeft ? 6 : 7; h = isLeft ? 2 : 1; x = isLeft ? 4 : 1; break;
    case 36: y = 6; h = 2; x = isLeft ? 5 : 2; break;
    case 37: y = isLeft ? 7 : 6; h = isLeft ? 1 : 2; x = isLeft ? 6 : 3; break;
    default: {
      if(offsetIndex < 7) x = isLeft ? offsetIndex + 1 : offsetIndex;
      else if(offsetIndex < 14) { 
        y = 1;
        x = offsetIndex - (isLeft ? 6 : 7);
      }
      else if(offsetIndex < 20) {
        y = 2; 
        x = offsetIndex - (isLeft ? 13 : 13);
      }
      else if(offsetIndex < 26) {
        y = 3;
        x = offsetIndex - (isLeft ? 19 : 20);
      } 
      else {
        y = 4;
        x = offsetIndex - (isLeft ? 26 : 25);
      } 
      break;
    }
  } 
  return { 'x': x, 'y': y, 'w': w, 'h': h };
}
exports.initLayout = function(container) {
  left = blessed.box({
    top: '0',
    left: '0',
    width: '50%',
    height: '100%',
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      bg: 'purple',
      border: {
        fg: '#f0f0f0'
      },
    },
    keys: true,
    vi: true
  });
  right = blessed.box({
    top: '0',
    left: '50%',
    width: '50%',
    height: '100%',
    keys: true,
    vi: true,
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      bg: 'magenta',
      border: {
        fg: '#f0f0f0'
      },
    }
  });
  container.append(left);
  container.append(right);
}
