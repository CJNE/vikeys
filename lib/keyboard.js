var blessed = require('blessed');
var events = require('events');
var key = require('./key');
var board;

function Keyboard(container, aKeyboard, globalState) {
  this.keyboard = aKeyboard;
  this.state = globalState;
  this.container = container;
  this.layer = 0;
  this.coords = {};
  this.yank = [];
  this.rows = 0;
  this.cols = 0;
  if (!(this instanceof events.EventEmitter)) {
    return new Keyboard(container, aKeyboard, globalState);
  }
  events.EventEmitter.call(this);
  this._init();
  this.state.on('keyboard', this.eventListener.bind(this));
}

Keyboard.prototype.__proto__ = events.EventEmitter.prototype;

Keyboard.prototype.getLayer = function() {
  return this.layer;
}

Keyboard.prototype.setLayer = function(l) {
  if(l >= 0 && l < this.state.firmware.MAX_LAYERS) {
    this.layer = l;
    this.state.redraw();
  }
}

Keyboard.prototype._init = function() {
  //Add keys
  var i = 0;
  var keyInstance;
  for(i = 0; i < this.keyboard.keys; i++) {
    keyInstance = new key.Instance(i, this.state);
    this.state.keys.push(keyInstance);
  }
  this.board = blessed.box({
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
  this.container.append(this.board);
  this.originalLayout = this.keyboard.layout;
  this.layout = [];
  this.rows = this.originalLayout.length;
  this.cols = this.originalLayout[0].length;
  for(row = 0; row < this.rows; row++) 
    this.layout.push(this.originalLayout[row].slice(0));

  
  for(row = 0; row < this.rows; row++) {
    for(col = 0; col < this.cols; col++) {
      cur = this.layout[row][col];
      if(cur === null) continue;
      width = height = 1;
      
      for(dy = row + 1; dy < this.rows; dy++) {
        if(this.layout[dy][col] !== cur) break;
        height++;
      }
      for(dx = col + 1; dx < this.cols; dx++) {
        if(this.layout[row][dx] !== cur) break;
        width++;
      }
      for(dy = 0; dy < height; dy++) {
        for(dx = 0; dx < width; dx++) {
          this.layout[row + dy][col + dx] = null;
        }
      }
     
      keybox = blessed.box({
        top: ((100 / this.rows) * row)+"%",
        left: ((100 / this.cols) * col)+"%",
        width: ((100 / this.cols) * width)+'%',
        height: ((100 / this.rows) * height)+'%',
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
      this.coords['key'+cur] = { row: row, col: col, width: width, height: height };
      this.state.keys[cur].setBox(keybox);
      this.board.append(keybox);
      //icol += (dx - col - 1);
    }
  }
  var self = this;
  this.board.on('keypress', function(ch, key) {
    //if(keyListener && !keyListener(ch, key)) return false;
    self.state.debug("Board got key");

    switch(key.name) {
      case 'q':
      case 'escape':
      case 'C-c':
        self.state.setMode('normal');
        break;
      case 'x': //Delete
        self.yank = [];
        self.yank.push(self.state.keys[self.state.currentKey].getMapping(self.layer));
        self.state.keys[self.state.currentKey].setMapping(self.layer, '');
        self.state.setHelp("Deleted ");
        break;
      case 'y': //Yank
        self.yank = [];
        self.yank.push(self.state.keys[self.state.currentKey].getMapping(self.layer));
        self.state.setHelp("Yanked ");
        break;
      case 'p': //Yank
        var mapping = self.yank.pop();
        self.yank.push(mapping);
        self.state.keys[self.state.currentKey].setMapping(self.layer, mapping);
        self.state.setHelp("Pasted");
        break;
      case 'h':
      case 'left':
        self.go(-1, 0);
        break;
      case 'j':
      case 'down':
        self.go(0, 1);
        break;
      case 'k':
      case 'up':
        self.go(0, -1);
        break;
      case 'l':
      case 'right':
        self.go(1, 0);
        break;
      case 'space':
      case 'm':
        if(!self.emit('select', { key: self.state.keys[self.state.currentKey], layer: self.getLayer(), mapping: self.state.keys[self.state.currentKey].getMapping(self.getLayer())}))
          self.state.keys[self.state.currentKey].select();
        break;
      case 'i':
      case 'return':
        self.state.requestCommand(':set ', function(command) {
          self.state.debug("Got command "+command);
          return false;
        });
        return false;
      default:
        self.emit('keypress', ch, key);
    }
    return false;
  });
}
Keyboard.prototype.addMappings = function(maps) {
  var i,j;
  for(i = 0; i < maps.length; i++) {
    for(j = 0; j < this.keyboard.keys; j++) 
      this.state.keys[j].setMapping(i, maps[i][j]);
  }
}
Keyboard.prototype.eventListener = function(event, data) {
  if(event != 'keyboard') return true;
  
  var goX = 0, goY = 0;
  switch(data) {
    case 'focus': this.board.focus(); this.state.setHelp("Exit select mode with escape"); return false;
    case 'layerdown': this.setLayer(this.layer - 1); return false;
    case 'layerup': this.setLayer(this.layer + 1); return false;
    case 'up': this.go(0, -1); break;
    case 'down': this.go(0, 1); break;
    case 'left': this.go(-1, 0); break;
    case 'right': this.go(1, 0); break;
  }
  return false;
}
Keyboard.prototype.go = function(goX, goY) {
  if(goX == 0 && goY == 0) return false;
  var keyCoords = this.coords['key'+this.state.currentKey];
  if(typeof(keyCoords) === 'undefined') {
    return false;
  }
  var x = keyCoords.col;
  var y = keyCoords.row;
  var goToKey = this.state.currentKey;
  while(goToKey == this.state.currentKey || goToKey == null) {
    y += goY;
    x += goX;
    if(y >= this.rows) y = 0;
    if(x >= this.cols) x = 0;
    if(y < 0) y = this.rows - 1;
    if(x < 0) x = this.cols - 1;
    goToKey = this.originalLayout[y][x];
  }
  this.state.currentKey = goToKey;
  var keyInfo = this.state.keys[goToKey];
  this.state.setHelp("Key "+goToKey); //+" mapped to: "+keyInfo
  this.state.redraw();
}

exports.Keyboard = Keyboard;
