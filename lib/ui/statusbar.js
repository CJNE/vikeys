var blessed = require('blessed');

function Statusbar(options) {
  var self = this;
  this.mode = 'normal';
  this.layer = 0;
  this.message = '';

  if (!(this instanceof blessed.Node)) {
    return new Statusbar(options);
  }

  options = options || {};
  blessed.Box.call(this, options);
}

Statusbar.prototype.__proto__ = blessed.Box.prototype;

Statusbar.prototype.type = 'statusbar';

Statusbar.prototype.setMessage = function(message) {
  this.message = message;
  this.drawStatus();
};

Statusbar.prototype.eventListener = function(event, data) {
  switch(event) {
    case 'mode': {
      this.mode = data.current;
      this.drawStatus();
      break;
    }
  }
}

Statusbar.prototype.drawStatus = function() {
  var line = '';
  if(this.mode == 'select') line += "{red-bg} SELECT KEY {red-fg}{yellow-bg}⮀";
  else line += "{green-bg} Normal {green-fg}{yellow-bg}⮀";
  line += "{white-fg}Layer "+this.layer+" {/}{yellow-fg}⮀"
  line += "{/} ";
  line += this.message;
  //if(exports.statusExtra != '') line += "\n"+exports.statusExtra;
  this.setContent(line);
  this.screen.render();
};

exports.statusbar = exports.Statusbar = Statusbar;
