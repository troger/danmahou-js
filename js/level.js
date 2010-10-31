danmahou.level = function(spec) {
  var images = spec.images || [];
  var sounds = spec.sounds || [];
  var nextLevel = spec.nextLevel || null;

  var totalElapsed = 0;

  var that = {};

  that.initialize = function() {
    totalElapsed = 0;
    if (typeof this.initializeLevel === 'function') {
      this.initializeLevel();
    }
  }

  that.getImages = function () {
    return images;
  };
  that.getSounds = function() {
    return sounds;
  };
  that.enemies = [];
  that.spawn = function(elapsed) {
    totalElapsed += elapsed;
    var enemies = [];
    while (that.enemies.length > 0 && that.enemies[0].delay <= totalElapsed) {
      enemies.push(that.enemies.splice(0, 1)[0]);
    }
    return enemies;
  };
  that.getNextLevel = function() {
    return nextLevel;
  };
  return that;
};

danmahou.level1 = function(screen) {
  var spec = {
    images: [
      { name: 'player', src: 'data/images/player.png' },
      { name: 'player_bullet', src: 'data/images/player_bullet.png' },
      { name: 'enemy1', src: 'data/images/enemy1.png' },
      { name: 'enemy_rectangle', src: 'data/images/enemy_rectangle.png' },
      { name: 'bullet_green', src: 'data/images/bullet_green.png' },
      { name: 'round_violet_bullet', src: 'data/images/round_violet_bullet.png' },
      { name: 'round_blue_bullet', src: 'data/images/round_blue_bullet.png' }
    ],
    sounds: [
      { name: 'stage1', src: 'data/musics/stage1.ogg' }
    ]
  };

  var that = danmahou.level(spec);

  that.initializeLevel = function() {
    that.enemies = [];
    for (var delay = 500; delay <= 500; delay += 500) {

      that.enemies.push(danmahou.enemy({
        screen: screen,
        position: danmahou.vector2(112, -100),
        direction: danmahou.vector2(0, 1),
        velocity: 0.6,
        life: 100,
        image: 'enemy1',
        collisionArea: danmahou.rect(10, 10, 44, 44),
        updateEnemy: function(elapsed) {
          if (this.position.y < 200) {
            this.position.x += this.direction.x * this.velocity * elapsed;
            this.position.y += this.direction.y * this.velocity * elapsed;
          }
        },
        shoot: danmahou.shoot({ delayBetweenShoot: 500, shootFunction: danmahou.shoots.clusterShoot({ nbBullets: 8 }) }),
        delay: delay
      }));

      that.enemies.push(danmahou.enemy({
        screen: screen,
        position: danmahou.vector2(224, -100),
        direction: danmahou.vector2(0, 1),
        velocity: 0.6,
        life: 200,
        image: 'enemy1',
        collisionArea: danmahou.rect(10, 10, 44, 44),
        updateEnemy: function(elapsed) {
          if (this.position.y < 250) {
            this.position.x += this.direction.x * this.velocity * elapsed;
            this.position.y += this.direction.y * this.velocity * elapsed;
          }
        },
        shoot: danmahou.shoot({ initialDelay: 1000, delayBetweenShoot: 300, shootFunction: danmahou.shoots.circularShoot({ nbBullets: 16, angleToAdd: 20 }) }),
        delay: delay
      }));

      that.enemies.push(danmahou.enemy({
        screen: screen,
        position: danmahou.vector2(336, -100),
        direction: danmahou.vector2(0, 1),
        velocity: 0.6,
        life: 50,
        image: 'enemy1',
        collisionArea: danmahou.rect(10, 10, 44, 44),
        updateEnemy: function(elapsed) {
          if (this.position.y < 200) {
            this.position.x += this.direction.x * this.velocity * elapsed;
            this.position.y += this.direction.y * this.velocity * elapsed;
          }
        },
        shoot: danmahou.shoot({ delayBetweenShoot: 500, shootFunction: danmahou.shoots.clusterShoot({ nbBullets: 8 }) }),
        delay: delay
      }));
    }

    that.enemies.push(danmahou.enemy({
      screen: screen,
      position: danmahou.vector2(112, -100),
      direction: danmahou.vector2(0, 1),
      velocity: 0.3,
      life: 200,
      image: 'enemy_rectangle',
      collisionArea: danmahou.rect(0, 0, 72, 144),
      updateEnemy: function(elapsed) {
        if (this.position.y < 300) {
          this.position.x += this.direction.x * this.velocity * elapsed;
          this.position.y += this.direction.y * this.velocity * elapsed;
        }
      },
      shoot: danmahou.shoot({ delayBetweenShoot: 500, shootFunction: danmahou.shoots.clusterShoot({ nbBullets: 10 }) }),
      delay: 2500
    }));

    that.enemies.push(danmahou.enemy({
      screen: screen,
      position: danmahou.vector2(336, -100),
      direction: danmahou.vector2(0, 1),
      velocity: 0.3,
      life: 200,
      image: 'enemy_rectangle',
      collisionArea: danmahou.rect(0, 0, 72, 144),
      updateEnemy: function(elapsed) {
        if (this.position.y < 300) {
          this.position.x += this.direction.x * this.velocity * elapsed;
          this.position.y += this.direction.y * this.velocity * elapsed;
        }
      },
      shoot: danmahou.shoot({ delayBetweenShoot: 500, shootFunction: danmahou.shoots.clusterShoot({ nbBullets: 10 }) }),
      delay: 2500
    }));


  };

  return that;
};

danmahou.shoots = {};
danmahou.shoots.circularShoot = function (spec) {
  var nbBullets = Number(spec.nbBullets) || 16;
  var startAngle = Number(spec.startAngle) || 0;
  var angleToAdd = Number(spec.angleToAdd) || 0;
  return function(elapsed) {
    var objectManager = this.getScreen().getObjectManager();
    var angle = 360 / nbBullets;
    var currentAngle = startAngle;
    for (var i = 0; i < nbBullets; ++i) {
      var direction = danmahou.vector2FromAngle(currentAngle);
      direction.normalize();
      objectManager.addEnemyBullet(
          danmahou.bullet({
            screen: this.getScreen(),
            image: 'round_blue_bullet',
            position: this.position.clone(),
            direction: direction,
            velocity: 0.125,
            collisionArea: danmahou.rect(5, 5, 9, 9),
            isAnimated: true,
            animationDelay: 100,
            imageSize: danmahou.size(18, 18),
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
        screen: this.getScreen(),
        image: 'round_blue_bullet',
        position: this.position.clone(),
        direction: direction,
        velocity: velocity,
        collisionArea: danmahou.rect(5, 5, 9, 9),
        isAnimated: true,
        animationDelay: 100,
        imageSize: danmahou.size(18, 18),
        damage: 1
      }));
    }
  };
};

danmahou.shoot = function(spec) {
  var shootDelay = spec.initialDelay || 0;
  return function(elapsed) {
    if (shootDelay <= 0) {
      spec.shootFunction.call(this, elapsed);
      shootDelay = spec.delayBetweenShoot;
    } else {
      shootDelay -= elapsed;
    }
  };
}
