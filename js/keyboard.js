// Keyboard
danmahou.keys = {
  KEY_LEFT: 37,
  KEY_UP: 38,
  KEY_RIGHT: 39,
  KEY_DOWN: 40,
  KEY_Z: 90,
  KEY_X: 88,

  KEY_SPACE: 32,
  KEY_ENTER: 13,
  KEY_SHIFT: 16
};

danmahou.keyboard = function(gameKeys) {
  var keyStates = {};
  var lastKeyStates = {};
  gameKeys = gameKeys || [];

  // register events
  danmahou.on('keydown', function(e) {
    keyStates[e.keyCode] = true;
    suppressKeyEvent(e);
  }, window, this);
  danmahou.on('keyup', function(e) {
    keyStates[e.keyCode] = false;
    suppressKeyEvent(e);
  }, window, this);

  // suppress key event if needed
  var suppressKeyEvent = function(e) {
    if (gameKeys.length === 0 || gameKeys.contains(e.keyCode)) {
      danmahou.stopEvent(e);
    }
  };

  var that = {};
  that.isKeyDown = function(keyCode) {
    return keyStates[keyCode] === true;
  };
  that.isKeyPressed = function(keyCode) {
    return keyStates[keyCode] === true && lastKeyStates[keyCode] !== true;
  };
  that.saveKeyStates = function() {
    for (var keyCode in keyStates) {
      lastKeyStates[keyCode] = keyStates[keyCode];
    }
  };
  return that;
};
