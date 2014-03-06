var assert = require('assert');

describe("tmk_load", function() {
  var firmware = require("../firmwares/tmk.js");
  var keyboardMock = {
    addMapping: function() {}
  };
  describe("#load keymaps", function() {
    it('should find all 4 keymaps', function(done) {
      firmware.load('./test/tmk.h', function(error, def) {
        if(error) done(error);
        assert.equal(4, def.maps.length);
        done();
      });
    })
  });
  describe("#parse keys", function() {
    it('should find all keys', function(done) {
      firmware.load('./test/tmk.h', function(error, def) {
        if(error) done(error);
        assert.equal(76, def.maps[0].length);
        assert.equal('ESC', def.maps[0][0]);
        done();
      });
    })
  });
  describe("#parse actions", function() {
    it('should find all actions', function(done) {
      firmware.load('./test/tmk.h', function(error, def) {
        if(error) done(error);
        assert.equal(9, def.actions.length);
        assert.equal('ACTION_LAYER_MOMENTARY', def.actions[1].fn);
        assert.equal('2', def.actions[1].args[0]);
        done();
      });
    })
  });
});
