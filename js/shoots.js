danmahou.shoot = function(spec) {
  var shootDelay = spec.initialDelay || 0;
  return function(elapsed) {
    if (shootDelay <= 0) {
      for (var i = 0; i < spec.shootFunctions.length; i++) {
        spec.shootFunctions[i].call(this, elapsed);
      }
      shootDelay = spec.delayBetweenShoot;
    } else {
      shootDelay -= elapsed;
    }
  };
};

danmahou.shoots = {};
danmahou.shoots.circularShoot = function (spec) {
  var nbBullets = Number(spec.nbBullets) || 16;
  var startAngle = Number(spec.startAngle) || 0;
  var angleToAdd = Number(spec.angleToAdd) || 0;
  var relativePosition = spec.relativePosition || danmahou.vector2(0, 0);
  return function(elapsed) {
    var objectManager = this.getScreen().getObjectManager();
    var angle = 360 / nbBullets;
    var currentAngle = startAngle;
    for (var i = 0; i < nbBullets; ++i) {
      var direction = danmahou.vector2FromAngle(currentAngle);
      direction.normalize();
      objectManager.addEnemyBullet(
          danmahou.bullet({
            parent: this,
            screen: this.getScreen(),
            sprite: danmahou.sprites.roundBlueBullet,
            position: danmahou.vector2(this.position.x + relativePosition.x, this.position.y + relativePosition.y),
            direction: direction,
            velocity: 0.125,
            damage: 1
          }));
      currentAngle += angle;
    }
    startAngle = (startAngle + angleToAdd) % 360;
  };
};

danmahou.shoots.clusterShoot = function (spec) {
  var angleInterval = spec.angleInterval || [5, 5];
  var velocityInterval = spec.velocityInterval || [0.15, 0.20];
  var nbBullets = spec.nbBullets || 10;
  var relativePosition = spec.relativePosition || danmahou.vector2(0, 0);

  return function (elapsed) {
    var objectManager = this.getScreen().getObjectManager();
    var player = objectManager.getPlayer();

    var directionTowardPlayer = player.position.subtract(this.position);
    directionTowardPlayer = directionTowardPlayer.normalize();

    var angle = directionTowardPlayer.getAngle();
    var minAngle = angle - angleInterval[0];
    var maxAngle = angle + angleInterval[1];

    for (var i = 0; i < nbBullets; ++i) {
      var newAngle = danmahou.random.nexFloat(minAngle, maxAngle);
      var direction = danmahou.vector2FromAngle(newAngle).normalize();
      var velocity = danmahou.random.nexFloat(velocityInterval[0], velocityInterval[1]);
      objectManager.addEnemyBullet(
      danmahou.bullet({
        parent: this,
        screen: this.getScreen(),
        sprite: danmahou.sprites.roundBlueBullet,
        position: danmahou.vector2(this.position.x + relativePosition.x, this.position.y + relativePosition.y),
        direction: direction,
        velocity: velocity,
        damage: 1
      }));
    }
  };
};

danmahou.shoots.straightShoot = function (spec) {
  var nbBullets = spec.nbBullets || 5;
  var velocity = spec.velocity || 0.25;
  var relativePosition = spec.relativePosition || danmahou.vector2(0, 0);
  var towardPlayer = spec.towardPlayer || false;
  var timeBetweenShoot = spec.timeBetweenShoot || 50;

  return function (elapsed) {
    var objectManager = this.getScreen().getObjectManager();

    var direction = danmahou.vector2(0, 1);
    if (towardPlayer) {
      var shootPosition = danmahou.vector2(this.position.x + relativePosition.x, this.position.y + relativePosition.y);
      var player = objectManager.getPlayer();
      direction = player.position.subtract(shootPosition).normalize();
    }

    for (var i = 0; i < nbBullets; ++i) {
      objectManager.addEnemyBullet(
      danmahou.bullet({
        parent: this,
        screen: this.getScreen(),
        sprite: danmahou.sprites.blueBullet,
        position: danmahou.vector2(this.position.x + relativePosition.x, this.position.y + relativePosition.y),
        direction: direction,
        velocity: velocity,
        damage: 1,
        delayBeforeSpawn: timeBetweenShoot * i,
        angle: direction.getAngle()
      }));
    }
  };
};


danmahou.shoots.bossShoot = function (spec) {
  spec = spec || {};
  var nbBullets = spec.nbBullets || 100;
  var relativePosition = spec.relativePosition || danmahou.vector2(0, 0);

  return function (elapsed) {
    var objectManager = this.getScreen().getObjectManager();

    var shootPosition = danmahou.vector2(this.position.x + relativePosition.x, this.position.y + relativePosition.y);
    var player = objectManager.getPlayer();
    var directionTowardPlayer = player.position.subtract(shootPosition).normalize();
    var angle = directionTowardPlayer.getAngle();

    for (var i = 0; i < nbBullets; ++i) {
      var direction = danmahou.vector2FromAngle(angle - 45 + Math.random() * 90);
      var velocity = 0.1 + Math.random() * 0.3;
      objectManager.addEnemyBullet(
      danmahou.bullet({
        parent: this,
        screen: this.getScreen(),
        sprite: danmahou.sprites.roundBlueBullet,
        position: danmahou.vector2(this.position.x + relativePosition.x, this.position.y + relativePosition.y),
        direction: direction,
        velocity: velocity,
        damage: 1,
        delayBeforeSpawn: 20 * i
      }));
    }
  };
};
