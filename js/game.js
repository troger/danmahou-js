// Game
danmahou.game = function(spec) {
  var canvas = null;
  var ctx = null;

  var interval = null;
  var lastUpdate = 0;

  var recordedFPS = 0,
    fps = 0,
    lastFPS = 0;

  var updateFPS = function() {
    if (danmahou.now() - lastFPS > 1000) {
			lastFPS = danmahou.now();
			recordedFPS = fps;
			fps = 0;
		}
		fps += 1;
  }

  var currentScreen = null;

  var keyboard = danmahou.keyboard(spec.gameKeys);

  var that = {};
  that.getScreenSize = function() {
    return spec.screenSize;
  };
  that.getKeyboard = function() {
    return keyboard;
  };

  that.getFPS = function() {
    return recordedFPS;
  }

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
    interval = danmahou.setInterval(this.updateAndRender, 15, this);
  };
  that.updateAndRender = function() {
    var now = danmahou.now();
    var elapsed = (now - lastUpdate);
    lastUpdate = now;

    if (currentScreen) {
      updateFPS();
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
