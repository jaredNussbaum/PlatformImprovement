class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        this.won = false;
        this.goal = 66; //66
        this.gathered = 0;
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 800;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.jumpCharge = 2;
        this.text = {};
    }

    create() {
        this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
        this.physics.world.debugGraphic.clear()
        this.won = false;
        this.add.image(400, 200, "sky");
        this.add.image(1200, 200, "sky");
        this.add.image(400, 600, "sky");
        this.add.image(1200, 600, "sky");
        this.add.image(2000, 200, "sky");
        this.add.image(2000, 600, "sky");

        this.jumpCharge = 2;
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 110, 25);
        this.gathered = 0;
        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

          this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 44
        });

``
        

            // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);
        

        // set up player avatar
        this.physics.world.setBounds(0, 0, 1980, 450)
        my.sprite.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0000.png");

        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

           // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            this.gathered += 1;
            if (my.vfx.coins){
                my.vfx.coins.stop();
            }
            
            my.vfx.coins = this.add.particles(obj2.x, obj2.y, "kenny-particles", {
                frame: ["symbol_01.png"],
                lifespan: 500,
                speed: { min: 100, max: 200 },
                angle: { min: 0, max: 360 },
                gravityY: 300,
                scale: { start: 0.2, end: 0 },
            //alpha: { start: 1, end: 0 },
            //quantity: 10,
                on: false // Not emitting by default
        });
        this.time.delayedCall(140, () => {
            my.vfx.coins.stop();
        });
        this.sound.play("twinkle");
        obj2.destroy(); // remove coin on overlap
        });
        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

         my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['symbol_02.png', 'symbol_01.png'],
            // TODO: Try: add random: true
            scale: {start: 0.03, end: 0.1},
            maxAliveParticles: 8,
            lifespan: 350,
            // TODO: Try: gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();
        

        this.cameras.main.setBounds(0, 0, 1980, 450);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(40, 40);
        this.cameras.main.setZoom(this.SCALE * 2);
        

    }

    update() {
        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
        if (this.gathered == this.goal && !this.won){
            this.physics.pause();
            this.text.text1 = this.add.text(this.cameras.main.midPoint.x,  this.cameras.main.midPoint.x - 80, 'Game Over!', {
                fontSize: '18px',
                fill: '#ff0000',
                outline : '000000'
            }).setOrigin(0.5);
            this.physics.pause();
            this.text.text2 = this.add.text(this.cameras.main.midPoint.x,  this.cameras.main.midPoint.x - 60, 'All Hearts Collected!', {
                    fontSize: '18px',
                    fill: '#ffffff',
                    outline : '000000'
                }).setOrigin(0.5);
            this.text.text3 = this.add.text(this.cameras.main.midPoint.x,  this.cameras.main.midPoint.x - 40, 'Press R to restart!', {
                    fontSize: '18px',
                    fill: '#ff0000',
                    outline : '000000'
                }).setOrigin(0.5);
            this.won = true;
        }
        if (this.text.text1){
            this.text.text1.x = this.cameras.main.midPoint.x
            this.text.text1.y = this.cameras.main.midPoint.y - 80

        }
        if (this.text.text2){
            this.text.text2.x = this.cameras.main.midPoint.x
            this.text.text2.y = this.cameras.main.midPoint.y - 60

        }
        if (this.text.text3){
            this.text.text3.x = this.cameras.main.midPoint.x
            this.text.text3.y = this.cameras.main.midPoint.y - 40

        }
        
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
            

        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
            my.vfx.jumping = this.add.particles(my.sprite.player.x, my.sprite.player.y + 20, "kenny-particles", {
                frame: ['symbol_02.png'],
                // TODO: Try: add random: true
                scale: {start: 0.06, end: 0.2},
                maxAliveParticles: 8,
                lifespan: 350,
                // TODO: Try: gravityY: -400,
                alpha: {start: 1, end: 0.1}, 
            });
            my.vfx.jumping.explode(1);
        }
        else{
            this.jumpCharge = 2;
        }
        if(this.jumpCharge > 0 && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.jumpCharge -= 1;
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}
