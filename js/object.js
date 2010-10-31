// Object
danmahou.object = function(spec) {
  var game = spec.screen.getGame();
  var screen = spec.screen;

  var that = {};
  that.position = spec.position || danmahou.vector2();
  that.direction = spec.direction || danmahou.vector2();
  that.velocity = spec.velocity || 0;
  that.size = danmahou.size(0, 0);

  that.life = spec.life || 0;

  that.getScreen = function() {
    return screen;
  };

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
    if (this.position.x < 0 + this.size.width / 2) {
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
        danmahou.bullet({
          screen: spec.screen,
          image: 'player_bullet',
          position: danmahou.vector2(this.position.x - bulletImage.width / 2, this.position.y),
          direction: danmahou.vector2(0, -1),
          velocity: 1.5,
          collisionArea: danmahou.rect(1, 5, 14, 45),
          damage : 5
        }));
    objectManager.addPlayerBullet(
        danmahou.bullet({
          screen: spec.screen,
          image: 'player_bullet',
          position: danmahou.vector2(this.position.x + bulletImage.width / 2, this.position.y),
          direction: danmahou.vector2(0, -1),
          velocity: 1.5,
          collisionArea: danmahou.rect(1, 5, 14, 45),
          damage : 5
        }));
    objectManager.addPlayerBullet(
        danmahou.bullet({
          screen: spec.screen,
          image: 'player_bullet',
          position: danmahou.vector2(this.position.x + bulletImage.width, this.position.y),
          direction: danmahou.vector2(0.15, -1),
          velocity: 1.5,
          collisionArea: danmahou.rect(1, 5, 14, 45),
          damage : 5
        }));
    objectManager.addPlayerBullet(
        danmahou.bullet({
          screen: spec.screen,
          image: 'player_bullet',
          position: danmahou.vector2(this.position.x - bulletImage.width, this.position.y),
          direction: danmahou.vector2(-0.15, -1),
          velocity: 1.5,
          collisionArea: danmahou.rect(1, 5, 14, 45),
          damage : 5
        }));
  };

  var collisionArea = danmahou.rect(23, 23, 2, 2);
  that.isCollidable = true;
  that.getCollisionArea = function() {
    collisionArea.setCenter(this.position.x, this.position.y);
    return collisionArea;
  };
  that.handleCollision = function(otherObject) {
    if (this.dead) {
      return;
    }

    var damage = Number(otherObject.damage) || 0;
    otherObject.dead = true;
    this.life -= damage;
    if (this.life <= 0) {
      this.dead = true;
    } else if (damage !== 0) {
      this.position = danmahou.vector2(game.getScreenSize().width / 2, game.getScreenSize().height - this.size.width / 2);
    }
  };

  return danmahou.visualObject(that, { game: game, screen: spec.screen, image: 'player' });
};

danmahou.visualObject = function(object, spec) {
  var image = spec.screen.getResourcesLoader().getImage(spec.image);

  object.size = danmahou.size(image.width, image.height);

  object.render = function(ctx) {
    ctx.drawImage(image, this.position.x - this.size.width / 2, this.position.y - this.size.height / 2);
  };
  return object;
};

danmahou.animatedObject = function(object, spec) {
  var animationIndex = 0,
      animationElapsed = 0,
      image = spec.screen.getResourcesLoader().getImage(spec.image);

  var maxImages = image.width / spec.imageSize.width;

  object.size = danmahou.size(spec.imageSize.width, spec.imageSize.height);

  var oldUpdate = object.update;
  object.update = function(elapsed) {
    oldUpdate.call(object, elapsed);

    if (animationElapsed >= spec.animationDelay) {
      animationElapsed = 0;
      animationIndex = (animationIndex + 1) % maxImages;
    } else {
      animationElapsed += elapsed;
    }
  };

  object.render = function(ctx) {
    ctx.drawImage(image, animationIndex * spec.imageSize.width, 0,
        spec.imageSize.width, spec.imageSize.height,
        this.position.x - this.size.width / 2, this.position.y - this.size.height / 2, spec.imageSize.width, spec.imageSize.height);
  };

  return object;
};

danmahou.bullet = function(spec) {

  var that = danmahou.object(spec);

  that.damage = spec.damage || 0;
  that.isCollidable = true;
  that.getCollisionArea = function() {
    spec.collisionArea.setCenter(this.position.x, this.position.y);
    return spec.collisionArea;
  };
  that.handleCollision = function(otherObject) {
  };

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

  if (spec.isAnimated === true) {
    return danmahou.animatedObject(that, { game: game, screen: spec.screen, image: spec.image, imageSize: spec.imageSize, animationDelay: spec.animationDelay });
  } else {
    return danmahou.visualObject(that, { game: game, screen: spec.screen, image: spec.image });
  }

};

danmahou.enemy = function(spec) {
  var that = danmahou.object(spec);
  that.updateEnemy = spec.updateEnemy;
  that.shoot = spec.shoot || function(){};
  that.delay = spec.delay;
  that.isCollidable = true;
  that.getCollisionArea = function() {
    spec.collisionArea.setCenter(this.position.x, this.position.y);
    return spec.collisionArea;
  };
  that.handleCollision = function(otherObject) {
    this.life -= Number(otherObject.damage) || 0;
    otherObject.dead = true;
    if (this.life <= 0) {
      this.dead = true;
    }
  };

  that.update = function(elapsed) {
    this.updateEnemy.call(this, elapsed);
    this.shoot.call(this, elapsed);
  };

  return danmahou.visualObject(that, { game: game, screen: spec.screen, image: spec.image });
};
