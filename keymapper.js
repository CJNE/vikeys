var blessed = require('blessed');
var keyboard = require('./keyboards/ergodox');
var screen = blessed.screen();
var key = require('./lib/key');
var state = require('./lib/state')
var firmware = require('./firmwares/tmk.js');
var info = require('./lib/ui/info.js');

var ui = blessed.box({
  top: '50%',
  left: '0%',
  width: '100%',
  height: '50%',
  style: {
    fg: 'white',
    bg: 'blue',
    border: {
      fg: '#f0f0f0'
    }
  },
  keys: 'vi'
});
var keyboardBox = blessed.box({
  top: '0%',
  left: '0%',
  width: '100%',
  height: '50%'
});
var mainMenu = blessed.box({
  width: '100%',
  bottom: 0,
  height: 1,
  content: ' 1:load 2:select 3:assign',
  style: {
    fg: 'white',
    bg: 'blue'
  }
});
function eventListener(msg) {
  switch(msg) {
    case "redraw": screen.render(); break;
  }
}
// Append our box to the screen.
screen.append(mainMenu);
screen.append(ui);
screen.append(keyboardBox);
info.initLayout(ui);
info.addListener(eventListener);
keyboard.initLayout(keyboardBox);


var i = 0;
var keys = [];
var keybox;
var pos;
var keyInstance;
var selectedLayer = 0;
var inputSelectKey = null;
var selectedKey = -1;
for(i = 0; i < keyboard.getNumberOfKeys(); i++) {
  keyInstance = new key.Instance(i);
  keys.push(keyInstance);
  keyboard.addKey(keyInstance);
}

function requestFile(clb) {
  var fm = blessed.filemanager({
    keys: true,
    vi: true,
    style: {
      fg: 'white',
      bg: 'red'
    }
  });

  ui.append(fm);
  fm.up();
  fm.pick('./', function(error, file) {
    firmware.load(file, function(error, def) {
      ui.remove(fm);
      var i,j;
      for(i = 0; i < def.maps.length; i++) {
        for(j = 0; j < keyboard.getNumberOfKeys(); j++) 
          keys[j].setMapping(i, def.maps[i][j]);
      }
      info.print("Loaded "+def.maps.length+" maps");
      redraw();
    });

  });
}

function requestKey() {
  if(inputSelectKey !== null) {
    ui.remove(inputSelectKey);
    isSelectingKey = false;
    state.selecting = false;
    inputSelectKey = null;
    redraw();
    return;
  }
  state.selecting = true;
  info.print("Select key: ");
  // Select key input
  inputSelectKey = blessed.textbox({
    label: "Input key number, or click a key: ",
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
  ui.append(inputSelectKey);
  redraw();
  inputSelectKey.focus();
  inputSelectKey.readInput(function(ch,text) {
    info.print("Got "+text);
    var selectedKey = parseInt(text);
    if(selectedKey >= 0 && selectedKey < keyboard.getNumberOfKeys()) keys[selectedKey].select(true);
    requestKey();
  });
}

screen.key('-', function(ch, key) {
  if(state.layer > 0) state.layer--;
  info.print("Layer "+state.layer);
  redraw();
});
screen.key('+', function(ch, key) {
  if(state.layer < 72) state.layer++;
  info.print("Layer "+state.layer);
  redraw();
});
// If box is focused, handle `enter`/`return` and give us some more content.
screen.key('2', function(ch, key) {
  requestKey();
});
screen.key('1', function(ch, key) {
  var file = requestFile();
  if(file) firmware.parse(file, keyboard);
});
function redraw() {
  for(i = 0; i < 76; i++) {
    keys[i].draw();
  }
  screen.render();
}


// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// Render the screen.
screen.render();

