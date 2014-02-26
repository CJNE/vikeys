var blessed = require('blessed');
var state = require('./state.js');
var info = require('./ui/info.js');
exports.Instance = function(index) {
  var self = this;
  var box = null;
  var index = index;
  var selected = false;
  var mappings = new Array(72);
  self.select = function(doSelect) {
    selected = doSelect;
    self.draw();
  }
  self.getIndex = function() { return index; };
  self.isSelected = function() {
    return selected;
  }
  self.getMapping = function(layer) {
    return mappings[layer];
  }
  self.setMapping = function(layer, mapping) {
    info.print("Setting mapping "+mapping+" on key "+index+" layer "+layer);
    mappings[layer] = mapping;
    self.draw();
  }

  self.draw = function() {
    if(state.selecting) box.setContent(index+"");
    else box.setContent(self.getMapping(state.layer));
    if(selected) box.style.bg = 'red';
    else box.style.bg = 'green';
  };
  self.getBox = function(keyboard) {
    if(box == null) {
      var pos = keyboard.getPos(self);
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
    });
    box.on('click', function() {
      self.select(!selected);
      state.focus.focus();
    });
    return box;
  }
}
