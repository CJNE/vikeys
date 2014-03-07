var state = require('../lib/state');
var fs = require('fs')
var MAX_LAYERS = 32;
exports.MAX_ACTIONS = 32;
exports.load = function(path, clb) {
  fs.readFile(path, function (err, data) {
    if (err) clb(err);
    var re;
    data = data.toString();

    //Grab any action_function as is
    re = /\s*void\s+action_function/mgi;
    var match = re.exec(data);
    var actionFunction = "";
    var chunk;
    var lbrCount = 0;
    var foundFirst = false;
    if(match !== null) {
      chunk = data.slice(match.index);
      state.debug(chunk);
      for(i = chunk.indexOf("{"); i < chunk.length; i++) {
        if(chunk[i] == "{") {
          lbrCount++;
          foundFirst = true;
        }
        if(chunk[i] == "}") lbrCount--;
        if(lbrCount == 0 && foundFirst) {
          actionFunction = chunk.substr(0, i+1);
          break;
        }
      }
    }

    //Remove comments
    data = data.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, '$1');

    //Parse keymap definitions
    var defs = data.match(/\n\s*KEYMAP\s*\(([^]+?)\),?$/mgi); ///.*KEYMAP\((.*)\),/ig);
    var i, map, keys, maps = [];
    for(i=0; i < defs.length; i++) {
      map = defs[i].trim();
      keys = map.match(/\s*\w+\s*,?/mg);
      keys = keys.map(function(key) {
        key = key.replace(/,/,'');
        key = key.trim();
        return key;
      }).splice(1);
      maps.push(keys);
    }

    //Parse action definitions
    re = /fn_actions\[\]\s*=\s*\{([^]+?)\};$/mgi;
    var actiondef = re.exec(data);
    var actiondefs  = actiondef[1].trim().match(/\s*ACTION.*\(.*\),?/mg);
    var action, actions = [], j;
    re = /(ACTION_.*)\((.*)\)/i;
    for(i=0; i < actiondefs.length; i++) {
      action = re.exec(actiondefs[i]);
      //console.log(actiondefs[i]);
      actions.push({ mapping: "FN"+i, fn: action[1], args: action[2].split(',').map(function(d) { return d.trim() }) });
    }
    
    //Parse function_id
    re = /function_id\s*\{([^]+?)\};$/mgi;
    var iddef = re.exec(data);
    var ids = iddef[1].split(',').map(function(id) { return id.trim() });


    clb(null, { action_fn: actionFunction, fn_ids: ids, maps: maps, actions: actions});
  }); 
};
exports.save = function(path, data, keyboard, clb) {
  var str = "static const uint8_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {\n";
  var layer, keysDef, i, mapping, layers = [];
  var allEmpty;
  //Write keymaps
  for(layer = 0; layer < MAX_LAYERS; layer++) {
    allEmpty = true;
    keysDef = "  KEYMAP( // Layer "+layer+"\n";
    for(i = 0; i < keyboard.keys; i++) {
      mapping = data.keys[i].getMapping(layer);
      if(typeof(mapping) === 'undefined') mapping = "TRNSs";
      else allEmpty = false;
      keysDef += (i == 0 ? "    ":", ")+mapping;
    }
    keysDef += ")";
    if(!allEmpty) {
      layers.push(keysDef);
    }
  }
  str += layers.join(",\n");
  str += "\n};";

  //Write actions
  if(data.fn_ids.length > 0) 
    str += "\nenum function_id {\n  " + data.fn_ids.join(",  \n") + "\n};\n";

  var action;
  str += "\n\nstatic const uint16_t PROGMEM fn_actions[] = {\n";
  for(i = 0; i < data.actions.length; i++) {
    action = data.actions[i];
    str += "  " + action.fn + "(" + action.args.join(", ") + "),\n";
  }
  str += "};\n";

  if(data.action_fn) str += data.action_fn;

  fs.writeFile(path, str, function(err) {
    if(err) return clb(err, "Failed to write file");
    return clb(null, "Wrote file");
  });

};
