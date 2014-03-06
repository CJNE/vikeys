var blessed = require('blessed');
var state = require('./state.js');

exports.Instance = function(index) {
  var self = this;
  var box = null;
  var index = index;
  var selected = false;
  var mappings = new Array(72);
  self.select = function(doSelect) {
    if(typeof(doSelect) === 'undefined') selected = !selected;
    else selected = doSelect;
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
    state.debug("Setting mapping "+mapping+" on key "+index+" layer "+layer);
    mappings[layer] = mapping;
    self.draw();
  }

  self.draw = function() {
    if(!box) return;
    if(state.selectingNumber) box.setContent(index+"");
    else box.setContent(self.getMapping(state.layer));
    if(selected) box.style.bg = 'light-red';
    else box.style.bg = 'light-black';
    if(state.currentKey == index) box.style.border.fg = 'light-red';
    else box.style.border.fg = 'light-blue';
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
      if(!selected) {
        var prevKey = state.keys[state.currentKey];
        state.currentKey = index;
        prevKey.draw();
      }
      self.select(!selected);
      state.focus(box.screen);
      //box.screen.focused = state.focus;
    });
  }
}
