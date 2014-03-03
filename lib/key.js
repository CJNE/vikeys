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
    if(!box) return;
    if(state.selecting) box.setContent(index+"");
    else box.setContent(self.getMapping(state.layer));
    if(selected) box.style.bg = 'red';
    else box.style.bg = 'green';
    if(state.selecting && state.currentKey == index) box.style.border.fg = 'blue';
    else box.style.border.fg = 'white';
  };
  self.setBox = function(aBox) {
    box = aBox;
    box.on('keypress', function(k) {
      state.focus(box.screen);
      //box.screen.focused = state.focus;
    });
    box.on('mouseover', function() {
    });
    box.on('click', function() {
      self.select(!selected);
      state.focus(box.screen);
      //box.screen.focused = state.focus;
    });
  }
}
