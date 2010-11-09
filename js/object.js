// Object
danmahou.object = function(spec) {
  var game = spec.screen.getGame();
  var screen = spec.screen;

  var behaviors = [];
  var currentBehavior = null;
  var that = {};
  that.position = spec.position || danmahou.vector2();
  that.direction = spec.direction || danmahou.vector2();
  that.velocity = spec.velocity || 0;
  that.size = danmahou.size(0, 0);

  that.angle = spec.angle || 0;
  that.delayBeforeSpawn = spec.delayBeforeSpawn || 0;

  that.life = spec.life || 0;

  that.getScreen = function() {
    return screen;
  };

  that.update = function(elapsed) {
    if (currentBehavior == null) {
      if (behaviors.length > 0) {
        currentBehavior = behaviors[0];
      }
    }

    if (currentBehavior != null) {
      currentBehavior.update(elapsed);
      if (currentBehavior.done === true) {
        behaviors.slice(0, 1);
        currentBehavior = null;
      }
    }
  };
  that.render = function(ctx) {
  };

  that.addBehavior = function(behavior) {
    behavior.object = that;
    behaviors.push(behavior);
  }
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
      velocity = 0.20;
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
          sprite: danmahou.sprites.playerBullet,
          position: danmahou.vector2(this.position.x - bulletImage.width / 2, this.position.y),
          direction: danmahou.vector2(0, -1),
          velocity: 1.5,
          damage : 5
        }));
    objectManager.addPlayerBullet(
        danmahou.bullet({
          screen: spec.screen,
          sprite: danmahou.sprites.playerBullet,
          position: danmahou.vector2(this.position.x + bulletImage.width / 2, this.position.y),
          direction: danmahou.vector2(0, -1),
          velocity: 1.5,
          damage : 5
        }));
    objectManager.addPlayerBullet(
        danmahou.bullet({
          screen: spec.screen,
          sprite: danmahou.sprites.playerBullet,
          position: danmahou.vector2(this.position.x + bulletImage.width, this.position.y),
          direction: danmahou.vector2(0.15, -1),
          velocity: 1.5,
          damage : 5
        }));
    objectManager.addPlayerBullet(
        danmahou.bullet({
          screen: spec.screen,
          sprite: danmahou.sprites.playerBullet,
          position: danmahou.vector2(this.position.x - bulletImage.width, this.position.y),
          direction: danmahou.vector2(-0.15, -1),
          velocity: 1.5,
          damage : 5
        }));

    danmahou.sound({
      screen: spec.screen,
      name: 'player_shoot',
      loop: false
    }).play();
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
    ctx.save();
    if (this.angle !== 0) {
      ctx.translate(this.position.x - this.size.width / 2, this.position.y - this.size.height / 2);
      ctx.rotate(danmahou.math.util.toRadians(this.angle - 90));
      ctx.translate(-(this.position.x - this.size.width / 2), -(this.position.y - this.size.height / 2));
    }
    ctx.drawImage(image, this.position.x - this.size.width / 2, this.position.y - this.size.height / 2);
    ctx.restore();
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
    ctx.save();
    if (this.angle !== 0) {
      ctx.translate(this.position.x - this.size.width / 2, this.position.y - this.size.height / 2);
      ctx.rotate(danmahou.math.util.toRadians(this.angle - 90));
      ctx.translate(-(this.position.x - this.size.width / 2), -(this.position.y - this.size.height / 2));
    }
    ctx.drawImage(image, animationIndex * spec.imageSize.width, 0,
        spec.imageSize.width, spec.imageSize.height,
        this.position.x - this.size.width / 2, this.position.y - this.size.height / 2, spec.imageSize.width, spec.imageSize.height);
    ctx.restore();
  };

  return object;
};

danmahou.bullet = function(spec) {

  var that = danmahou.object(spec);

  that.damage = spec.damage || 0;
  that.isCollidable = true;
  that.getCollisionArea = function() {
    spec.sprite.collisionArea.setCenter(this.position.x, this.position.y);
    return spec.sprite.collisionArea;
  };
  that.handleCollision = function(otherObject) {
    this.dead = true;
    spec.screen.getObjectManager().addItems(danmahou.bulletHit({
      screen: spec.screen,
      sprite: danmahou.sprites.playerBulletHit,
      displayTime: 100,
      position: danmahou.vector2(this.position.x, this.position.y - this.size.height / 2) }))
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

  if (spec.sprite.isAnimated === true) {
    return danmahou.animatedObject(that, { game: game, screen: spec.screen, image: spec.sprite.image, imageSize: spec.sprite.imageSize, animationDelay: spec.sprite.animationDelay });
  } else {
    return danmahou.visualObject(that, { game: game, screen: spec.screen, image: spec.sprite.image });
  }

};

danmahou.bulletHit = function(spec) {
  var that = danmahou.object(spec);
  var totalElapsed = 0;
  that.update = function(elapsed) {
    totalElapsed += elapsed;
    if (totalElapsed >= spec.displayTime) {
      this.dead = true;
    }
  };

  if (spec.sprite.isAnimated === true) {
    return danmahou.animatedObject(that, { game: game, screen: spec.screen, image: spec.sprite.image, imageSize: spec.sprite.imageSize, animationDelay: spec.sprite.animationDelay });
  } else {
    return danmahou.visualObject(that, { game: game, screen: spec.screen, image: spec.sprite.image });
  }
};

danmahou.enemy = function(spec) {
  var that = danmahou.object(spec);
  that.updateEnemy = spec.updateEnemy;
  that.shoot = spec.shoot || function(){};
  that.delay = spec.delay;
  that.isCollidable = true;
  that.getCollisionArea = function() {
    spec.sprite.collisionArea.setCenter(this.position.x, this.position.y);
    return spec.sprite.collisionArea;
  };
  that.handleCollision = function(otherObject) {
    this.life -= Number(otherObject.damage) || 0;
    if (this.life <= 0) {
      this.dead = true;
    }
  };

  that.update = function(elapsed) {
    this.updateEnemy.call(this, elapsed);
    this.shoot.call(this, elapsed);
  };

  if (spec.sprite.isAnimated === true) {
    return danmahou.animatedObject(that, { game: game, screen: spec.screen, image: spec.sprite.image, imageSize: spec.sprite.imageSize, animationDelay: spec.sprite.animationDelay });
  } else {
    return danmahou.visualObject(that, { game: game, screen: spec.screen, image: spec.sprite.image });
  }
};
