danmahou.danmahouGame = function() {
  var game = danmahou.game({ screenSize: danmahou.size(450, 600),
                             gameKeys: [danmahou.keys.KEY_UP, danmahou.keys.KEY_DOWN, danmahou.keys.KEY_RIGHT,
                                        danmahou.keys.KEY_LEFT, danmahou.keys.KEY_SHIFT, danmahou.keys.KEY_ENTER] });
  return game;
};

danmahou.mainMenuScreen = function(game) {
  var items = ['Start', 'Options', 'Credits'];
  var selectedItemIndex = 0;

  var currentState = 'initialization';

  var screenSize = game.getScreenSize();

  var currentMusic = null;

  var that = danmahou.screen(game);
  that.render = function(ctx) {
    switch (currentState) {
      case 'loading':
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, screenSize.width, screenSize.height);
        danmahou.drawText({ ctx: ctx, text: 'Now loading...', x: screenSize.width / 2, y: screenSize.height / 2, size: 26, align: 'center', color: 'white' });
        break;
      case 'menu':
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, screenSize.width, screenSize.height);
        for (var index = 0; index < items.length; index++) {
          var color = index === selectedItemIndex ? 'red' : 'white';
          var y = (screenSize.height / 2) - (40 * (items.length - 1)) + index * 40;
          danmahou.drawText({ ctx: ctx, text: items[index], x: screenSize.width / 2, y: y, color: color, size: 20 });
        }
        break;
    }
  };
  that.update = function(elapsed) {
    switch (currentState) {
      case 'initialization':
          var rLoader = this.getResourcesLoader();
          rLoader.clear();
          var loader = rLoader.loadResources({
            images: [],
            sounds: [
              { name: 'main_menu', src: 'data/musics/main_menu.ogg' }
            ],
            onCompleteLoading: function() {
              currentMusic = danmahou.sound({
                screen: this,
                name: 'main_menu',
                loop: true
              });
              currentMusic.play();
              currentState = 'menu';
            },
            context: this });
          currentState = 'loading';
          break;
      case 'menu':
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
              currentMusic.stop();
              game.changeScreen(danmahou.gameScreen(game));
            }
          }
          break;
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
  rLoader.clear();
  var currentLoader = rLoader.loadResources({
    images: spec.level.getImages(),
    sounds: spec.level.getSounds(),
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
  var that = danmahou.screen(game);

  var screenSize = game.getScreenSize();

  var currentState = 'loadingResources';

  var currentLevel = null;

  var currentMusic = null;

  that.update = function(elapsed) {
    switch (currentState) {
    case 'loadingResources':
      currentLevel = danmahou.level1(this);
      game.changeScreen(danmahou.loadingScreen({
        game: game,
        screen: this,
        level: currentLevel,
        onCompleteScreen: this
      }));
      currentState = 'initialization';
      break;
    case 'initialization':
      currentLevel.initialize();
      this.getObjectManager().addPlayer(
        player = danmahou.player({
          game: game,
          screen: this,
          position: danmahou.vector2(screenSize.width / 2, screenSize.height),
          life: 3
        }));
      currentMusic = danmahou.sound({
        screen: this,
        name: 'stage1',
        loop: true
      });
      currentMusic.play();
      currentState = 'inGame';
      break;
    case 'inGame':
      var enemies = currentLevel.spawn(elapsed);
      for (var index = 0; index < enemies.length; ++index) {
        this.getObjectManager().addEnemy(enemies[index]);
      }
      this.getObjectManager().update(elapsed);

        if (this.getObjectManager().getPlayer().dead) {
          currentState = 'gameOver';
        }
      break;

      case 'gameOver':
        var keyboard = game.getKeyboard();
        if (keyboard.isKeyPressed(danmahou.keys.KEY_ENTER)) {
          this.getObjectManager().clear();
          currentState = 'initialization';
        }
        break;
    }
  };
  that.render = function(ctx) {
    switch (currentState) {
      case 'inGame':
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, screenSize.width, screenSize.height);
        this.getObjectManager().render(ctx);
        danmahou.drawText({ ctx: ctx, text: 'Objects: ' + this.getObjectManager().totalObjects(), x: screenSize.width, y: 10, size: 14, align: 'right'  });
        break;

      case 'gameOver':
        danmahou.drawText({ ctx: ctx, text: 'GAME OVER', x: screenSize.width / 2, y: screenSize.height / 2, size: 32, align: 'center', color: 'red' });
        break;
    }
  };
  return that;
};

danmahou.objectManager = function(game) {
  var player = null;
  var playerBullets = [];
  var enemyBullets = [];
  var enemies = [];
  var items = [];

  var that = {};

  that.totalObjects = function() {
    return 1 + playerBullets.length + enemyBullets.length + enemies.length + items.length;
  };

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

  that.getPlayer = function() {
    return player;
  };

  that.clear = function() {
    player = null;
    playerBullets = [];
    enemyBullets = [];
    enemies = [];
    items = [];
  };

  that.update = function(elapsed) {
    if (!player.dead) {
      player.update(elapsed);
    }

    for (var i = 0; i < enemies.length; ++i) {
      var e = enemies[i];
      e.update(elapsed);
      if (e.dead === true) {
        enemies.splice(i, 1);
      }
    }
    for (var i = 0; i < playerBullets.length; ++i) {
      var b = playerBullets[i];
      b.update(elapsed);
      if (b.dead === true) {
        playerBullets.splice(i, 1);
      }
    }
    for (var i = 0; i < enemyBullets.length; ++i) {
      var b = enemyBullets[i];
      b.update(elapsed);
      if (b.dead === true) {
        enemyBullets.splice(i, 1);
      }
    }
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      item.update(elapsed);
      if (item.dead === true) {
        items.splice(i, 1);
      }
    }

    // collisions
    // playerBullets with enemies
    for (var i = 0; i < playerBullets.length; ++i) {
      if (playerBullets[i].isCollidable === true) {
        for (var j = 0; j < enemies.length; ++j) {
          if (enemies[j].isCollidable === true) {
            if(playerBullets[i].getCollisionArea().intersects(enemies[j].getCollisionArea())) {
              enemies[j].handleCollision(playerBullets[i]);
            }
          }
        }
      }
    }
    // enemyBullets with player
    for (var i = 0; i < enemyBullets.length; ++i) {
      if (enemyBullets[i].isCollidable === true) {
        if (player.isCollidable === true) {
          if(enemyBullets[i].getCollisionArea().intersects(player.getCollisionArea())) {
            player.handleCollision(enemyBullets[i]);
          }
        }
      }
    }
  };
  that.render = function(ctx) {
    if (!player.dead) {
      player.render(ctx);
    }
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
