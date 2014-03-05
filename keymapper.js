var blessed = require('blessed');
var widgets = require('./lib/ui/widgets.js');
var keyboard = require('./lib/keyboard');
var keyboards = require('./lib/keyboards');
var key = require('./lib/key');
var state = require('./lib/state')
var screen = state.screen;
var firmware = require('./firmwares/tmk.js');
var info = require('./lib/ui/info.js');
var menuAssign = require('./lib/ui/assignmenu.js');
var pc = require('path-complete');

var ui = blessed.box({
  top: '50%',
  left: '10%',
  right: 0,
  //width: '90%',
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
var statusBar = blessed.box({
  bottom: 0,
  left: 0,
  right: 0,
  width: '100%',
  height: 1,
  tags: true,
  style: {
    bg: 'lightyellow',
    fg: 'white',
    border: {
      bg: 'lightyellow',
      fg: 'purple'
    }
  }
});
var keyboardBox = blessed.box({
  top: '0%',
  left: '0%',
  width: '100%',
  height: '50%'
});
var mainMenu = widgets.listmenu({
  width: '10%',
  left: 0,
  top: '50%',
  height: '50%',
  keys: true,
  mouse: true,
  keyListener: state.keyListener,
  vi: true,
  name: "Main menu",
  style: {
    fg: 'white',
    bg: 'blue',
    selected: {
      prefix: 'white',
      fg: 'blue',
      bg: 'white'
    },
    item: {
      prefix: 'white',
      fg: 'white',
      bg: 'blue'
    }
  }
});
function menuHome() {
  mainMenu.setItems({
    ' Assign': {
      callback: function() {
        menuAssign.show(ui, {
          assign: function(code) {
            state.keys[state.currentKey].setMapping(state.layer, code);
            state.keys.forEach(function(key) {
              if(key.isSelected()) {
                key.setMapping(state.layer, code);
                key.select(false);
              }
            });
          },
          cancel: function() {
          }
        });
      }
    },
    ' Build': {
      callback: function() {
      }
    },
    ' Load': {  
      callback: function() {
        var fm = blessed.filemanager({
          keys: true,
          vi: true,
          style: {
            fg: 'white',
            bg: 'blue',
            selected: {
              prefix: 'white',
              fg: 'blue',
              bg: 'white'
            },
            item: {
              prefix: 'white',
              fg: 'white',
              bg: 'blue'
            }
          }
        });
        ui.append(fm);
        fm.focus();
        fm.pick('./', function(error, file) {
          if(error || file == "" || typeof(file) === 'undefined' || file == null) {
            ui.remove(fm);
            mainMenu.focus();
            redraw();
            return;
          }
          firmware.load(file, function(error, def) {
            ui.remove(fm);
            var i,j;
            for(i = 0; i < def.maps.length; i++) {
              for(j = 0; j < state.keyboard.keys; j++) 
                state.keys[j].setMapping(i, def.maps[i][j]);
            }
            redraw();
            info.print("Loaded "+def.maps.length+" maps");
            mainMenu.focus();
          });

        });
      }
    }, 
    ' Save': {
      callback: function() {
        var saveName = widgets.filebox({
          bottom: 0,
          width: '100%',
          height: 1,
          value: process.cwd()+(process.platform === 'win32' ? '\\' : '/'),
          style: {
            bg: 'blue',
            fg: 'white'
          }
        });
        state.helpMessage = "Enter file name to write to";
        statusBar.bottom = 1;
        state.screen.append(saveName);
        redraw();
        //saveName.focus();
        saveName.on('completion', function(matches) {
          if(matches === null || matches.length == 1) {
            state.statusExtra = '';
            statusBar.height = 1;
            state.statusExtra = ''; //matches.join(' ');
          } else {
            statusBar.height = 2;
            state.statusExtra = matches.join(' ');
          }
          redraw();
        });
        saveName.readInput(function(err, path) {
          if(path !== null) {
            firmware.save(path, { keys: state.keys }, state.keyboard, function(err, msg) {
              if(err) state.helpMessage = err;
              else state.helpMessage = "Saved to "+path;
              state.screen.remove(saveName);
              statusBar.bottom = 0;
              statusBar.height = 1;
              redraw();
            });
          }
          else {
            state.screen.remove(saveName);
            statusBar.bottom = 0;
            statusBar.height = 1;
            redraw();
          }
        });
        
        /*
        saveName.readInput(function(err, val) {
          state.screen.remove(saveName);
          statusBar.bottom = 0;
          if(val !== null) {
            state.helpMessage = "Save to "+val;
          }
          redraw();
        });*/
      }
    },
    ' Exit': {
      callback: function() {
        process.exit(0);
      }
    }
  });
}
function eventListener(msg) {
  switch(msg) {
    case "redraw": screen.render(); break;
  }
}
// Append our box to the screen.
screen.append(keyboardBox);
screen.append(mainMenu);
screen.append(ui);
screen.append(statusBar);
info.initLayout(ui);
info.addListener(eventListener);
screen.grabKeys = true;
state.on('keyboard', keyboard.eventListener);
state.keyboard = keyboards.keyboards['ergodox'];

menuHome();
state.pushFocus(mainMenu);

var i = 0;
var keyInstance;
for(i = 0; i < state.keyboard.keys; i++) {
  keyInstance = new key.Instance(i);
  state.keys.push(keyInstance);
}
keyboard.initLayout(keyboardBox, state.keyboard);
function redraw() {
  for(i = 0; i < 76; i++) {
    state.keys[i].draw();
  }
  statusBar.setContent(state.getStatusLine());
  state.screen.render();

}
state.on('redraw', redraw);
screen.on('keypress', state.keyListener);
statusBar.setContent(state.getStatusLine());
screen.render();

