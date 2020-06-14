// create a new scene named "Splash"
let bootScene = new Phaser.Scene('Boot');

// load asset files for our game
bootScene.preload = function () {
    // load images
    this.load.image("ship", "assets/spaceship.png");
    this.load.image("life", "assets/healthy.png");
    this.load.image("bullet", "assets/fire-power.png");
    this.load.image("background", "assets/background.png");
    this.load.image("worm", "assets/wormhole.png");

    this.load.spritesheet("big-rock", "assets/rock-big.png", {
        frameWidth: 64, frameHeight: 64
    });
    this.load.spritesheet("medium-rock", "assets/rock-medium.png", {
        frameWidth: 32, frameHeight: 32
    });
    this.load.spritesheet("small-rock", "assets/rock-small.png", {
        frameWidth: 16, frameHeight: 16
    });
    this.load.spritesheet("boom", "assets/kaboom.png", {
        frameWidth: 96, frameHeight: 96
    });this.load.spritesheet("boom", "assets/kaboom.png", {
        frameWidth: 96, frameHeight: 96
    });
    this.load.audio('sound-of-fire', "assets/fire-sound.wav");
    this.load.audio('sound-of-boom', "assets/kaboom-sound.wav");
    this.load.audio('sound-of-attack', "assets/rock-attacked-sound.mp3");
    this.load.audio('sound-of-destroy', "assets/rock-killed-sound.wav");
    this.load.audio('sound-of-game-over', "assets/game-over.wav");
};

bootScene.create = function () {
    this.anims.create({
        key: 'rotateB', frames: this.anims.generateFrameNumbers('big-rock', { start: 0, end: 6}), frameRate: 7, repeat: -1
    });
    this.anims.create({
        key: 'rotateM', frames: this.anims.generateFrameNumbers('medium-rock', { start: 0, end: 6}), frameRate: 7, repeat: -1
    });
    this.anims.create({
        key: 'rotateS', frames: this.anims.generateFrameNumbers('small-rock', { start: 0, end: 6}), frameRate: 7, repeat: -1
    });

    this.anims.create({
        key: 'explode', frames: this.anims.generateFrameNumbers('boom', { start: 0, end: 10}), frameRate: 11
    });

    this.scene.start("Game");
}