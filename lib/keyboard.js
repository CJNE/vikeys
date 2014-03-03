var blessed = require('blessed');
var state = require('../lib/state');
var board;

exports.addKey = function(key) {
  if(isLeft(key.getIndex())) left.append(key.getBox(exports));
  else right.append(key.getBox(exports));
};
exports.initLayout = function(container, keyboard) {
  board = blessed.box({
    top: '0',
    left: '0',
    width: '100%',
    padding: 1,
    height: '100%',
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      border: {
        fg: '#f0f0f0'
      },
    },
  });
  container.append(board);
  var layout = keyboard.layout.slice(0);
  var rows = layout.length;
  var cols = layout[0].length;
  var row, col, dx, dy, cur, width, height;
  var keybox;
  
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
        content: ""+((100/rows)*height),
        align: 'center',
        //valign: 'middle',
        tags: true,
        border: {
          type: 'line',
          bg: 'pink',
          fg: 'pink'
        },
        style: {
          fg: 'white',
          bg: 'green',
          border: {
            fg: '#f0f0f0'
          },
          hover: {
            bg: 'red'
          }
        }
      });
      state.keys[cur].setBox(keybox);
      board.append(keybox);
      //icol += (dx - col - 1);
    }
  }
}
