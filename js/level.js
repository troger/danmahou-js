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
      { name: 'player', src: 'player.png' },
      { name: 'player_bullet', src: 'player_bullet.png' },
      { name: 'enemy1', src: 'enemy1.png' },
      { name: 'bullet_green', src: 'bullet_green.png' },
      { name: 'round_violet_bullet', src: 'round_violet_bullet.png' },
      { name: 'round_blue_bullet', src: 'round_blue_bullet.png' }
    ],
    sounds: [
      { name: 'vague', src: 'vague.ogg' }
    ]
  };

  var that = danmahou.level(spec);

  that.initializeLevel = function() {
    that.enemies = [];
    for (var delay = 500; delay <= 5000; delay += 500) {

      that.enemies.push(danmahou.enemy({
        screen: screen,
        position: danmahou.vector2(112, -100),
        direction: danmahou.vector2(0, 1),
        velocity: 0.6,
        life: 100,
        image: 'enemy1',
        collisionArea: danmahou.rect(10, 10, 44, 44),
        update: function(elapsed) {
          if (this.position.y < 200) {
            this.position.x += this.direction.x * this.velocity * elapsed;
            this.position.y += this.direction.y * this.velocity * elapsed;
          }
          if (typeof this.shootDelay === 'undefined') {
            this.shootDelay = 0;
          }
          if (this.shootDelay <= 0) {

            var objectManager = screen.getObjectManager();

            var angle = 360 / 16;
            var currentAngle = 0;

            for (var i = 0; i < 16; ++i) {
              var direction = danmahou.vector2FromAngle(currentAngle);
              direction.normalize();
              objectManager.addEnemyBullet(
                  danmahou.bullet({
                    screen: screen,
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
            this.shootDelay = 1000;
          } else {
            this.shootDelay -= elapsed;
          }
        },
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
        update: function(elapsed) {
          if (this.position.y < 250) {
            this.position.x += this.direction.x * this.velocity * elapsed;
            this.position.y += this.direction.y * this.velocity * elapsed;
          }
          if (typeof this.shootDelay === 'undefined') {
            this.shootDelay = 0;
          }
          if (this.shootDelay <= 0) {

            var objectManager = screen.getObjectManager();

            var angle = 360 / 16;
            var currentAngle = 0;

            for (var i = 0; i < 16; ++i) {
              var direction = danmahou.vector2FromAngle(currentAngle);
              direction.normalize();
              objectManager.addEnemyBullet(
                  danmahou.bullet({
                    screen: screen,
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
            this.shootDelay = 1000;
          } else {
            this.shootDelay -= elapsed;
          }
        },
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
        update: function(elapsed) {
          if (this.position.y < 200) {
            this.position.x += this.direction.x * this.velocity * elapsed;
            this.position.y += this.direction.y * this.velocity * elapsed;
          }
          if (typeof this.shootDelay === 'undefined') {
            this.shootDelay = 0;
          }
          if (this.shootDelay <= 0) {

            var objectManager = screen.getObjectManager();

            var angle = 360 / 16;
            var currentAngle = 0;

            for (var i = 0; i < 16; ++i) {
              var direction = danmahou.vector2FromAngle(currentAngle);
              direction.normalize();
              objectManager.addEnemyBullet(
                  danmahou.bullet({
                    screen: screen,
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
            this.shootDelay = 1000;
          } else {
            this.shootDelay -= elapsed;
          }
        },
        delay: delay
      }));
    }
  };

  return that;
};
