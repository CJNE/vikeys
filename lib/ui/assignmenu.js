var blessed = require('blessed');
var leftBox, mainBox, keyBox;
var keycodes = require('../keycodes.js');
var myParent;
var items;

var labels = keycodes.groups();
exports.show = function(parent, clb) {
  myParent = parent;
  var screen = parent.screen;
  if(!mainBox) {
    mainBox = blessed.box({
      width: '100%',
      top: '0%',
      bg: 'pink',
      heigth: '100%',
      keys: true
    });
    keyBox = blessed.list({
      left: '25%',
      width: '75%',
      top: '0%',
      bg: 'pink',
      height: '100%',
      selectedFg: 'red',
      itemFg: 'white',
      keys: true,
      vi: true,
      mouse: true
    });
    leftBox = blessed.list({
      width: '25%',
      heigth: '100%',
      left: '0%',
      selectedFg: 'red',
      itemFg: 'white',
      keys: true,
      vi: true,
      mouse: true,
      items: labels
    });
    leftBox.on('select', function(ch,item) {
      items = keycodes.codesForGroup(labels[item]);
      keyBox.setItems(items.map(function(item) { return item.code+" "+(item.description ? item.description : ''); }));
      screen.render();
      //console.log(keys[labels[item]]);
      keyBox.focus();
    });
    leftBox.on('cancel', function() {
      myParent.remove(mainBox);
      myParent.screen.grabKeys = false;
      myParent.screen.render();
    });

    keyBox.on('cancel', function() {
      keyBox.setItems([]);
      leftBox.selectedFg = 'red';
      leftBox.focus();
      screen.render();
    });
    keyBox.on('select', function(ch, item) {
      myParent.remove(mainBox);
      myParent.screen.grabKeys = false;
      myParent.screen.render();
      var code = items[item].code;
      clb(code);
    });

    mainBox.append(leftBox);
    mainBox.append(keyBox);
  }
  myParent.append(mainBox);
  screen.render();
  leftBox.focus();
  screen.grabKeys = true;
  keyBox.key(['escape', 'q', 'C-c'], function(ch, key) {
    leftBox.focus();
  });
};
