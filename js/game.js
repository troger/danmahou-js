// Game
danmahou.game = function(spec) {
  var canvas = null;
  var ctx = null;

  var interval = null;
  var lastUpdate = 0;

  var currentScreen = null;

  var keyboard = danmahou.keyboard(spec.gameKeys);

  var that = {};
  that.getScreenSize = function() {
    return spec.screenSize;
  };
  that.getKeyboard = function() {
    return keyboard;
  };

  that.init = function() {
    canvas = danmahou.create('canvas');
    canvas.width = spec.screenSize.width;
    canvas.height = spec.screenSize.height;
    ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    currentScreen = danmahou.mainMenuScreen(this);
  };
  that.run = function() {
    this.init();
    lastUpdate = danmahou.now();
    interval = danmahou.setInterval(this.updateAndRender, 0, this);
  };
  that.updateAndRender = function() {
    var now = danmahou.now();
    var elapsed = (now - lastUpdate);
    lastUpdate = now;

    if (currentScreen) {
      currentScreen.update(elapsed);
      currentScreen.render(ctx);
    }

    // save this frame key states
    keyboard.saveKeyStates();
  };
  that.changeScreen = function(screen) {
    currentScreen = screen;
  };

  return that;
};
