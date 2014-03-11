var blessed = require('blessed');
var key = require('./key');
var state;
var board;
var layout;
var rows, cols;
var currentRow = 0, currentCol = 0;
var coords = {};
var originalLayout;
var yank = [];
var keyListener = null;
var layer = 0;
var keyboard;
exports.getLayer = function() { return layer; };
function setLayer(l) {
  if(l >= 0 && l < state.firmware.MAX_LAYERS) {
    layer = l;
    state.redraw();
  }
}
exports.setLayer = setLayer;
exports.setKeyListener = function(l) {
  keyListener = l;
}
exports.init = function(container, aKeyboard, globalState) {
  keyboard = aKeyboard;
  state = globalState;
  //Add keys
  var i = 0;
  var keyInstance;
  for(i = 0; i < keyboard.keys; i++) {
    keyInstance = new key.Instance(i, state);
    state.keys.push(keyInstance);
  }
  board = blessed.box({
    top: '0%',
    left: '0%',
    width: '100%',
    //padding: 1,
    height: '100%',
    border: {
      fg: 'light-black',
      type: 'line'
    },
    style: {
      fg: 'white',
      border: {
        fg: 'light-black',
        bg: 'light-black'
      },
    },
  });
  var row, col, dx, dy, cur, width, height;
  var keybox;
  container.append(board);
  originalLayout = keyboard.layout;
  layout = [];
  rows = originalLayout.length;
  cols = originalLayout[0].length;
  for(row = 0; row < rows; row++) 
    layout.push(originalLayout[row].slice(0));

  
  for(row = 0; row < rows; row++) {
    for(col = 0; col < cols; col++) {
      cur = layout[row][col];
      if(cur === null) continue;
      width = height = 1;
      
      for(dy = row + 1; dy < rows; dy++) {
        if(layout[dy][col] !== cur) break;
        height++;
      }
      for(dx = col + 1; dx < cols; dx++) {
        if(layout[row][dx] !== cur) break;
        width++;
      }
      for(dy = 0; dy < height; dy++) {
        for(dx = 0; dx < width; dx++) {
          layout[row + dy][col + dx] = null;
        }
      }
     
      keybox = blessed.box({
        top: ((100 / rows) * row)+"%",
        left: ((100 / cols) * col)+"%",
        width: ((100 / cols) * width)+'%',
        height: ((100 / rows) * height)+'%',
        content: "", //+((100/rows)*height),
        align: 'center',
        //valign: 'middle',
        tags: true,
        border: {
          type: 'line',
          bg: 'light-black',
          fg: 'light-blue'
        },
        style: {
          bg: 'light-black',
          fg: 'light-blue',
          hover: {
            bg: 'light-red'
          }
        }
      });
      coords['key'+cur] = { row: row, col: col, width: width, height: height };
      state.keys[cur].setBox(keybox);
      board.append(keybox);
      //icol += (dx - col - 1);
    }
  }
  board.on('keypress', function(ch, key) {
    if(keyListener && !keyListener(ch, key)) return false;
    state.debug("Board got key");

    switch(key.name) {
      case 'q':
      case 'escape':
      case 'C-c':
        board.screen.focusPop();
        state.setMode('normal');
        break;
      case 'x': //Delete
        yank = [];
        yank.push(state.keys[state.currentKey].getMapping(state.getulayer));
        state.keys[state.currentKey].setMapping(layer, '');
        state.setHelp("Deleted ");
        break;
      case 'y': //Yank
        yank = [];
        yank.push(state.keys[state.currentKey].getMapping(layer));
        state.setHelp("Yanked ");
        break;
      case 'p': //Yank
        var mapping = yank.pop();
        yank.push(mapping);
        state.keys[state.currentKey].setMapping(layer, mapping);
        state.debug("Pasted");
        break;
      case 'h':
      case 'left':
        go(-1, 0);
        break;
      case 'j':
      case 'down':
        go(0, 1);
        break;
      case 'k':
      case 'up':
        go(0, -1);
        break;
      case 'l':
      case 'right':
        go(1, 0);
        break;
      case 'space':
      case 'm':
        state.keys[state.currentKey].select();
        break;
      default:
        return true;
    }
    return false;
  });
}
function addMappings(maps) {
  var i,j;
  for(i = 0; i < maps.length; i++) {
    for(j = 0; j < keyboard.keys; j++) 
      state.keys[j].setMapping(i, maps[i][j]);
  }
}
exports.addMappings = addMappings;
exports.eventListener = function(event, data) {
  if(event != 'keyboard') return true;
  
  var goX = 0, goY = 0;
  switch(data) {
    case 'focus': board.screen.focusPush(board); state.setHelp("Exit select mode with escape"); return false;
    case 'layerdown': setLayer(layer - 1); return false;
    case 'layerup': setLayer(layer + 1); return false;
    case 'up': go(0, -1); break;
    case 'down': go(0, 1); break;
    case 'left': go(-1, 0); break;
    case 'right': go(1, 0); break;
  }
  return false;
}
function go(goX, goY) {
  if(goX == 0 && goY == 0) return false;
  var keyCoords = coords['key'+state.currentKey];
  if(typeof(keyCoords) === 'undefined') {
    console.log('key'+state.currentKey);
    return false;
  }
  var x = keyCoords.col;
  var y = keyCoords.row;
  var goToKey = state.currentKey;
  while(goToKey == state.currentKey || goToKey == null) {
    y += goY;
    x += goX;
    if(y >= rows) y = 0;
    if(x >= cols) x = 0;
    if(y < 0) y = rows - 1;
    if(x < 0) x = cols - 1;
    goToKey = originalLayout[y][x];
  }
  state.currentKey = goToKey;
  var keyInfo = state.keys[goToKey];
  state.setHelp("Key "+goToKey); //+" mapped to: "+keyInfo
  state.redraw();
}
