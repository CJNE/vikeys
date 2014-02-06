var blessed = require('blessed');

// Create a screen object.
var screen = blessed.screen();

// Create a box perfectly centered horizontally and vertically.
var left = blessed.box({
  top: '0',
  left: '0',
  width: '50%',
  height: '70%',
  tags: true,
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
var right = blessed.box({
  top: '0',
  left: '50%',
  width: '50%',
  height: '70%',
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
var form = blessed.form({
  top: '72%',
  left: '0%',
  width: '80%',
  height: '20%',
  style: {
    fg: 'white',
    bg: 'blue',
    border: {
      fg: '#f0f0f0'
    }
  },
  keys: 'vi'
});
var infoBox = blessed.box({
  top: '72%',
  left: '80%',
  width: '20%',
  style: {
    fg: 'red',
    bg: 'black',
    border: {
      fg: '#f0f0f0'
    }
  }
});

function info(msg) {
  //infoBox.shiftLine(1);
  infoBox.pushLine(msg);
  screen.render();
}



//38 keys
var Key = function(index) {
  var self = this;
  var box = null;
  var index = index;
  var selected = false;
  self.isLeft = function() { return index < 38; };
  var mappings = new Array(72);
  self.select = function(doSelect) {
    selected = doSelect;
  }
  self.isSelected = function() {
    return selected;
  }
  self.getMapping = function(layer) {
    return mappings[layer];
  }
  self.setMapping = function(layer, mapping) {
    mappings[layer] = mapping;
  }

  self.draw = function() {
    if(inputSelectKey) box.setContent(index+"");
    else box.setContent(self.getMapping(selectedLayer));
    if(selected) box.style.bg = 'red';
    else box.style.bg = 'green';
  };
  self.getBox = function() {
    if(box == null) {
      var pos = self.getPos();
      box = blessed.box({
        top: (100 / 8 * pos.y)+"%",
        left: (100 / 8 * pos.x)+"%",
        width: (100 / 8 * pos.w)+'%',
        height: (100 / 8 * pos.h)+'%',
        content: "",
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
    }
    box.on('mouseover', function() {
      info("Hover on "+index);
    });
    box.on('click', function() {
      selected = !selected;
      redraw();
      if(inputSelectKey !== null) requestKey();
    });
    return box;
  }
  self.getPos = function() {
    var offsetIndex = index - (self.isLeft() ? 0 : 38);
    var x = 0, y = 0, w = 1, h= 1;
    switch(offsetIndex) {
      case 0: w = self.isLeft() ? 2 : 1; break;
      case 6: x = self.isLeft() ? 7 : 6; w = self.isLeft() ? 1 : 2; break;
      case 7: y = 1; h = self.isLeft() ? 1 : 2; w = self.isLeft() ? 2 : 1; break;
      case 13: x = self.isLeft() ? 7 : 6; y = 1; h = self.isLeft() ? 2 : 1; w = self.isLeft() ? 1 : 2; break;
      case 14: x = self.isLeft() ? 0 : 1; y = 2; w = self.isLeft() ? 2 : 1; break;
      case 19: x = self.isLeft() ? 6 : 6; y = 2; w = self.isLeft() ? 1 : 2; break;
      case 20: y = 3; h = self.isLeft() ? 1 : 2; w = self.isLeft() ? 2 : 1; break;
      case 26: x = self.isLeft() ? 7 : 6; y = 3; h = self.isLeft() ? 2 : 1; w = self.isLeft() ? 1 : 2; break;
      case 32: y = 5; x = self.isLeft() ? 5 : 1; break;
      case 33: y = 5; x = self.isLeft() ? 6 : 2; break;
      case 34: y = 6; x = self.isLeft() ? 6 : 1; break;
      case 35: y = self.isLeft() ? 6 : 7; h = self.isLeft() ? 2 : 1; x = self.isLeft() ? 4 : 1; break;
      case 36: y = 6; h = 2; x = self.isLeft() ? 5 : 2; break;
      case 37: y = self.isLeft() ? 7 : 6; h = self.isLeft() ? 1 : 2; x = self.isLeft() ? 6 : 3; break;
      default: {
        if(offsetIndex < 7) x = self.isLeft() ? offsetIndex + 1 : offsetIndex;
        else if(offsetIndex < 14) { 
          y = 1;
          x = offsetIndex - (self.isLeft() ? 6 : 7);
        }
        else if(offsetIndex < 20) {
          y = 2; 
          x = offsetIndex - (self.isLeft() ? 13 : 13);
        }
        else if(offsetIndex < 26) {
          y = 3;
          x = offsetIndex - (self.isLeft() ? 19 : 20);
        } 
        else {
          y = 4;
          x = offsetIndex - (self.isLeft() ? 26 : 25);
        } 
        break;
      }
    } 
    return { 'x': x, 'y': y, 'w': w, 'h': h };
  }
}

var i = 0;
var keys = [];
var keybox;
var pos;
var key;
var selectedLayer = 0;
var inputSelectKey = null;
var selectedKey = -1;
for(i = 0; i < 76; i++) {
  key = new Key(i);
  keys.push(key);
  if(key.isLeft()) left.append(key.getBox());
  else right.append(key.getBox());
}

function requestKey() {
  if(inputSelectKey !== null) {
    form.remove(inputSelectKey);
    isSelectingKey = false;
    inputSelectKey = null;
    redraw();
    return;
  }
  info("Select key: ");
  // Select key input
  inputSelectKey = blessed.textbox({
    content: "Input key number, or click a key: ",
    width: '40%',
    height: '20%',
    style: {
      fg: 'white',
      bg: 'magenta',
      border: {
        fg: '#f0f0f0'
      },
    },
    border: {
      style: 'line'
    },
    top: '50%',
    left: '50%'
  });
  redraw();
  form.append(inputSelectKey);
  inputSelectKey.focus();
  inputSelectKey.readInput(function(ch,text) {
    info("Got "+text);
    var selectedKey = parseInt(text);
    if(selectedKey >= 0) keys[selectedKey].select(true);
    requestKey();
  });
}
// Append our box to the screen.
screen.append(left);
screen.append(right);
screen.append(form);
screen.append(infoBox);
form.focus();

// If box is focused, handle `enter`/`return` and give us some more content.
screen.key('k', function(ch, key) {
  requestKey();
});
function redraw() {
  for(i = 0; i < 76; i++) {
    keys[i].draw();
  }
  screen.render();
}

// If our box is clicked, change the content.
left.on('click', function(data) {
  left.setContent('{center}Some different {red-fg}content{/red-fg}.{/center}');
  screen.render();
});

// If box is focused, handle `enter`/`return` and give us some more content.
left.key('enter', function(ch, key) {
  left.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
  left.setLine(1, 'bar');
  left.insertLine(1, 'foo');
  screen.render();
});

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// Focus our element.
left.focus();

// Render the screen.
screen.render();

