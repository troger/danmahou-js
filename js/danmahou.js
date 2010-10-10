danmahou.danmahouGame = function() {
  var game = danmahou.game({ screenSize: danmahou.size(450, 600), 
                             gameKeys: [danmahou.keys.KEY_UP, danmahou.keys.KEY_DOWN, danmahou.keys.KEY_RIGHT, danmahou.keys.KEY_LEFT, danmahou.keys.KEY_SHIFT, danmahou.keys.KEY_ENTER] });
  return game;
};

danmahou.mainMenuScreen = function(game) {
  var items = ['Start', 'Credits'];
  var selectedItemIndex = 0;

  var that = danmahou.screen(game);
  that.render = function(ctx) {
    var screenSize = game.getScreenSize();
    ctx.fillStyle = 'rgba(0,0,0,255)';
    ctx.fillRect(0, 0, screenSize.width, screenSize.height);

    var screenSize = game.getScreenSize();
    for (var index = 0; index < items.length; index++) {
      var color = index === selectedItemIndex ? 'rgba(255, 0, 0, 255)' : 'rgba(255, 255, 255, 255)';
      var y = (screenSize.height / 2) - (40 * (items.length - 1)) + index * 40;
      danmahou.drawText({ ctx: ctx, text: items[index], x: screenSize.width / 2, y: y, color: color, size: 20 });
    }
  };
  that.update = function(elapsed) {
    var keyboard = game.getKeyboard();
    if (keyboard.isKeyPressed(danmahou.keys.KEY_DOWN)) {
      selectedItemIndex++;
      if (selectedItemIndex >= items.length) {
        selectedItemIndex = 0;
      }
    }
    if (keyboard.isKeyPressed(danmahou.keys.KEY_UP)) {
      selectedItemIndex--;
      if (selectedItemIndex < 0) {
        selectedItemIndex = items.length - 1;
      }
    }
    if(keyboard.isKeyPressed(danmahou.keys.KEY_ENTER)) {
      if (selectedItemIndex === 0) {
        game.changeScreen(danmahou.gameScreen(game));
      }
    }
  };
  return that;
};

danmahou.loadingScreen = function(spec) {
  var game = spec.game;
  var screen = spec.screen;
  var screenSize = game.getScreenSize();

  var lastResourceLoaded = null;

  var rLoader = screen.getResourcesLoader();
  var currentLoader = rLoader.loadResources({ 
    images: [{ name: 'player', src: 'player.png' }, { name: 'player_bullet', src: 'player_bullet.png' }],
    sounds: [{ name: 'vague', src: 'vague.ogg' }], 
    onCompleteLoading: function() {
      game.changeScreen(spec.onCompleteScreen);
    }, 
    onResourceLoaded: function(resource) { 
      lastResourceLoaded = resource.src.substring(resource.src.lastIndexOf('/') + 1);  
    }, 
    context: this });  

  var that = danmahou.screen(game);

  that.render = function(ctx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, screenSize.width, screenSize.height);

    ctx.fillStyle = 'red';
    danmahou.drawText({ ctx: ctx, text: lastResourceLoaded, x: 50, y: (screenSize.height / 2) - 40, size: 20, align: 'left'  });
    ctx.strokeStyle = 'red';
    ctx.strokeRect(50, (screenSize.height / 2) - 20, screenSize.width - 100,30);
    var percent = Math.min((currentLoader.getLoadedResourcesCount() + 1) / currentLoader.getTotalResourcesCount(), 1);
    var width = Math.floor(percent * (screenSize.width - 100));
    ctx.fillRect(50, (screenSize.height / 2) - 20, width, 30);
  };

  return that;
};

danmahou.gameScreen = function(game)  {
  var screenSize = game.getScreenSize();

  var currentState = 'loadingResources';
  
  var currentMusic = null;

  var that = danmahou.screen(game);
  
  that.update = function(elapsed) {
    switch (currentState) {
    case 'loadingResources':
      game.changeScreen(danmahou.loadingScreen({
        game: game,
        screen: this,
        onCompleteScreen: this
      }));
      currentState = 'initialization';
      break;
    case 'initialization':
      this.getObjectManager().addPlayer(
        player = danmahou.player({ 
          game: game,
          screen: this,
          position: danmahou.vector2(screenSize.width / 2, screenSize.height) 
        }));
      currentMusic = danmahou.sound({ 
        screen: this, 
        name: 'vague', 
        loop: true 
      });
      currentMusic.play();
      currentState = 'inGame';
      break;
    case 'inGame':
      this.getObjectManager().update(elapsed);
      break;
    }
  };
  that.render = function(ctx) {
    switch(currentState) {
    case 'inGame':
      ctx.fillStyle = 'rgba(0,0,0,255)';
      ctx.fillRect(0, 0, screenSize.width, screenSize.height);
      this.getObjectManager().render(ctx);
      break;
    }
  };
  return that;
};

danmahou.objectManager = function(spec) {
  var player = null;
  var playerBullets = [];
  var enemyBullets = [];
  var enemies = [];
  var items = [];

  var that = {};
  
  that.addPlayer = function(newPlayer) {
    player = newPlayer;
  };
  that.addPlayerBullet = function(bullet) {
    playerBullets.push(bullet);
  };
  that.addEnemyBullet = function(bullet) {
    enemyBullets.push(bullet);
  };
  that.addEnemy = function(enemy) {
    enemies.push(enemy);
  };
  that.addItems = function(item) {
    items.push(item);
  };
  that.update = function(elapsed) {
    player.update(elapsed);
    enemies.forEach(function(e) {
      e.update(elapsed);
    });
    playerBullets.forEach(function(b) {
      b.update(elapsed);
    });
    enemyBullets.forEach(function(b) {
      b.update(elapsed);
    });
    items.forEach(function(item) {
      item.update(elapsed);
    });
  };
  that.render = function(ctx) {
    player.render(ctx);
    enemies.forEach(function(e) {
      e.render(ctx);
    });
    playerBullets.forEach(function(b) {
      b.render(ctx);
    });
    enemyBullets.forEach(function(b) {
      b.render(ctx);
    });
    items.forEach(function(item) {
      item.render(ctx);
    });
  };

  return that;
};
