var blessed = require('blessed');
var state;
var board;
var layout;
var rows, cols;
var currentRow = 0, currentCol = 0;
var coords = {};
var originalLayout;
var yank = [];
exports.initLayout = function(container, keyboard, globalState) {
  state = globalState;
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
}
exports.eventListener = function(event, data) {
  var goX = 0, goY = 0;
  switch(data) {
    case 'yank': 
      yank = [];
      yank.push(state.keys[state.currentKey].getMapping(state.layer));
      state.debug("Yanked");
      return false;
    case 'delete':
      yank = [];
      yank.push(state.keys[state.currentKey].getMapping(state.layer));
      state.keys[state.currentKey].setMapping(state.layer, '');
      state.debug("Deleted");
      return false;
    case 'paste':
      var mapping = yank.pop();
      yank.push(mapping);
      state.keys[state.currentKey].setMapping(state.layer, mapping);
      state.debug("Pasted");
      return false;
    case 'up': goY = -1; break;
    case 'down': goY = 1; break;
    case 'left': goX = -1; break;
    case 'right': goX = 1; break;
  }
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
  return false;
}
