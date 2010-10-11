// Object
danmahou.object = function(spec) {
  var game = spec.screen.getGame();

  var that = {};
  that.position = spec.position || danmahou.vector2();
  that.direction = spec.direction || danmahou.vector2();
  that.velocity = spec.velocity || 0;
  that.size = danmahou.size(0, 0);

  that.update = function(elapsed) {
  };
  that.render = function(ctx) {
  };
  return that;
};

danmahou.player = function(spec) {
  var delay = 0;

  var that = danmahou.object(spec);

  that.update = function(elapsed) {
    var keyboard = game.getKeyboard();
    var velocity = 0.5;
    var moveX = 0, moveY = 0;
    if (keyboard.isKeyDown(danmahou.keys.KEY_SHIFT)) {
      velocity = 0.25;
    }

    if (keyboard.isKeyDown(danmahou.keys.KEY_LEFT)) {
      moveX = -velocity * elapsed;
    }
    if (keyboard.isKeyDown(danmahou.keys.KEY_RIGHT)) {
      moveX = velocity * elapsed;
    }
    if (keyboard.isKeyDown(danmahou.keys.KEY_UP)) {
      moveY = -velocity * elapsed;
    }
    if (keyboard.isKeyDown(danmahou.keys.KEY_DOWN)) {
      moveY = velocity * elapsed;
    }
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.7;
      moveY *= 0.7;
    }
    this.position.x += moveX;
    this.position.y += moveY;
    
    var screenSize = game.getScreenSize();
    if (this.position.x < 0 + this.size.width / 2)  {
      this.position.x = 0 + this.size.width / 2;
    }
    if (this.position.x + this.size.width / 2 > screenSize.width) {
      this.position.x = screenSize.width - this.size.width / 2;
    }
    if (this.position.y < 0 + this.size.height / 2) {
      this.position.y = 0 + this.size.height / 2;
    }
    if (this.position.y + this.size.height / 2 > screenSize.height) {
      this.position.y = screenSize.height - this.size.height / 2;
    }

    if (keyboard.isKeyDown(danmahou.keys.KEY_Z)) {
      if (delay <= 0) {
        this.shoot();
        delay = 50;
      } else {
        delay -= elapsed;
      }
    }
  };
  
  that.shoot = function() {
    var objectManager = spec.screen.getObjectManager();
    var resourcesLoader = spec.screen.getResourcesLoader();
    var bulletImage = resourcesLoader.getImage('player_bullet');
    objectManager.addPlayerBullet(
      danmahou.playerBullet({
        screen: spec.screen,
        position: danmahou.vector2(this.position.x - bulletImage.width / 2, this.position.y),
        direction: danmahou.vector2(0, -1),
        velocity: 1.5
      }));
    objectManager.addPlayerBullet(
      danmahou.playerBullet({
        screen: spec.screen,
        position: danmahou.vector2(this.position.x + bulletImage.width / 2, this.position.y),
        direction: danmahou.vector2(0, -1),
        velocity: 1.5
      }));
  };
  
  return danmahou.visualObject(that, { game: game, screen: spec.screen, image: 'player' });
};

danmahou.visualObject = function(object, spec) {
  var image = spec.screen.getResourcesLoader().getImage(spec.image);

  object.size = danmahou.size(image.width, image.height);
  
  object.render = function(ctx) {
    ctx.drawImage(image, this.position.x - image.width / 2, this.position.y - image.height / 2);
  };
  return object;
};

danmahou.animatedObject = function(object, spec) {
  return object;
};

danmahou.playerBullet = function(spec) {

  var that = danmahou.object(spec);
  
  that.update = function(elapsed) {
    this.position.x += this.direction.x * this.velocity * elapsed;
    this.position.y += this.direction.y * this.velocity * elapsed;

    var screenSize = game.getScreenSize();
    if ((this.position.x + this.size.width * 0.5 < 0)
        || (this.position.x - this.size.width * 0.5 > screenSize.width)
        || (this.position.y + this.size.height * 0.5 < 0)
        || (this.position.y - this.size.height * 0.5 > screenSize.height)) {
      this.dead = true;
    }
  };

  return danmahou.visualObject(that, { game: game, screen: spec.screen, image: 'player_bullet' });
};

danmahou.enemy = function(spec) {
  var that = danmahou.object(spec);
  that.update = spec.update;
  that.delay = spec.delay;
  return danmahou.visualObject(that, { game: game, screen: spec.screen, image: spec.image });
};
