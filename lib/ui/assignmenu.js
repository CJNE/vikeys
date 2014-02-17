var blessed = require('blessed');
var leftBox, mainBox;
var keycodes = require('../keycodes.js');


var labels = keycodes.groups();
var keys = {
  alphapet: [
    'A', 'B', 'C', 'D'
    ],
  numbers: [
    '1_!', '2_@', '3_#', '4_$'
    ],
  spacing: [
    'SPC', 'BSPC', 'DEL', 'TAB'
    ],
  punctuation: [
    'COMMA', 'PERD'
    ],
  'function': [
    'F1', 'F2', 'F3', 'F4'
    ]
  };
exports.show = function(parent, screen) {
  mainBox = blessed.box({
    width: '100%',
    top: '0%',
    bg: 'pink',
    heigth: '100%'
  });
  var keyBox = blessed.list({
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
    var items = keycodes.codesForGroup(labels[item]).map(function(item) { return item.code; });
    keyBox.setItems(items);
    screen.render();
    //console.log(keys[labels[item]]);
    keyBox.focus();

  });
  parent.append(mainBox);
  mainBox.append(leftBox);
  mainBox.append(keyBox);
  screen.render();
  leftBox.focus();
};
exports.hide = function() {
  parent.remove(leftBox);
  parent.remove(mainBox);
}
