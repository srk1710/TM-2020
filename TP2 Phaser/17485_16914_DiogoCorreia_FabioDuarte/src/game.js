// create a new scene named "Game"
let gameScene = new Phaser.Scene('Game');

// some parameters for our scene (our own customer variables - these are NOT part of the Phaser API)
gameScene.init = function () {
};

// load asset files for our game
gameScene.preload = function () {
    // load images
};

// executed once, after assets were loaded
gameScene.create = function () {
    this.smallFontsStyle = {font: "36px Arial", fill: "#FFF"};
    this.largeFontsStyle = {font: "96px Arial", fill: "#FFF"};

    this.background = this.add.tileSprite(0, 0, this.sys.game.config.width, this.sys.game.config.height, 'background');
    this.background.setOrigin(0, 0);

    this.wormhole = this.physics.add.image(500, 500, 'worm');
    this.wormholeIntegrityMaxValue = 100;
    this.wormholeIntegrityNow = this.wormholeIntegrityMaxValue;

    this.player = this.physics.add.image(500, 500, 'ship');
    this.player.useDamping = true;
    this.player.setDrag(0.99);
    this.player.setMaxVelocity(200);
    this.inputs = this.input.keyboard.createCursorKeys();
    this.myFire = true;
    this.playerIsDead = false;
    this.playerMaxLife = 3;
    this.playerCurrentLife = 3;
    this.playerCanTakeDmg = true;
    this.score = 0;

    this.fireTimer = this.time.addEvent({
        delay: 200,
        callback: this.canYouFire,
        callbackScope: this,
        loop: true
    });
    this.myFireEvent = this.physics.add.overlap(this.player, this.wormhole, (player, wormhole) => this.myFire = false, null, this);

    this.lifes = this.add.group({
        key: 'life', repeat: this.playerCurrentLife - 1,
        setXY: {
            x: 890, y: 30, stepX: 40
        }
    });

    this.bullets = this.physics.add.group({
        key: 'bullet', repeat: 30,
        active: false,
        max: -1
    });
    this.bullets.enableBody = true;

    this.theBigRocks = this.physics.add.group({max: 10});
    this.theBigRocks.enableBody = true;

    this.spawnTimer = this.time.addEvent({
        delay: 2000,
        callback: this.spawnMyRocks,
        callbackScope: this,
        loop: true
    });
    this.physics.add.overlap(this.bullets, this.theBigRocks, this.bigRockAttacked, null, this);
    this.physics.add.overlap(this.player, this.theBigRocks, this.playerGotAttacked, null, this);

    this.physics.add.overlap(this.theBigRocks, this.wormhole, this.wormAttackedByBigRock, null, this);

    this.theMediumRocks = this.physics.add.group();
    this.theMediumRocks.enableBody = true;
    this.physics.add.overlap(this.bullets, this.theMediumRocks, this.mediumRockAttacked, null, this);
    this.physics.add.overlap(this.player, this.theMediumRocks, this.playerGotAttacked, null, this);

    this.physics.add.overlap(this.theMediumRocks, this.wormhole, this.wormAttackedByMediumRock, null, this);

    this.theSmallRocks = this.physics.add.group();
    this.theSmallRocks.enableBody = true;
    this.physics.add.overlap(this.bullets, this.theSmallRocks, this.smallRockAttacked, null, this);
    this.physics.add.overlap(this.player, this.theSmallRocks, this.playerGotAttacked, null, this);

    this.physics.add.overlap(this.theSmallRocks, this.wormhole, this.wormAttackedBySmallRock, null, this);

    this.explosions = this.add.group();
    this.explosions.createMultiple(30, "explosion");

    this.textIntegrity = this.add.text(10, 10, "Portal Integrity:", this.smallFontsStyle);
    this.textIntegrityValue = this.add.text(270, 10, this.wormholeIntegrityNow + "%", this.smallFontsStyle);
    this.textLife = this.add.text(800, 10, "Life:", this.smallFontsStyle);
    this.textScores = this.add.text(420, 630, "Score:", this.smallFontsStyle);
    this.textScoresValue = this.add.text(540, 630, this.score + "%", this.smallFontsStyle);
    this.textGameOver = this.add.text(500, 500, "GAME OVER!", this.largeFontsStyle);
    this.textGameOver.setOrigin(0.5, 0.5);
    this.textGameOver.updateText();
    this.textGameOver.visible = false;
};


// executed on every frame (60 times per second)
gameScene.update = function () {
    if (!this.myFireEvent) {
        this.myFire = false;
    }

    this.textIntegrityValue.setText(this.wormholeIntegrityNow + "%");
    this.textScoresValue.setText(this.score);
    this.background.tilePositionX += 0.1;
    this.bullets.children.iterate(this.limitBulletsToScreen);
    this.theBigRocks.children.iterate(this.wrappingTheScreen);
    this.theMediumRocks.children.iterate(this.wrappingTheScreen);
    this.theSmallRocks.children.iterate(this.wrappingTheScreen);
    this.wrappingTheScreen(this.player);

    this.wormhole.angle += 0.05;

    if (this.playerCurrentLife <= 0) {
        this.startGameOver();
    }

    if (this.playerIsDead) {

    }

    if (this.inputs.up.isDown) {
        this.physics.velocityFromRotation(this.player.rotation, 200, this.player.body.acceleration);
    } else {
        this.player.setAcceleration(0);
    }

    if (this.inputs.left.isDown) {
        this.player.setAngularVelocity(-300);
    } else if (this.inputs.right.isDown) {
        this.player.setAngularVelocity(300);
    } else {
        this.player.setAngularVelocity(0);
    }

    if (this.inputs.space.isDown) {
        this.shootMyBullets();
    }

};

gameScene.shootMyBullets = function () {
    if (this.myFire && !this.playerIsDead) {
        var bullet = this.bullets.getFirstDead();
        if (bullet) {
            bullet.active = true;
            bullet.rotation = this.player.rotation;
            bullet.body.x = this.player.x;
            bullet.body.y = this.player.y;
            bullet.body.setVelocityX(Math.cos(this.player.rotation) * 400);
            bullet.body.setVelocityY(Math.sin(this.player.rotation) * 400);
            this.myFire = false;
            this.sound.play("sound-of-fire");
        }
    }
};

gameScene.canYouFire = function () {
    this.myFire = true;
};

gameScene.wrappingTheScreen = function (sprite) {
    if (sprite.body.x < 0) {
        sprite.body.x = 1000;
    } else if (sprite.body.x > 1000) {
        sprite.body.x = 0;
    }

    if (sprite.body.y < 0) {
        sprite.body.y = 1000;
    } else if (sprite.body.y > 1000) {
        sprite.body.y = 0;
    }
}

gameScene.spawnMyRocks = function () {
    var rock;
    if (Phaser.Math.Between(0, 1) === 0 && this.theBigRocks.getTotalFree() !== 0) {
        rock = new Rock(this, Phaser.Math.Between(0, 1) * 1000, Phaser.Math.Between(0, 1000))
    } else {
        rock = new Rock(this, Phaser.Math.Between(0, 1) * 1000, Phaser.Math.Between(0, 1000))
    }
    this.theBigRocks.add(rock);
    rock.body.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
}

gameScene.playerGotAttacked = function () {
    if (this.playerCanTakeDmg) {
        this.sound.play("sound-of-attack");
        this.lifes.getChildren()[this.playerCurrentLife - 1].visible = false;
        this.cameras.main.shake(25);
        this.playerCurrentLife--;
        this.playerCanTakeDmg = false;
        this.dmgTime = this.time.addEvent({
            delay: 1000,
            callback: this.resetMyLifes,
            callbackScope: this,
            loop: false
        });
    }
}

gameScene.resetMyLifes = function () {
    this.playerCanTakeDmg = true;
}

gameScene.bigRockAttacked = function (bullet, rock) {
    if (bullet.active) {
        this.theBigRocks.remove(rock);
        bullet.active = false;
        this.sound.play("sound-of-boom");
        var explosion = this.explosions.getFirstDead(true, rock.x, rock.y, "explosion");
        explosion.play("explode");
        explosion.on('animationcomplete', () => {
            explosion.destroy();
        });
        var newrock1 = this.theMediumRocks.create(rock.x, rock.y, 'medium-rock');
        var newrock2 = this.theMediumRocks.create(rock.x, rock.y, 'medium-rock');
        newrock1.play('rotateM');
        newrock2.play('rotateM');
        var point1 = new Phaser.Geom.Point(rock.body.velocity.x, rock.body.velocity.y);
        var point2 = new Phaser.Geom.Point(rock.body.velocity.x, rock.body.velocity.y);
        var rot1 = Phaser.Math.Rotate(point1, -3.1415 / 4);
        var rot2 = Phaser.Math.Rotate(point2, 3.1415 / 4);
        newrock1.body.setVelocity(rot1.x, rot1.y);
        newrock2.body.setVelocity(rot2.x, rot2.y);
        rock.destroy();

        this.score += 200;
    }
}

gameScene.mediumRockAttacked = function (bullet, rock) {
    if (bullet.active && rock !== null) {
        this.theMediumRocks.remove(rock);
        bullet.active = false;
        this.sound.play("sound-of-boom");
        const explosion = this.explosions.getFirstDead(true, rock.x, rock.y, "explosion");
        explosion.play("explode");
        explosion.on('animationcomplete', () => {
            explosion.destroy();
        });
        const newrock1 = this.theSmallRocks.create(rock.x, rock.y, 'small-rock');
        const newrock2 = this.theSmallRocks.create(rock.x, rock.y, 'small-rock');
        newrock1.play('rotateS');
        newrock2.play('rotateS');
        const point1 = new Phaser.Geom.Point(rock.body.velocity.x, rock.body.velocity.y);
        const point2 = new Phaser.Geom.Point(rock.body.velocity.x, rock.body.velocity.y);
        const rot1 = Phaser.Math.Rotate(point1, -3.1415 / 4);
        const rot2 = Phaser.Math.Rotate(point2, 3.1415 / 4);
        newrock1.body.setVelocity(rot1.x, rot1.y);
        newrock2.body.setVelocity(rot2.x, rot2.y);
        rock.destroy();

        this.score += 400;
    }
}

gameScene.smallRockAttacked = function (bullet, rock) {
    if (bullet.active && rock !== null) {
        this.theMediumRocks.remove(rock);
        bullet.active = false;
        this.sound.play("sound-of-boom");
        var explosion = this.explosions.getFirstDead(true, rock.x, rock.y, "explosion");
        explosion.play("explode");
        explosion.on('animationcomplete', () => {
            explosion.destroy();
        });
        rock.destroy();

        this.score += 800;
    }
}

gameScene.limitBulletsToScreen = function (bullet) {
    if (bullet.active && (bullet.body.x > 1000 || bullet.body.x < 0 || bullet.body.y > 1000 || bullet.body.y < 0))
        bullet.active = false;
}

gameScene.wormAttackedByBigRock = function (wormhole, rock) {
    if (rock != null && wormhole != null) {
        this.wormholeIntegrityNow-= 3;
        this.sound.play("sound-of-boom");
        var explosion = this.explosions.getFirstDead(true, rock.x, rock.y, "explosion");
        explosion.play("explode");
        explosion.on('animationcomplete', () => {
            explosion.destroy();
        });
        rock.destroy();
        this.cameras.main.shake(50);
    }
}

gameScene.wormAttackedBySmallRock = function (wormhole, rock) {
    if (rock != null && wormhole != null) {
        this.wormholeIntegrityNow -= 1;
        this.sound.play("sound-of-boom");
        var explosion = this.explosions.getFirstDead(true, rock.x, rock.y, "explosion");
        explosion.play("explode");
        explosion.on('animationcomplete', () => {
            explosion.destroy();
        });
        rock.destroy();
        this.cameras.main.shake(75);
    }
}

gameScene.wormAttackedByMediumRock = function (wormhole, rock) {
    if (rock != null && wormhole != null) {
        this.wormholeIntegrityNow -= 2;
        this.sound.play("sound-of-boom");
        var explosion = this.explosions.getFirstDead(true, rock.x, rock.y, "explosion");
        explosion.play("explode");
        explosion.on('animationcomplete', () => {
            explosion.destroy();
        });
        rock.destroy();
        this.cameras.main.shake(100);
    }
}

gameScene.startGameOver = function () {
    this.textGameOver.visible = true;
    this.playerIsDead = true;
    this.sound.play("sound-of-destroy");
    var explosion = this.explosions.getFirstDead(true, this.player.x, this.player.y, "explosion");
    var sound = explosion.play("explode");
    explosion.on('animationcomplete', () => {
        explosion.destroy();
    });
    this.player.disableBody(true, true);
    this.playerCurrentLife = this.playerMaxLife;
    var respTimer = this.time.addEvent({
        delay: 2000,
        callback: this.gameOver,
        callbackScope: this,
        loop: false
    });
};

gameScene.gameOver = function () {
    this.textGameOver.visible = false;
    this.sound.play("sound-of-game-over");
    this.lifes.children.iterate((child) => child.visible = true);
    this.player.enableBody(true, 500, 500);
    this.player.visible = true;
    this.player.active = true;
    this.wormholeIntegrityNow = 100;
    this.score = 0;
    this.playerIsDead = false;
};

// our game's configuration
let config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 1000,
    height: 1000,
    autoresize: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            debug: false
        }
    },
    scene: [
        bootScene, gameScene
    ]
};

// create the game, and pass it the configuration
let game = new Phaser.Game(config);
