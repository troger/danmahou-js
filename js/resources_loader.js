// Resources loading
danmahou.resourcesLoader = function() {
  var images = {};
  var sounds = {};

  var that = {};
  that.getImage = function(name) {
    return images[name];
  };
  that.getSound = function(name) {
    return sounds[name];
  };

  that.loadResources = function(spec) {
    var imagesToLoad = spec.images || [];
    var soundsToLoad = spec.sounds || [];
    var totalResourcesCount = imagesToLoad.length + soundsToLoad.length;
    var loadedResourcesCount = 0;
    
    var loader = {};
    loader.getTotalResourcesCount = function() {
      return totalResourcesCount;
    };
    loader.getLoadedResourcesCount = function() {
      return loadedResourcesCount;
    };
    loader.load = function() {
      for (var index = 0; index < imagesToLoad.length; index++) {
        var image = imagesToLoad[index];
        images[image.name] = new Image();
        danmahou.on('load', this.handleResourceLoaded, images[image.name], this);
        images[image.name].src = image.src;
      }
      for (var index = 0; index < soundsToLoad.length; index++) {
        var sound = soundsToLoad[index];
        sounds[sound.name] = new Audio();
        danmahou.on('canplaythrough', this.handleResourceLoaded, sounds[sound.name], this);

        sounds[sound.name].autobuffer = true;
        sounds[sound.name].preload = 'auto';
        sounds[sound.name].src = sound.src;
        sounds[sound.name].load();
      }
    }
    loader.handleResourceLoaded = function(e) {
      loadedResourcesCount++;
      if (spec.onResourceLoaded) {
        spec.onResourceLoaded.apply(spec.context, [e.target]);
      }
      if(loadedResourcesCount == totalResourcesCount) {
        spec.onCompleteLoading.call(spec.context);
      }
    };

    loader.load();
    return loader;
  };

  that.clear = function () {
    images = {};
    sounds = {};
  };
  return that;
};
