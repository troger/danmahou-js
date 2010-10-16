// Sound
danmahou.sound = function(spec) {
  var screen = spec.screen;

  var sound = screen.getResourcesLoader().getSound(spec.name);

  // should we loop?
  var loop = spec.loop || false;
  if(loop) {
    sound.addEventListener('ended', sound.play, false);
  }

  // the final Sound object
  var that = {}
  that.play = function() {
    sound.play();
  };
  that.pause = function() {
    sound.pause();
  };
  that.stop = function() {
    sound.pause();
    sound.currentTime = 0;
  };
  return that;
};
