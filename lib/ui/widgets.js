var blessed = require('blessed');
var fs = require('fs'),
    path = require('path');
var colors = blessed.colors
  , program = blessed.program
  , widget = blessed.widget;

/**
 * Number input box
 */
function Numberbox(options) {
  var self = this;
  var input = "";

  if (!(this instanceof blessed.Node)) {
    return new Numberbox(options);
  }

  options = options || {};

  blessed.Textbox.call(this, options);
}
Numberbox.prototype.__proto__ = blessed.Textbox.prototype;
Numberbox.prototype.type = 'numberbox';
Numberbox.prototype._listener = function(ch, key) {

  var done = this._done
    , value = this.value;

  if (key.name === 'enter') {
    this._done(null, this.value);
    return;
  }
  var ret = true;

  if (key.name === 'return') return;
  if (key.name === 'enter') {
    this._done(null, this.value);
    return;
  }

  var current = Number(this.value);
  this.screen.debug("Key in numberbox: "+key.full+" current value: "+current);
  switch(key.full) {
    case 'j':
    case 'down':
    case '-':
      if(current > this.options.min) this.value = (current - 1)+"";
      ret = false;
      break;
    case 'k':
    case 'up':
    case '+':
      if(current < this.options.max) this.value = (current + 1)+"";
      ret = false;
      break;
  }

  // TODO: Optimize typing by writing directly
  // to the screen and screen buffer here.
  if (key.name === 'enter' || key.name === 'tab') {
    this._done(null, this.isValid(current) ? this.value : null);
    return;
  }
  else if (key.name === 'escape') {
    done(null, null);
  } else if (key.name === 'backspace') {
    if (this.value.length) {
      this.value = this.value.slice(0, -1);
    }
  } else if (ch && ret) {
    if (!/^[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]$/.test(ch)) {
      if(/^\d+$/.test(ch))
        this.value += ch;
    }
  }

  if (this.value !== value) {
    //this.setValue();
    if(this.isValid(current)) this.emit('change', this.value);
    this.screen.render();
  }
  if(!ret) return false;
};
Numberbox.prototype.isValid = function(value) {
  return (value >= this.options.min && value <= this.options.max);
}

Numberbox.prototype.doComplete = function(input) {
  return '';
}
/**
 * Command input box
 */
function Commandbox(options) {
  var self = this;
  var input = "";

  if (!(this instanceof blessed.Node)) {
    return new Commandbox(options);
  }

  options = options || {};

  blessed.Textbox.call(this, options);
}
Commandbox.prototype.__proto__ = blessed.Textbox.prototype;
Commandbox.prototype.type = 'commandbox';
Commandbox.prototype._listener = function(ch, key) {
  var done = this._done
    , value = this.value;

  if (key.name === 'return') return;
  if (key.name === 'enter') {
    this._done(null, this.value);
    return;
  }

  // TODO: Handle directional keys.
  if (key.name === 'left' || key.name === 'right'
      || key.name === 'up' || key.name === 'down') {
    ;
  }

  if (this.options.keys && key.ctrl && key.name === 'e') {
    return this.readEditor();
  }

  // TODO: Optimize typing by writing directly
  // to the screen and screen buffer here.
  if (key.name === 'tab') {
    var output = this.doComplete(value);
    this.value += output;
  } 
  else if (key.name === 'escape') {
    done(null, null);
  } else if (key.name === 'backspace') {
    if (this.value.length) {
      this.value = this.value.slice(0, -1);
    }
  } else if (ch) {
    if (!/^[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]$/.test(ch)) {
      this.value += ch;
    }
  }

  if (this.value !== value) {
    //this.setValue();
    this.screen.render();
  }
};

Commandbox.prototype.doComplete = function(input) {
  return '';
}
/**
 * File input box
 */
function Filebox(options) {
  var self = this;
  var input = "";

  if (!(this instanceof blessed.Node)) {
    return new Filebox(options);
  }

  options = options || {};

  Commandbox.call(this, options);
}
Filebox.prototype.__proto__ = Commandbox.prototype;
Filebox.prototype.type = 'filebox';
Filebox.prototype.doComplete = function(input) {
  //Copied from https://github.com/tonylukasavage/path-complete
  //TODO: add credits
  var basepath = path.resolve(input);
  var dirname = input === '' ? basepath : ((input.slice(-1) == "/") ? basepath : path.dirname(basepath));
  var filename = input === '' ? '' : ((input.slice(-1) == "/") ? '' : path.basename(basepath));

  try {
      var list = fs.readdirSync(dirname);
      var matchPart = null;
      var matches = [];

      list.forEach(function(file) { 
          if (file.indexOf(filename) === 0 || filename === '') {
              if (!matchPart) {
                  matchPart = file;
              } else {
                  for (var i = 0; i < matchPart.length && matchPart.charAt(i) === file.charAt(i); i++) {}
                  matchPart = matchPart.substring(0,i);
              }
              matches.push(file);
          }
      });

      var diff = matchPart.length - filename.length;
      var portion = diff === 0 ? '' : matchPart.substr(filename.length);
      var matchPath = path.join(dirname, matchPart);
      if (matches.length === 0) {
          this.emit('completion', null);
          return '';
      } else if (matches.length === 1) {
          this.emit('completion', matches);
          try {
              return portion + (fs.statSync(matchPath).isDirectory() && input.charAt(input.length-1) !== SEP ? SEP : '');
          } catch (e) {
              return portion;
          }
      } else {
          // TODO: show list of matches if TAB clicked twice and diff === 0
          this.emit('completion', matches);
          console.log(mathes);
          return portion;
      }
  } catch (e) {
      return '';
      // console.log(e);
  }
}
/**
 * Listmenu
 */

function Listmenu(options) {
  var self = this;

  if (!(this instanceof blessed.Node)) {
    return new Listmenu(options);
  }

  options = options || {};

  // XXX Workaround to make sure buttons don't
  // overlap border on the right.
  // options.scrollable = true;

  this.items = [];
  this.ritems = [];
  this.commands = [];
  this.keyLIstener = null;


  this.mouse = options.mouse || false;

  blessed.Box.call(this, options);

  this.topBase = this.itop;
  this.topOffset = 0;

  //this._.debug = new Box({
  //  parent: this.screen,
  //  top: 0,
  //  top: 0,
  //  height: 'shrink',
  //  width: 'shrink',
  //  content: '...'
  //});

  if (options.commands || options.items) {
    this.setItems(options.commands || options.items);
  }

  if (options.keys) {
    this.on('keypress', function(ch, key) {
      //Return if key listener cancels event
      if(options.keyListener && !options.keyListener(ch, key)) return false;
      if (key.name === 'up'
          || (options.vi && key.name === 'k')
          || (key.shift && key.name === 'tab')) {
        self.moveUp();
        self.screen.render();
        // Stop propagation if we're in a form.
        if (key.name === 'tab') return false;
        return false;
      }
      if (key.name === 'down'
          || (options.vi && key.name === 'j')
          || key.name === 'tab') {
        self.moveDown();
        self.screen.render();
        // Stop propagation if we're in a form.
        if (key.name === 'tab') return false;
        return false;
      }
      if (key.name === 'enter'
          || key.name === 'right'
          || (options.vi && key.name === 'l' )) {
        self.emit('action', self.items[self.selected], self.selected);
        self.emit('select', self.items[self.selected], self.selected);
        var item = self.items[self.selected];
        //item.press();
        if (item._.cmd.callback) {
          item._.cmd.callback();
        }
        self.screen.render();
        return false;
      }
      if (key.name === 'escape' || key.name === 'left' || (options.vi && key.name === 'h')) {
        self.emit('action');
        self.emit('cancel');
        return false;
      }
      //if (options.autoCommandKeys) {
        if (/^[0-9]$/.test(ch)) {
          var i = +ch - 1;
          if (!~i) i = 9;
          var item = self.items[i];
          if (item) {
            //item.press();
            if (item._.cmd.callback) {
              item._.cmd.callback();
            }
            self.select(i);
            self.screen.render();
            return false;
          }
        }
      //}
      return true;
    });
  }


  this.on('focus', function() {
    self.select(self.selected);
  });
}

Listmenu.prototype.__proto__ = blessed.Box.prototype;

Listmenu.prototype.type = 'listmenu';

Listmenu.prototype.__defineGetter__('selected', function() {
  return this.topBase + this.topOffset;
});

Listmenu.prototype.setItems = function(commands) {
  var self = this;

  if (!Array.isArray(commands)) {
    commands = Object.keys(commands).reduce(function(obj, key, i) {
      var cmd = commands[key]
        , cb;

      if (typeof cmd === 'function') {
        cb = cmd;
        cmd = { callback: cb };
      }

      if (cmd.text == null) cmd.text = key;
      //if (cmd.prefix == null) cmd.prefix = ++i + '';

      if (cmd.text == null && cmd.callback) {
        cmd.text = cmd.callback.name;
      }

      obj.push(cmd);

      return obj;
    }, []);
  }

  this.items.forEach(function(el) {
    el.detach();
  });

  this.items = [];
  this.ritems = [];
  this.commands = [];

  commands.forEach(function(cmd) {
    self.add(cmd);
  });
};

Listmenu.prototype.add =
Listmenu.prototype.addItem =
Listmenu.prototype.appendItem = function(item, callback) {
  var self = this
    , prev = this.items[this.items.length - 1]
    , drawn = prev ? prev.top + 1 : 0
    , cmd
    , title
    , len;

  if (!this.screen.autoPadding) {
    drawn += this.itop;
  }

  if (typeof item === 'object') {
    cmd = item;
    //if (cmd.prefix == null) cmd.prefix = (this.items.length + 1) + '';
  }

  if (typeof item === 'string') {
    cmd = {
      //prefix: (this.items.length + 1) + '',
      text: item,
      callback: callback
    };
  }

  if (typeof item === 'function') {
    cmd = {
      //prefix: (this.items.length + 1) + '',
      text: item.name,
      callback: item
    };
  }

  if (cmd.keys && cmd.keys[0]) {
    cmd.prefix = cmd.keys[0];
  }

  var t = generateTags(this.style.prefix || { fg: 'lightblack' });

  title = (cmd.prefix != null ? t.open + cmd.prefix + t.close + ':' : '') + cmd.text;

  len = ((cmd.prefix != null ? cmd.prefix + ':' : '') + cmd.text).length;
  //var lpos = this._getCoords();
  //console.log(lpos);

  var options = {
    screen: this.screen,
    top: 0,
    left: self.padding.left,
    keyListener: null,
    height: 1, // len + 2,
    content: title,
    width: this.width - this.iwidth, // + 2, //0, //lpos.xl, //.iwidth - self.width,
    align: 'left',
    autoFocus: false,
    tags: true,
    mouse: true,
    style: merge({}, this.style.item),
    noOverflow: false
  };

  if (!this.screen.autoPadding) {
    options.top += this.itop;
  }

  ['bg', 'fg', 'bold', 'underline',
   'blink', 'inverse', 'invisible'].forEach(function(name) {
    options.style[name] = function() {
      var attr = self.items[self.selected] === el
        ? self.style.selected[name]
        : self.style.item[name];
      if (typeof attr === 'function') attr = attr(el);
      return attr;
    };
  });

  var el = new blessed.Box(options);
  //var el = new Button(options);

  this._[cmd.text] = el;
  cmd.element = el;
  el._.cmd = cmd;

  this.ritems.push(cmd.text);
  this.items.push(el);
  this.commands.push(cmd);
  this.append(el);

  if (cmd.callback) {
    //el.on('press', cmd.callback);
    //this.on('select', function(el) {
    //  if (el._.cmd.callback) {
    //    el._.cmd.callback();
    //  }
    //});
    if (cmd.keys) {
      this.screen.key(cmd.keys, function(ch, key) {
        self.emit('action', el, self.selected);
        self.emit('select', el, self.selected);
        //el.press();
        if (el._.cmd.callback) {
          el._.cmd.callback();
        }
        self.select(el);
        self.screen.render();
        return false;
      });
    }
  }

  if (this.items.length === 1) {
    this.select(0);
  }

  if (this.mouse) {
    el.on('click', function(data) {
      self.emit('action', el, self.selected);
      self.emit('select', el, self.selected);
      //el.press();
      if (el._.cmd.callback) {
        el._.cmd.callback();
      }
      self.select(el);
      self.screen.render();
    });
  }
};

Listmenu.prototype.render = function() {
  var self = this
    , drawn = 0;

  if (!this.screen.autoPadding) {
    drawn += this.itop;
  }

  this.items.forEach(function(el, i) {
    if (i < self.topBase) {
      el.hide();
    } else {
      el.rtop = drawn;
      drawn += 1; //el.height;// + 2;
      el.show();
    }
  });

  return this._render();
};

Listmenu.prototype.select = function(offset) {
  if (typeof offset !== 'number') {
    offset = this.items.indexOf(offset);
  }

  var lpos = this._getCoords();
  if (!lpos) return;

  var self = this
    , height = (lpos.yl - lpos.yi) - this.iheight
    , drawn = 0
    , visible = 0
    , el;

  if (offset < 0) offset = 0;
  else if (offset >= this.items.length) offset = this.items.length - 1;

  el = this.items[offset];
  if (!el) return;

  this.items.forEach(function(el, i) {
    if (i < self.topBase) return;
    var lpos = el._getCoords();
    if (!lpos) return;

    // XXX Need this because overflowed elements will still return lpos.
    if (lpos.yl - lpos.yi <= 0) return;

    drawn += 1; //(lpos.yl - lpos.yi) + 2;

    // XXX Need this because overflowed elements will still return lpos.
    //drawn += el.getText().length + 2 + 2;

    if (drawn <= height) visible++;
  });

  var diff = offset - (this.topBase + this.topOffset);
  if (offset > this.topBase + this.topOffset) {
    if (offset > this.topBase + visible - 1) {
      this.topOffset = visible;
      this.topBase = offset - visible;
      //this.topOffset = 0;
      //this.topBase = offset;
    } else {
      this.topOffset += diff;
    }
  } else if (offset < this.topBase + this.topOffset) {
    diff = -diff;
    if (offset < this.topBase) {
      this.topOffset = 0;
      this.topBase = offset;
    } else {
      this.topOffset -= diff;
    }
  }

  //this.topOffset = Math.max(0, this.topOffset);
  //this.topBase = Math.max(0, this.topBase);

  //this._.debug.setContent(JSON.stringify({
  //  topOffset: this.topOffset,
  //  topBase: this.topBase,
  //  drawn: drawn,
  //  visible: visible,
  //  width: width,
  //  diff: diff
  //}, null, 2));
};

Listmenu.prototype.removeItem = function(child) {
  var i = typeof child !== 'number'
    ? this.items.indexOf(child)
    : child;

  if (~i && this.items[i]) {
    child = this.items.splice(i, 1)[0];
    this.ritems.splice(i, 1);
    this.commands.splice(i, 1);
    this.remove(child);
    if (i === this.selected) {
      this.select(i - 1);
    }
  }
};

Listmenu.prototype.move = function(offset) {
  this.select(this.selected + offset);
};

Listmenu.prototype.moveUp = function(offset) {
  this.move(-(offset || 1));
};

Listmenu.prototype.moveDown = function(offset) {
  this.move(offset || 1);
};

function generateTags(style, text) {
  var open = ''
    , close = '';

  Object.keys(style).forEach(function(key) {
    var val = style[key];
    if (typeof val === 'string') {
      val = val.replace(/^light(?!-)/, 'light-');
      open = '{' + val + '-' + key + '}' + open;
      close += '{/' + val + '-' + key + '}';
    } else {
      if (val) {
        open = '{' + key + '}' + open;
        close += '{/' + key + '}';
      }
    }
  });

  if (text != null) {
    return open + text + close;
  }

  return {
    open: open,
    close: close
  };
}

function merge(a, b) {
  Object.keys(b).forEach(function(key) {
    a[key] = b[key];
  });
  return a;
}

function asort(obj) {
  return obj.sort(function(a, b) {
    a = a.name.toLowerCase();
    b = b.name.toLowerCase();

    if (a[0] === '.' && b[0] === '.') {
      a = a[1];
      b = b[1];
    } else {
      a = a[0];
      b = b[0];
    }

    return a > b ? 1 : (a < b ? -1 : 0);
  });
}

function hsort(obj) {
  return obj.sort(function(a, b) {
    return b.index - a.index;
  });
}

var wideChars = new RegExp('(['
  + '\\uff01-\\uffbe'
  + '\\uffc2-\\uffc7'
  + '\\uffca-\\uffcf'
  + '\\uffd2-\\uffd7'
  + '\\uffda-\\uffdc'
  + '\\uffe0-\\uffe6'
  + '\\uffe8-\\uffee'
  + '])', 'g');

//Expose
exports.Listmenu = exports.listmenu = Listmenu;
exports.Commandbox = exports.commandbox = Commandbox;
exports.Filebox = exports.filebox = Filebox;
exports.Numberbox = exports.numberbox = Numberbox;
