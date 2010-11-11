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
  };

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
      { name: 'player_bullet_hit', src: 'data/images/player_bullet_hit.png' },
      { name: 'enemy1', src: 'data/images/enemy1.png' },
      { name: 'enemy_rectangle', src: 'data/images/enemy_rectangle.png' },
      { name: 'round_violet_bullet', src: 'data/images/round_violet_bullet.png' },
      { name: 'round_blue_bullet', src: 'data/images/round_blue_bullet.png' },
      { name: 'blue_bullet', src: 'data/images/blue_bullet.png' },
      { name: 'boss1', src: 'data/images/boss1.png' }
    ],
    sounds: [
      { name: 'stage1', src: 'data/musics/stage1.ogg' },
      { name: 'player_shoot', src: 'data/sounds/player_shoot.wav' }
    ],
    nextLevel: danmahou.level2
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
        life: 50,
        sprite: danmahou.sprites.enemy1,
        updateEnemy: function(elapsed) {
          if (this.position.y < 200) {
            this.position.x += this.direction.x * this.velocity * elapsed;
            this.position.y += this.direction.y * this.velocity * elapsed;
          }
        },
        shoot: danmahou.shoot({ delayBetweenShoot: 500, shootFunctions: [danmahou.shoots.clusterShoot({ nbBullets: 8 })] }),
        delay: delay
      }));

      that.enemies.push(danmahou.enemy({
        screen: screen,
        position: danmahou.vector2(224, -100),
        direction: danmahou.vector2(0, 1),
        velocity: 0.6,
        life: 100,
        sprite: danmahou.sprites.enemy1,
        updateEnemy: function(elapsed) {
          if (this.position.y < 250) {
            this.position.x += this.direction.x * this.velocity * elapsed;
            this.position.y += this.direction.y * this.velocity * elapsed;
          }
        },
        shoot: danmahou.shoot({ initialDelay: 1000, delayBetweenShoot: 300, shootFunctions: [danmahou.shoots.circularShoot({ nbBullets: 16, angleToAdd: 20 })] }),
        delay: delay
      }));

      that.enemies.push(danmahou.enemy({
        screen: screen,
        position: danmahou.vector2(336, -100),
        direction: danmahou.vector2(0, 1),
        velocity: 0.6,
        life: 50,
        sprite: danmahou.sprites.enemy1,
        updateEnemy: function(elapsed) {
          if (this.position.y < 200) {
            this.position.x += this.direction.x * this.velocity * elapsed;
            this.position.y += this.direction.y * this.velocity * elapsed;
          }
        },
        shoot: danmahou.shoot({ delayBetweenShoot: 500, shootFunctions: [danmahou.shoots.clusterShoot({ nbBullets: 8 })] }),
        delay: delay
      }));
    }

    that.enemies.push(danmahou.enemy({
      screen: screen,
      position: danmahou.vector2(112, -100),
      direction: danmahou.vector2(0, 1),
      velocity: 0.3,
      life: 200,
      sprite: danmahou.sprites.enemyRectangle,
      updateEnemy: function(elapsed) {
        if (this.position.y < 300) {
          this.position.x += this.direction.x * this.velocity * elapsed;
          this.position.y += this.direction.y * this.velocity * elapsed;
        }
      },
      shoot: danmahou.shoot({
        delayBetweenShoot: 500,
        shootFunctions: [danmahou.shoots.straightShoot({ relativePosition: danmahou.vector2(-26, 20), towardPlayer: true }),
          danmahou.shoots.straightShoot({ relativePosition: danmahou.vector2(26, 20), towardPlayer: true })]
      }),
      delay: 5000
    }));

    that.enemies.push(danmahou.enemy({
      screen: screen,
      position: danmahou.vector2(336, -100),
      direction: danmahou.vector2(0, 1),
      velocity: 0.3,
      life: 200,
      sprite: danmahou.sprites.enemyRectangle,
      updateEnemy: function(elapsed) {
        if (this.position.y < 300) {
          this.position.x += this.direction.x * this.velocity * elapsed;
          this.position.y += this.direction.y * this.velocity * elapsed;
        }
      },
      shoot: danmahou.shoot({
        delayBetweenShoot: 500,
        shootFunctions: [danmahou.shoots.straightShoot({ relativePosition: danmahou.vector2(-26, 20), towardPlayer: true }),
          danmahou.shoots.straightShoot({ relativePosition: danmahou.vector2(26, 20), towardPlayer: true })]
      }),
      delay: 5000
    }));

    that.enemies.push(danmahou.boss1(screen));

  };

  return that;
};

danmahou.boss1 = function(screen) {
  var bossShoot = 0;
  var lifeBarDisplayed = false;

  var boss = danmahou.enemy({
      screen: screen,
      position: danmahou.vector2(225, -100),
      direction: danmahou.vector2(0, 1),
      velocity: 0.3,
      life: 10000,
      sprite: danmahou.sprites.boss1,
      updateEnemy: function(elapsed) {
        var objectManager = screen.getObjectManager(),
            pendingChildren,
            children;

        if (lifeBarDisplayed === false) {
          lifeBarDisplayed = true;
          objectManager.addHud(danmahou.hud.lifeBar({ screen: screen,  maxLife: this.life, forObject: this}));
        }

        if (this.position.y < 150) {
          this.position.x += this.direction.x * this.velocity * elapsed;
          this.position.y += this.direction.y * this.velocity * elapsed;
        }

        if (this.life < 8000 && bossShoot < 1) {
          children = objectManager.getChildObjects(this);
          children.forEach(function(o) {
            o.dead = true;
            objectManager.addItems(danmahou.bulletHit({
              screen: screen,
              sprite: danmahou.sprites.playerBulletHit,
              displayTime: 500,
              position: o.position.clone() }));
          });

          pendingChildren = objectManager.getPendingChildObjects(this);
          pendingChildren.forEach(function(o) {
            o.dead = true;
          });

          bossShoot = 1;
          this.shoot = danmahou.shoot({
            delayBetweenShoot: 1000,
            shootFunctions: [danmahou.shoots.straightShoot({ nbBullets: 10, timeBetweenShoot: 75, relativePosition: danmahou.vector2(-100, 0)}),
              danmahou.shoots.straightShoot({ nbBullets: 10, timeBetweenShoot: 75, relativePosition: danmahou.vector2(100, 0)}),
              danmahou.shoots.straightShoot({ nbBullets: 10, timeBetweenShoot: 75, relativePosition: danmahou.vector2(-50, 0)}),
              danmahou.shoots.straightShoot({ nbBullets: 10, timeBetweenShoot: 75, relativePosition: danmahou.vector2(50, 0)})]});
        }
        if (this.life < 6000 && bossShoot < 2) {
          children = objectManager.getChildObjects(this);
          children.forEach(function(o) {
            o.dead = true;
            objectManager.addItems(danmahou.bulletHit({
              screen: screen,
              sprite: danmahou.sprites.playerBulletHit,
              displayTime: 500,
              position: o.position.clone() }));
          });
          pendingChildren = objectManager.getPendingChildObjects(this);
          pendingChildren.forEach(function(o) {
            o.dead = true;
          });

          bossShoot = 2;
          this.shoot =   danmahou.shoot({
            delayBetweenShoot: 500,
            shootFunctions: [danmahou.shoots.clusterShoot({ nbBullets: 16, velocityInterval: [0.20, 0.40] })]});
        }

        if (this.life < 4000 && bossShoot < 3) {
          children = objectManager.getChildObjects(this);
          children.forEach(function(o) {
            o.dead = true;
            objectManager.addItems(danmahou.bulletHit({
              screen: screen,
              sprite: danmahou.sprites.playerBulletHit,
              displayTime: 500,
              position: o.position.clone() }));
          });
          pendingChildren = objectManager.getPendingChildObjects(this);
          pendingChildren.forEach(function(o) {
            o.dead = true;
          });

          bossShoot = 3;
          this.shoot =   danmahou.shoot({
            delayBetweenShoot: 150,
            shootFunctions: [danmahou.shoots.circularShoot({ nbBullets: 15, angleToAdd: 10, relativePosition: danmahou.vector2(100, 0) }),
              danmahou.shoots.circularShoot({ nbBullets: 15, angleToAdd: 10, relativePosition: danmahou.vector2(-100, 0) })]});
        }

        if (this.life < 2000 && bossShoot < 4) {
          children = objectManager.getChildObjects(this);
          children.forEach(function(o) {
            o.dead = true;
            objectManager.addItems(danmahou.bulletHit({
              screen: screen,
              sprite: danmahou.sprites.playerBulletHit,
              displayTime: 500,
              position: o.position.clone() }));
          });
          pendingChildren = objectManager.getPendingChildObjects(this);
          pendingChildren.forEach(function(o) {
            o.dead = true;
          });

          bossShoot = 4;
          this.shoot =   danmahou.shoot({
            delayBetweenShoot: 100,
            shootFunctions: [danmahou.shoots.circularShoot({ nbBullets: 20, angleToAdd: 15 })]});
        }
      },
      shoot: danmahou.shoot({
        delayBetweenShoot: 4000,
        shootFunctions: [danmahou.shoots.bossShoot()]
      }),
      delay: 10000
  });

  var oldHandleCollision = boss.handleCollision;
  boss.handleCollision = function(otherObject) {
    oldHandleCollision.call(this, otherObject);

    if (this.dead) {
      var objectManager = screen.getObjectManager();
      var children = objectManager.getChildObjects(this);
      children.forEach(function(o) {
        o.dead = true;
        objectManager.addItems(danmahou.bulletHit({
          screen: screen,
          sprite: danmahou.sprites.playerBulletHit,
          displayTime: 500,
          position: o.position.clone() }));
      });
      var pendingChildren = objectManager.getPendingChildObjects(this);
      pendingChildren.forEach(function(o) {
        o.dead = true;
      });
    }
  };

  return boss;
};

danmahou.hud = {};
danmahou.hud.lifeBar = function(spec) {
  var that = danmahou.object(spec);

  var lifeBarWidth = game.getScreenSize().width - 10;
  var lifeBarHeight = 20;
  that.render = function(ctx) {
    var currentLifeBarWidth = lifeBarWidth * spec.forObject.life / spec.maxLife;
    ctx.save();
    ctx.fillStyle = "red";
    ctx.fillRect(5, 5, lifeBarWidth, lifeBarHeight);
    ctx.fillStyle = "green";
    ctx.fillRect(5, 5, currentLifeBarWidth, lifeBarHeight);
    ctx.restore();
  };
  return that;
};
