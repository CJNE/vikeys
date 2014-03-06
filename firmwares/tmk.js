var fs = require('fs')
var MAX_LAYERS = 32;
exports.MAX_ACTIONS = 32;
exports.load = function(path, clb) {
  fs.readFile(path, function (err, data) {
    if (err) clb(err);
    data = data.toString();
    //Remove comments
    data = data.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, '$1');

    //Parse keymap definitions
    var defs = data.match(/\n\s*KEYMAP\s*\(([^]+?)\),?$/mgi); ///.*KEYMAP\((.*)\),/ig);
    var i, map, keys, maps = [];
    for(i=0; i < defs.length; i++) {
      map = defs[i].trim();
      keys = map.match(/\s*\w+\s*,?/mg);
      keys = keys.map(function(key) {
        key = key.trim();
        key = key.substr(0, key.length - 1);
        return key;
      }).splice(1);
      maps.push(keys);
    }

    //Parse action definitions
    var re = /fn_actions\[\]\s*=\s*\{([^]+?)\};$/mgi;
    var actiondef = re.exec(data);
    var actiondefs  = actiondef[1].trim().match(/\s*ACTION.*\(.*\),?/mg);
    var action, actions = [], j;
    re = /(ACTION_.*)\((.*)\)/i;
    for(i=0; i < actiondefs.length; i++) {
      action = re.exec(actiondefs[i]);
      //console.log(actiondefs[i]);
      actions.push({ fn: action[1], args: action[2].split(',').map(function(d) { return d.trim() }) });
    }

    /*
static const uint16_t PROGMEM fn_actions[] = {
    ACTION_FUNCTION(TEENSY_KEY),                    // FN0 - Teensy key
    ACTION_LAYER_MOMENTARY(2),                      // FN1 - switch to Layer1 from layer 0
    ACTION_LAYER_SET(1, ON_PRESS),                  // FN2 - push Layer2
    ACTION_LAYER_SET(3, ON_PRESS),                  // FN3 - push Layer3
    ACTION_LAYER_SET(0, ON_PRESS),                  // FN4 - push Layer0
    ACTION_LAYER_MOMENTARY(1),                      // FN5 - switch to Layer1 from layer 1
    ACTION_MODS_KEY(MOD_LSFT, KC_BSLS),             // FN6  = Shifted BackSlash // " in Workman
    ACTION_MODS_KEY(MOD_LSFT, KC_LBRC),             // FN7  = Shifted BackSlash // " in Workman
    ACTION_MODS_KEY(MOD_LSFT, KC_RBRC),             // FN8  = Shifted BackSlash // " in Workman
};
*/
    clb(null, { maps: maps, actions: actions});
  }); 
};
exports.save = function(path, data, keyboard, clb) {
  var str = "static const uint8_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {\n";
  var layer, keysDef, i, mapping;
  for(layer = 0; layer < MAX_LAYERS; layer++) {
    keysDef = "  KEYMAP( // Layer "+layer+"\n";
    for(i = 0; i < keyboard.keys; i++) {
      mapping = data.keys[i].getMapping(layer);
      if(typeof(mapping) === 'undefined') mapping = "NO";
      keysDef += (i == 0 ? "    ":", ")+mapping;
    }
    str += keysDef;
    str += (layer === (MAX_LAYERS - 1) ? ")" : "),\n");
  }
  str += "\n}";
  fs.writeFile(path, str, function(err) {
    if(err) return clb(err, "Failed to write file");
    return clb(null, "Wrote file");
  });
};
/*
static const uint8_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
    KEYMAP(  // layout: layer 0: default
        // left hand
        ESC, 1,   2,   3,   4,   5,   FN4,
        TAB, Q,   W,   E,   R,   T,   LBRC,
        LCTL,A,   S,   D,   F,   G,
        LSFT,Z,   X,   C,   V,   B,   LALT,
        CAPS, FN3, LALT,FN1,LGUI,
                                      MPLY, MUTE,
                                           VOLU,
                                 BSPC,DEL, VOLD,
        // right hand
             GRV, 6,   7,   8,   9,   0,   MINS,
             RBRC, Y,   U,   I,   O,   P,   EQL,
                  H,   J,   K,   L,   SCLN, QUOT,
             BSLS, N,   M,   COMM,DOT, SLSH,RSFT,
                       RALT,FN1,  LBRC,RBRC,LGUI,
        PGUP,FN2,
        PGDN,
        INS, ENT, SPC
    ),
    KEYMAP(  // layout: layer 1: norman
        // left hand
        TRNS, TRNS, TRNS, TRNS, TRNS, TRNS, TRNS,
        TRNS, Q,    W,    D,    F,    K,    TRNS,
        TRNS, A,    S,    E,    T,    G,
        TRNS, Z,    X,    C,    V,    B,   TRNS,
        TRNS, TRNS, TRNS, FN5, TRNS,
                                      TRNS, TRNS,
                                           TRNS,
                                 TRNS, TRNS, TRNS,
        // right hand
             TRNS, TRNS,   TRNS,   TRNS,   TRNS,   TRNS,   TRNS,
             TRNS, J,   U,   R,   L,   SCLN,   TRNS,
                  Y,   N,   I,   O,   H, TRNS,
             TRNS, P,   M,   COMM,DOT, SLSH,TRNS,
                       TRNS,FN5,  TRNS,TRNS,TRNS,
        TRNS,TRNS,
        TRNS,
        TRNS, TRNS, TRNS
    ),

    KEYMAP(  // layout: layer 2: F-keys instead of numbers
        // left hand
        FN0,F1,  F2,  F3,  F4,  F5,  TRNS,
        TRNS,EQL,TRNS,TRNS,TRNS,TRNS,TRNS,
        TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,
        TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,
        TRNS,FN4,TRNS,TRNS,TRNS,
                                      TRNS,TRNS,
                                           TRNS,
                                 TRNS,TRNS,TRNS,
        // right hand
             TRNS, F6,  F7,  F8,  F9, F10, GRV, 
             TRNS,FN7,FN8,FN6,BSLS,LBRC,RBRC,
                  LEFT,DOWN,UP,RIGHT,BSLS,DEL,
             TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,
                       TRNS,TRNS,TRNS,TRNS,TRNS,
        TRNS,TRNS,
        TRNS,
        TRNS,TRNS,TRNS
    ),


    KEYMAP(  // layout: layer 3: mouse + numpad
        // left hand
        TRNS,NO,  NO,  NO,  NO,  PAUS,PSCR,
        TRNS,WH_L,WH_U,WH_D,WH_R,BTN2,TRNS,
        TRNS,MS_L,MS_U,MS_D,MS_R,BTN1,
        TRNS,NO,  NO,  NO,  NO,  BTN3,TRNS,
        TRNS,FN4,TRNS,TRNS,TRNS,
                                      FN4,TRNS,
                                           TRNS,
                                 TRNS,TRNS,TRNS,
        // right hand
             SLCK,NLCK,PSLS,PAST,PAST,PMNS,BSPC,
             TRNS,NO,  P7,  P8,  P9,  PMNS,BSPC,
                  NO,  P4,  P5,  P6,  PPLS,PENT,
             TRNS,NO,  P1,  P2,  P3,  PPLS,PENT,
                       P0,  PDOT,SLSH,PENT,PENT,
        TRNS,TRNS,
        TRNS,
        TRNS,TRNS,TRNS
    )
};

enum function_id {
    TEENSY_KEY,
};

static const uint16_t PROGMEM fn_actions[] = {
    ACTION_FUNCTION(TEENSY_KEY),                    // FN0 - Teensy key
    ACTION_LAYER_MOMENTARY(2),                      // FN1 - switch to Layer1 from layer 0
    ACTION_LAYER_SET(1, ON_PRESS),                  // FN2 - push Layer2
    ACTION_LAYER_SET(3, ON_PRESS),                  // FN3 - push Layer3
    ACTION_LAYER_SET(0, ON_PRESS),                  // FN4 - push Layer0
    ACTION_LAYER_MOMENTARY(1),                      // FN5 - switch to Layer1 from layer 1
    ACTION_MODS_KEY(MOD_LSFT, KC_BSLS),             // FN6  = Shifted BackSlash // " in Workman
    ACTION_MODS_KEY(MOD_LSFT, KC_LBRC),             // FN7  = Shifted BackSlash // " in Workman
    ACTION_MODS_KEY(MOD_LSFT, KC_RBRC),             // FN8  = Shifted BackSlash // " in Workman
};

void action_function(keyrecord_t *event, uint8_t id, uint8_t opt)
{
    if (id == TEENSY_KEY) {
        clear_keyboard();
        print("\n\nJump to bootloader... ");
        _delay_ms(250);
        bootloader_jump(); // should not return
        print("not supported.\n");
    }
}
*/
/*
    KEYMAP(  // layout: layer N: transparent on edges, all others are empty
        // left hand
        TRNS,NO,  NO,  NO,  NO,  NO,  NO,  
        TRNS,NO,  NO,  NO,  NO,  NO,  TRNS,
        TRNS,NO,  NO,  NO,  NO,  NO,  
        TRNS,NO,  NO,  NO,  NO,  NO,  TRNS,
        TRNS,TRNS,TRNS,LALT,LGUI,
                                      TRNS,TRNS,
                                           TRNS,
                                 LCTL,LSFT,TRNS,
        // right hand
             NO,  NO,  NO,  NO,  NO,  NO,  TRNS,
             TRNS,NO,  NO,  NO,  NO,  NO,  TRNS,
                  NO,  NO,  NO,  NO,  NO,  TRNS,
             TRNS,NO,  NO,  NO,  NO,  NO,  TRNS,
                       RGUI,RALT,TRNS,TRNS,TRNS,
        TRNS,TRNS,
        TRNS,
        TRNS,RSFT,RCTL
    ),
    KEYMAP(  // layout: layer N: fully transparent
        // left hand
        TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,
        TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,
        TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,
        TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,
        TRNS,TRNS,TRNS,TRNS,TRNS,
                                      TRNS,TRNS,
                                           TRNS,
                                 TRNS,TRNS,TRNS,
        // right hand
             TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,
             TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,
                  TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,
             TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,TRNS,
                       TRNS,TRNS,TRNS,TRNS,TRNS,
        TRNS,TRNS,
        TRNS,
        TRNS,TRNS,TRNS
    ),
*/



/*
 * Fn action definition
static const uint16_t PROGMEM fn_actions[] = {
    ACTION_FUNCTION(TEENSY_KEY),                    // FN0  - Teensy key

    ACTION_MODS_KEY(MOD_LSFT, KC_BSLS),             // FN1  = Shifted BackSlash // " in Workman
    ACTION_MODS_KEY(MOD_LSFT, KC_MINS),             // FN2  = Shifted Minus     // \ in Workman
    ACTION_MODS_KEY(MOD_LSFT, KC_COMM),             // FN3  = Shifted comma     // < in Workman
    ACTION_MODS_KEY(MOD_LSFT, KC_DOT),              // FN4  = Shifted dot       // > in Workman

    ACTION_MODS_TAP_KEY(MOD_LCTL, KC_BSPC),         // FN5  = LShift with tap BackSpace
    ACTION_MODS_TAP_KEY(MOD_LSFT, KC_DEL),          // FN6  = LCtrl  with tap Delete
    ACTION_MODS_TAP_KEY(MOD_LALT, KC_ESC),          // FN7  = LAlt   with tap Escape
    ACTION_MODS_TAP_KEY(MOD_RALT, KC_INS),          // FN8  = RAlt   with tap Ins
    ACTION_MODS_TAP_KEY(MOD_RSFT, KC_ENT),          // FN9  = RShift with tap Enter
    ACTION_MODS_TAP_KEY(MOD_RCTL, KC_SPC),          // FN10 = RCtrl  with tap Space

    ACTION_MODS_TAP_KEY(MOD_LSFT, KC_TAB),          // FN11 = LShift with tap Tab
    ACTION_MODS_TAP_KEY(MOD_LCTL, KC_GRV),          // FN12 = LCtrl  with tap Tilda
    ACTION_MODS_TAP_KEY(MOD_LALT, KC_SPC),          // FN13 = LAlt   with tap Space
    ACTION_MODS_TAP_KEY(MOD_LGUI, KC_ESC),          // FN14 = LGui   with tap Escape
    ACTION_MODS_TAP_KEY(MOD_RSFT, KC_QUOT),         // FN15 = RShift with tap quotes
    ACTION_MODS_TAP_KEY(MOD_RCTL, KC_RBRC),         // FN16 = RCtrl  with tap ]

    ACTION_LAYER_SET(0, ON_BOTH),                   // FN17 - set Layer0
    ACTION_LAYER_SET(1, ON_BOTH),                   // FN18 - set Layer1, to use Workman layout at firmware level
    ACTION_LAYER_SET(2, ON_BOTH),                   // FN19 - set Layer2, to use with Numpad keys

    ACTION_LAYER_MOMENTARY(1),                      // FN20 - momentary Layer2, to use with Numpad keys
    ACTION_LAYER_TAP_KEY(5, KC_ENT),                // FN21 - momentary Layer5 on Enter, to use with F* keys on top row
    ACTION_LAYER_TAP_KEY(6, KC_ENT),                // FN22 - momentary Layer6 on Enter, to use with F* keys on top row, cursor, Teensy, Workman-layer switch
    ACTION_LAYER_MOMENTARY(7),                      // FN23 - momentary Layer7, to use with F* keys (F1-F24)

    ACTION_LAYER_TAP_KEY(4, KC_Z),                  // FN24 = momentary Layer4 on Z key, to use with unconvenient keys
    ACTION_LAYER_TAP_KEY(3, KC_X),                  // FN25 = momentary Layer3 on X key, to use with F* keys
    ACTION_LAYER_TAP_KEY(8, KC_C),                  // FN26 = momentary Layer8 on C key, to use with mouse and navigation keys
    ACTION_LAYER_TAP_KEY(2, KC_V),                  // FN27 = momentary Layer2 on V key, to use with Numpad keys

    // i'd like to remove this - will try to get used to live without this and convert them to usual keys
    ACTION_LAYER_TAP_KEY(4, KC_A),                  // FN28 = momentary Layer4 on A key, to use with unconvenient keys
    ACTION_LAYER_TAP_KEY(3, KC_S),                  // FN29 = momentary Layer3 on S key, to use with F* keys
    ACTION_LAYER_TAP_KEY(8, KC_D),                  // FN30 = momentary Layer8 on D key, to use with mouse and navigation keys
    ACTION_LAYER_TAP_KEY(2, KC_F),                  // FN31 = momentary Layer2 on F key, to use with Numpad keys
};

void action_function(keyrecord_t *event, uint8_t id, uint8_t opt)
{
    print("action_function called\n");
    print("id  = "); phex(id); print("\n");
    print("opt = "); phex(opt); print("\n");
    if (id == TEENSY_KEY) {
        clear_keyboard();
        print("\n\nJump to bootloader... ");
        _delay_ms(250);
        bootloader_jump(); // should not return
        print("not supported.\n");
    }
}
 */

