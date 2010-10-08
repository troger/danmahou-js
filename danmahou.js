Array.prototype.contains = function(elem) {
    for (var i = 0; i < this.length; i++) {
	if (this[i] == elem) {
	    return true;
	}
    }
    return false;
};

danmahou = {};

// Utility methods
danmahou.create = function (elementName) {
    return document.createElement(elementName);
};

danmahou.now = function() {
    return Date.now();
};

danmahou.stopEvent = function(e) {
    e.cancelBubble = true;
    e.stopPropagation();
    e.preventDefault();
};

// Context corrected functions
danmahou.on = function(eventName, fn, target, context) {
    target.addEventListener(eventName, function(e) {
	fn.call(context, e);
    }, false);
};

danmahou.setInterval = function(fn, when, context) {
    return window.setInterval(function() {
	fn.call(context);
    }, when);
};

danmahou.drawText = function(spec) {
    var ctx = spec.ctx;
    ctx.save();

    var align = spec.align || 'center';
    var color = spec.color || 'white';
    var x = spec.x || 0;
    var y = spec.y || 0;
    var size = spec.size || 12;
    ctx.font = "bold " + size + "px Arial";
    ctx.textAlign = align;
    ctx.fillStyle = color;
    ctx.fillText(spec.text, x, y);

    ctx.restore();
};

// Vector2
danmahou.vector2 = function(x, y) {
    var that = {};
    that.x = Number(x) || 0;
    that.y = Number(y) || 0;
    return that;
};

// Size
danmahou.size = function(width, height) {
    return { width: width, height: height };
};

// Resources loading
danmahou.resourcesLoader = function() {
    var images = {};
    var sounds = {};

    var that = {};
    that.getImage = function(name) {
	return images[name];
    };
    that.getSound = function(name) {
	return sounds[name];
    };

    that.loadResources = function(spec) {
	var imagesToLoad = spec.images || [];
	var soundsToLoad = spec.sounds || [];
	var totalResourcesCount = imagesToLoad.length + soundsToLoad.length;
	var loadedResourcesCount = 0;
	
	var loader = {};
	loader.getTotalResourcesCount = function() {
	    return totalResourcesCount;
	};
	loader.getLoadedResourcesCount = function() {
	    return loadedResourcesCount;
	};
	loader.load = function() {
	    for (var index = 0; index < imagesToLoad.length; index++) {
		var image = imagesToLoad[index];
		images[image.name] = new Image();
		danmahou.on('load', this.handleResourceLoaded, images[image.name], this);
		images[image.name].src = image.src;
	    }
	    for (var index = 0; index < soundsToLoad.length; index++) {
		var sound = soundsToLoad[index];
		sounds[sound.name] = new Audio();
		danmahou.on('canplaythrough', this.handleResourceLoaded, sounds[sound.name], this);

		sounds[sound.name].autobuffer = true;
		sounds[sound.name].preload = 'auto';
		sounds[sound.name].src = sound.src;
		sounds[sound.name].load();
	    }
	}
	loader.handleResourceLoaded = function(e) {
	    loadedResourcesCount++;
	    if (spec.onResourceLoaded) {
		spec.onResourceLoaded.apply(spec.context, [e.target]);
	    }
	    if(loadedResourcesCount == totalResourcesCount) {
		spec.onCompleteLoading.call(spec.context);
	    }
	};

	loader.load();
	return loader;
    };

    that.clear = function () {
	images = {};
	sounds = {};
    };
    return that;
};
// Keyboard
danmahou.keys = {
    KEY_LEFT: 37,
    KEY_UP: 38,
    KEY_RIGHT: 39,
    KEY_DOWN: 40,
    KEY_Z: 90,
  
    KEY_SPACE: 32,
    KEY_ENTER: 13,
    KEY_SHIFT: 16
};

danmahou.keyboard = function(gameKeys) {
    var keyStates = {};
    var lastKeyStates = {};
    gameKeys = gameKeys || [];

    // register events
    danmahou.on('keydown', function(e) {
	keyStates[e.keyCode] = true;
	suppressKeyEvent(e);
    }, window, this);
    danmahou.on('keyup', function(e) {
	keyStates[e.keyCode] = false;
	suppressKeyEvent(e);
    }, window, this);

    // suppress key event if needed
    var suppressKeyEvent = function(e) {
	if (gameKeys.length === 0 || gameKeys.contains(e.keyCode)) {
	    danmahou.stopEvent(e);
	}
    };

    var that = {};
    that.isKeyDown = function(keyCode) {
	return keyStates[keyCode] === true;
    };
    that.isKeyPressed = function(keyCode) {
	return keyStates[keyCode] === true && lastKeyStates[keyCode] !== true;
    };
    that.saveKeyStates = function() {
	for (var keyCode in keyStates) {
	    lastKeyStates[keyCode] = keyStates[keyCode];
	}
    };
    return that;
};

// Game
danmahou.game = function(spec) {
    var canvas = null;
    var ctx = null;

    var interval = null;
    var lastUpdate = 0;

    var currentScreen = null;

    var keyboard = danmahou.keyboard(spec.gameKeys);

    var that = {};
    that.getScreenSize = function() {
	return spec.screenSize;
    };
    that.getKeyboard = function() {
	return keyboard;
    };

    that.init = function() {
	canvas = danmahou.create('canvas');
	canvas.width = spec.screenSize.width;
	canvas.height = spec.screenSize.height;
	ctx = canvas.getContext('2d');
	document.body.appendChild(canvas);

	currentScreen = danmahou.mainMenuScreen(this);
    };
    that.run = function() {
	this.init();
	lastUpdate = danmahou.now();
	interval = danmahou.setInterval(this.updateAndRender, 0, this);
    };
    that.updateAndRender = function() {
	var now = danmahou.now();
	var elapsed = (now - lastUpdate);
	lastUpdate = now;

	if (currentScreen) {
	    currentScreen.update(elapsed);
	    currentScreen.render(ctx);
	}

	// save this frame key states
	keyboard.saveKeyStates();
    };
    that.changeScreen = function(screen) {
	currentScreen = screen;
    };

    return that;
};

danmahou.danmahouGame = function() {
    var game = danmahou.game({ screenSize: danmahou.size(450, 600), 
			       gameKeys: [danmahou.keys.KEY_UP, danmahou.keys.KEY_DOWN, danmahou.keys.KEY_RIGHT, danmahou.keys.KEY_LEFT, danmahou.keys.KEY_SHIFT, danmahou.keys.KEY_ENTER] });
    return game;
};

// Screens
danmahou.screen = function(game) {
    var resourcesLoader = danmahou.resourcesLoader();
    var objectManager = danmahou.objectManager();

    var that = {};
    that.getGame = function() {
	return game;
    };
    that.getResourcesLoader = function() {
	return resourcesLoader;
    };
    that.getObjectManager = function() {
	return objectManager;
    };
    that.update = function(elapsed) {
    };
    that.render = function(ctx) {
    };
    return that;
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
	var velocity = 0.4;
	var moveX = 0, moveY = 0;
	if (keyboard.isKeyDown(danmahou.keys.KEY_SHIFT)) {
	    velocity = 0.15;
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
	objectManager.addPlayerBullet(
	    danmahou.playerBullet({
		screen: spec.screen,
		position: danmahou.vector2(this.position.x, this.position.y),
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
    };

    return danmahou.visualObject(that, { game: game, screen: spec.screen, image: 'player_bullet' });
};

// Sound
danmahou.sound = function(spec) {
    var screen = spec.screen;

    var sound = screen.getResourcesLoader().getSound(spec.name);

    // should we loop?
    var loop = spec.loop || false;
    if(loop) {
	sound.addEventListener('ended', sound.play, false);
    }

    // the final Sound object
    var that = {}
    that.play = function() {
	sound.play();
    };
    that.pause = function() {
	sound.pause();
    };
    that.stop = function() {
	sound.pause();
	sound.currentTime = 0;
    };
    return that;
};
