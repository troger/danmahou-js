danmahou.level = function(spec) {
  var images = spec.images || [];
  var sounds = spec.sounds || [];
  var nextLevel = spec.nextLevel || null;

  var totalElapsed = 0;

  var that = {};
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
    images: [{ name: 'player', src: 'player.png' }, 
             { name: 'player_bullet', src: 'player_bullet.png' }, 
             { name: 'enemy1', src: 'enemy1.png' }],
    sounds: [{ name: 'vague', src: 'vague.ogg' }]
  };

  var that = danmahou.level(spec);

  that.initializeLevel = function() {
    that.enemies = [
      danmahou.enemy({
        screen: screen,
        position: danmahou.vector2(100, -100),
        direction: danmahou.vector2(0, 1),
        velocity: 0.3,
        image: 'enemy1',
        update: function(elapsed) {
          if (this.position.y < 250) {
            this.position.x += this.direction.x * this.velocity * elapsed;
            this.position.y += this.direction.y * this.velocity * elapsed;
          }
        },
        delay: 500
      }),
      danmahou.enemy({
        screen: screen,
        position: danmahou.vector2(200, -100),
        direction: danmahou.vector2(0, 1),
        velocity: 0.6,
        image: 'enemy1',
        update: function(elapsed) {
          if (this.position.y < 250) {
            this.position.x += this.direction.x * this.velocity * elapsed;
            this.position.y += this.direction.y * this.velocity * elapsed;
          }
        },
        delay: 500
      }),
      danmahou.enemy({
        screen: screen,
        position: danmahou.vector2(300, -100),
        direction: danmahou.vector2(0, 1),
        velocity: 0.3,
        image: 'enemy1',
        update: function(elapsed) {
          if (this.position.y < 250) {
            this.position.x += this.direction.x * this.velocity * elapsed;
            this.position.y += this.direction.y * this.velocity * elapsed;
          }
        },
        delay: 500
      })
    ];
  };

  return that;
};
