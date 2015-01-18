var fs = require('fs')
var MAX_LAYERS = 32;
var MAX_ACTIONS = 32;
exports.MAX_ACTIONS = MAX_ACTIONS;
exports.MAX_LAYERS = MAX_LAYERS;
exports.types = {
  modifier: {
    ui: 'select_key',
    groups: ["Modifier keys"],
    filter: {
      pre: function(val) {
        if(!val || val.length < 5) return val;
        return val.substr(4);
      },
      post: function(val) {
        return "MOD_"+val;
      }
    }
  },
  key: {
    ui: 'select_key',
    groups: ["Alphas", "Number row", "Spacing", "Punctuation", "Function keys", "Navigation", "Numpad", "Keypad"],
    filter: {
      pre: function(val) {
        if(!val || val.length < 4) return val;
        return val.substr(3);
      },
      post: function(val) {
        return "KC_"+val;
      }
    }
  },
  layer: {
    ui: 'number',
    min: 0,
    max: 31
  },
  layer_part: {
    ui: 'number',
    min: 0,
    max: 7
  },
  layer_bits: {
    ui: 'number',
    min: 0,
    max: 31
  },
  fn_id: {
    ui: 'select_fn_id'
  },
  fn_opt: {
    ui: 'select_fn_opt'
  },
  macro: {
    ui: 'text'
  },
  on: {
    ui: 'radio',
    options: { "ON_PRESS": "Press", "ON_RELEASE": "Release", "ON_BOTH": "Both" }
  }
}

exports.actions = [
  {
    group: "Layer",
    label: "Set layer",
    id: 'ACTION_LAYER_SET',
    params: [
      { label: "Layer", default: "0", type: 'layer', help: "What layer to set", required: 1 },
      { label: "When", default: "ON_PRESS", type: 'on', help: "When to trigger", required: 0 }
    ],
    help: "Turn on only this layer"
  },
  {
    group: "Layer",
    label: "Set layer and clear",
    id: 'ACTION_LAYER_SET_CLEAR',
    params: [
      { label: "Layer", default: "0", type: 'layer', help: "What layer to set", required: 1 }
    ],
    help: "Turn on only this layer and clear layers on release"
  },
  {
    group: "Layer",
    label: "Default layer",
    id: 'ACTION_DEFAULT_LAYER_SET',
    params: [
      { label: "Layer", type: 'layer', default: "0", help: "What layer to set (0-31)", required: 1 }
    ],
    help: "Sets the default layer and activates it"
  },
  {
    group: "Layer",
    label: "Momentary layer",
    id: 'ACTION_LAYER_MOMENTARY',
    params: [
      { label: "Layer", type: 'layer', default: "0", help: "What layer to activate (0-31)", required: 1 }
    ],
    help: "Activates layer while holding, switches back on release"
  },
  {
    group: "Layer",
    label: "Momentary layer tap toggle",
    id: 'ACTION_LAYER_TAP_TOGGLE',
    params: [
      { label: "Layer", default: "0", type: 'layer', help: "What layer to activate while holding", required: 1 }
    ],
    help: "Activates layer while holding, toggle layer on tap"
  },
  {
    group: "Layer",
    label: "Momentary layer switch tap key",
    id: 'ACTION_LAYER_TAP_KEY',
    params: [
      { label: "Layer", default: "0", type: 'layer', help: "What layer to activate while holding", required: 1 },
      { label: 'Key', type: 'key', help: "A key", required: 1 }
    ],
    help: "Activates layer while holding, send key on tap"
  },
  {
    group: "Layer",
    label: "Toggle layer",
    id: 'ACTION_LAYER_TOGGLE',
    params: [
      { label: "Layer", default: "0", type: 'layer', help: "What layer to activate (0-31)", required: 1 }
    ],
    help: "Activates layer on tap and deactivates on the next tap."
  },
  {
    group: "Layer",
    label: "Turn on layer",
    id: 'ACTION_LAYER_ON',
    params: [
      { label: "Layer", default: "0", type: 'layer', help: "What layer to turn on", required: 1 },
      { label: "When", default: "ON_PRESS", type: 'on', help: "When to trigger", required: 0 }
    ],
    help: "Set layer state to on"
  },
  {
    group: "Layer",
    label: "Turn off layer",
    id: 'ACTION_LAYER_OFF',
    params: [
      { label: "Layer", default: "0", type: 'layer', help: "What layer to turn off", required: 1 },
      { label: "When", default: "ON_PRESS", type: 'on', help: "When to trigger", required: 0 }
    ],
    help: "Set layer state to off"
  },
  {
    group: "Layer",
    label: "Invert layer",
    id: 'ACTION_LAYER_INVERT',
    params: [
      { label: "Layer", default: "0", type: 'layer', help: "What layer to invert state for", required: 1 },
      { label: "When", default: "ON_PRESS", type: 'on', help: "When to trigger", required: 0 }
    ],
    help: "Inverts state of layer. If the layer is on it will be turned off."
  },
  {
    group: "Mod keys",
    label: "Modified key",
    id: "ACTION_MODS_KEY",
    params: [
      { label: 'Modifier(s)', type: "modifier", help: "A modifier key, shift for example" , required: 1, multiple: true},
      { label: 'Key', type: 'key', help: "A key", required: 1 }
    ],
    help: "Combines one or more modifier keys with another key, Shift-1 to get ! for example"
  },
  {
    group: "Mod keys",
    label: "Modifier tap key",
    id: "ACTION_MODS_TAP_KEY",
    params: [
      { label: 'Modifier', type: "modifier", default: "LSFT", help: "A modifier key, shift for example", required: 1},
      { label: 'Key', type: 'key', help: "A key", required: 1 }
    ],
    help: "Acts as the modifier while held down, send key on tap"
  },
  {
    group: "Custom",
    label: "Call function",
    id: "ACTION_FUNCTION",
    params: [
      { label: "Function id", type: 'fn_id', help: "The function id", required: 1 },
      { label: "Option", type: 'fn_opt', help: "Option to pass", required: 0 }
    ],
    help: "Call a custom C function"
  },
  {
    group: "Custom",
    label: "Call function tap",
    id: "ACTION_FUNCTION_TAP",
    params: [
      { label: "Function id", type: 'fn_id', help: "The function id", required: 1 },
      { label: "Option", type: 'fn_opt', help: "Option to pass", required: 0 }
    ],
    help: "Call a custom C function, support for tapping"
  },
  {
    group: "Backlight",
    label: "Increase backlight",
    help: "Increase backlight level",
    id: "ACTION_BACKLIGHT_INCREASE",
    params: []
  },
  {
    group: "Backlight",
    label: "Decrease backlight",
    help: "Decrease backlight level",
    id: "ACTION_BACKLIGHT_DECREASE",
    params: []
  },
  {
    group: "Backlight",
    label: "Step backlight",
    help: "Step through backlight levels",
    id: "ACTION_BACKLIGHT_STEP",
    params: []
  },
  {
    group: "Backlight",
    label: "Toggle backlight",
    help: "Toggle backlight on and off",
    id: "ACTION_BACKLIGHT_TOGGLE",
    params: []
  },
  {
    group: "Bitwise",
    label: "Layer bit AND",
    id: "ACTION_LAYER_BIT_AND",
    params: [
      { label: "Part", type: 'layer_part', help: "What part of the layer state to modify", required: 1 },
      { label: "Bits", type: 'layer_bits', help: "Bit value (5 bit)", required: 1 },
      { label: "When", default: "ON_PRESS", type: 'on', help: "When to trigger", required: 0 }
    ],
    help: "Perform a bitwise AND operation on the layer state"
  },
  {
    group: "Bitwise",
    label: "Layer bit OR",
    id: "ACTION_LAYER_BIT_OR",
    params: [
      { label: "Part", type: 'layer_part', help: "What part of the layer state to modify", required: 1 },
      { label: "Bits", type: 'layer_bits', help: "Bit value (5 bit)", required: 1 },
      { label: "When", default: "ON_PRESS", type: 'on', help: "When to trigger", required: 0 }
    ],
    help: "Perform a bitwise OR operation on the layer state"
  },
  {
    group: "Bitwise",
    label: "Layer bit XOR",
    id: "ACTION_LAYER_BIT_XOR",
    params: [
      { label: "Part", type: 'layer_part', help: "What part of the layer state to modify", required: 1 },
      { label: "Bits", type: 'layer_bits', help: "Bit value (5 bit)", required: 1 },
      { label: "When", default: "ON_PRESS", type: 'on', help: "When to trigger", required: 0 }
    ],
    help: "Perform a bitwise exclusive OR operation on the layer state"
  },
  {
    group: "Bitwise",
    label: "Layer bit set",
    id: "ACTION_LAYER_BIT_SET",
    params: [
      { label: "Part", type: 'layer_part', help: "What part of the layer state to modify", required: 1 },
      { label: "Bits", type: 'layer_bits', help: "Bit value (5 bit)", required: 1 },
      { label: "When", default: "ON_PRESS", type: 'on', help: "When to trigger", required: 0 }
    ],
    help: "Set bits on the layer state"
  },
  {
    group: "Bitwise",
    label: "Default layer bit AND",
    id: "ACTION_DEFAULT_LAYER_BIT_AND",
    params: [
      { label: "Part", type: 'layer_part', help: "What part of the layer state to modify", required: 1 },
      { label: "Bits", type: 'layer_bits', help: "Bit value (5 bit)", required: 1 }
    ],
    help: "Perform a bitwise AND operation on the default layer state"
  },
  {
    group: "Bitwise",
    label: "Default layer bit OR",
    id: "ACTION_DEFAULT_LAYER_BIT_OR",
    params: [
      { label: "Part", type: 'layer_part', help: "What part of the layer state to modify", required: 1 },
      { label: "Bits", type: 'layer_bits', help: "Bit value (5 bit)", required: 1 }
    ],
    help: "Perform a bitwise OR operation on the default layer state"
  },
  {
    group: "Bitwise",
    label: "Default layer bit XOR",
    id: "ACTION_DEFAULT_LAYER_BIT_XOR",
    params: [
      { label: "Part", type: 'layer_part', help: "What part of the layer state to modify", required: 1 },
      { label: "Bits", type: 'layer_bits', help: "Bit value (5 bit)", required: 1 }
    ],
    help: "Perform a bitwise exclusive OR operation on the default layer state"
  },
  {
    group: "Bitwise",
    label: "Default layer bit set",
    id: "ACTION_DEFAULT_LAYER_BIT_SET",
    params: [
      { label: "Part", type: 'layer_part', help: "What part of the layer state to modify", required: 1 },
      { label: "Bits", type: 'layer_bits', help: "Bit value (5 bit)", required: 1 }
    ],
    help: "Set bits on the default layer state"
  },
  {
    group: "Macro",
    label: "Macro",
    id: "MACRO",
    params: [
      { label: "Macro definition", type: 'macro', help: "Macro commands (examle D(LSHIFT), D(D), END)", required: 1 }
    ],
    help: "Perform multiple keystrokes"
  }
];

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
    re = /KEYMAP\s*\(([^]+?)\)/ig;
    var defs;
    var i, map, keys, maps = [];
    while((defs = re.exec(data)) !== null) {
      map = defs[1].trim();
      keys = map.split(',').map(function(key) { return key.trim() });
      maps.push(keys);
    }

    //Parse action definitions
    re = /fn_actions\[\]\s*=\s*\{([^]+?)\};$/mgi;
    var actiondef = re.exec(data);
    var actions = [];
    if(actiondef && actiondef.length > 0) {
      var actiondefs  = actiondef[1].trim().match(/\s*(MACRO|ACTION.*)\(.*\),?/mg) || [];
      var action, j;
      re = /(MACRO|ACTION_.*)\((.*)\)/i;
      for(i=0; i < actiondefs.length; i++) {
        action = re.exec(actiondefs[i]);
        if(!action) continue;
        actions.push({ mapping: "FN"+i, fn: action[1], args: action[1] == 'MACRO' ? [action[2]] : action[2].split(',').map(function(d) { return d.trim() }) });
      }
    }

    //Parse function_id
    re = /function_id\s*\{([^]+?)\};$/mgi;
    var ids = [];
    var iddef = re.exec(data);
    if(iddef) ids = iddef[1].split(',').map(function(id) { return id.trim() });


    clb(null, { action_fn: actionFunction, fn_ids: ids, maps: maps, actions: actions});
  });
};

exports.save = function(path, data, keyboard, clb) {
  var str = "static const uint8_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {\n";
  var layer, keysDef, paddedStr, i, mapping, layers = [];
  var allEmpty;
  //Write keymaps
  for(layer = 0; layer < MAX_LAYERS; layer++) {
    allEmpty = true;
    keysDef = "\n  KEYMAP( // Layer "+layer+"\n";
    keysDef += "  // Left hand\n  ";
    for(i = 0; i < keyboard.keys; i++) {
      mapping = data.keys[i].getMapping(layer);
      if(typeof(mapping) === 'undefined') mapping = "TRNS";
      else allEmpty = false;

      keysDef += formattedKeyMapping(i, mapping);
    }
    keysDef += ")";
    if(!allEmpty) {
      layers.push(keysDef);
    }
  }
  str += layers.join(",\n");
  str += "\n};\n";

  //Write actions
  if(data.fn_ids.length > 0)
    str += "\nenum function_id {\n  " + data.fn_ids.join(",\n") + "};\n";

  var action;
  str += "\n\nstatic const uint16_t PROGMEM fn_actions[] = {\n";
  for(i = 0; i < data.actions.length; i++) {
    action = data.actions[i];
    str += "  " + action.fn + "(" + action.args.join(", ") + "),\n";
  }
  str += "};";

  if(data.action_fn) str += data.action_fn;

  fs.writeFile(path, str, function(err) {
    if(err) return clb(err, "Failed to write file");
    return clb(null, "Wrote file");
  });

};

function formattedKeyMapping(index, mapping) {
  var ret = "";

  if(index === 32) {
    ret += "                                    ";
  } else if(index === 34) {
    ret += "                                          ";
  } else if(index === 35) {
    ret += "                              ";
  } else if(index === 52) {
    ret += "            ";
  } else if(index === 65) {
    ret += "                  ";
  } else if([38, 45, 58].indexOf(index) > -1) {
    ret += "      ";
  }

  if(mapping.length < 5) {
    ret += String("     " + mapping).slice(-5);
  } else {
    ret += mapping;
  }

  if(index < 75) ret += ",";

  if([6, 13, 19, 26, 31, 33, 34, 44, 51, 57, 64, 69, 71, 72].indexOf(index) > -1) {
    ret += "\n";
    ret += "  ";
  }
  if(index === 37) {
    ret += "\n\n";
    ret += "  // Right hand";
    ret += "\n";
    ret += "  ";
  }
  return ret;
}
