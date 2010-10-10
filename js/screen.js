// Screens
danmahou.screen = function(game) {
  var resourcesLoader = danmahou.resourcesLoader();
  var objectManager = danmahou.objectManager();

  var that = {};
  that.getGame = function() {
    return game;
  };
  that.getResourcesLoader = function() {
    return resourcesLoader;
  };
  that.getObjectManager = function() {
    return objectManager;
  };
  that.update = function(elapsed) {
  };
  that.render = function(ctx) {
  };
  return that;
};
