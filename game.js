Quintus.MyAI = function(Q) {
    Q.component("myAI", {
        added: function(p) {
            this.on("bump.left", this, "jumpLeft");
            this.on("bump.right", this, "jumpRight");
            this.entity.on("step", this, "maybeFireWeapon");
        },
        destroyed: function() {
            this.off("bump.left");
            this.off("bump.right");
            this.entity.off("step", this, "maybeFireWeapon");
        },
        maybeFireWeapon: function() {
            var rn = Math.random() * 10;
            if( rn < 0.5 ) {
                this.entity.fireWeapon();
            }
        },
        jump: function(collision) {
            this.p.vy -= 300;
        },
        jumpLeft: function(collision) {
            if( this.p.vx > 0 && this.p.vy == 0 ) { this.jump(collision); }
        },
        jumpRight: function(collision) {
            if( this.p.vx < 0  && this.p.vy == 0 ) { this.jump(collision); }
        }
    });

    Q.component("player", {
        added: function() {
            this.entity.fireWeapon = this.entity.fireWeapon || function() { };
            Q.input.on("fire", this.entity, "fireWeapon");
        },
        destroyed: function() {
            Q.input.off("fire", this.entity, "fireWeapon");
        }
    });
    Q.component("projectile", {
        added: function() {
            this.entity.on("hit", function(collision) {
                if( collision.obj.person && collision.obj.team != this.p.owner_team ) {
                    Q.stage().people.pop(Q.stage().people.indexOf(collision.obj));
                    collision.obj.destroy();
                }
                this.destroy();

            });
        },
    });
};

var Q = Quintus({ development: true }).include("Sprites, Scenes, Input, 2D, MyAI")
  .setup({ height: 500, width: 500, maximize: false }).controls();

Q.input.keyboardControls({
    9: "tab"
});

Q.Sprite.extend("Angel", {
    init: function(p) {
        this.person = true;
        this.team = "red";
        this._super(p, {
          asset: "angel.png"
        });
        this.add("2d, platformerControls, player");
        this.on("bump.bottom", function(collision) {
            if( collision.obj.isA("Archer") ) { 
//                collision.obj.destroy();
            }
        });
    }
});

Q.Sprite.extend("Arrow", {
    init: function(p) {
        this._super(p, { asset: "arrow.png", gravity: 0.3 });
        this.add("2d, projectile");
    }
});

Q.Sprite.extend("Archer", {
    init: function(p) {
        this.person = true;
        this.team = "blue";
        this._super(p, { asset: "archer.png", vx: 100 });
        this.add("2d, aiBounce, myAI");
    },
    fireWeapon: function() {
        var direction = this.p.vx / Math.abs(this.p.vx);
        if( isNaN(direction) ) { 
            direction = 1;
        } 
        Q.stage().insert(new Q.Arrow({ 
            vx: direction * 250, 
            vy: -100,
            x: this.p.x + (direction * this.p.w) + 2 * direction,
            y: this.p.y,
            owner_team: this.team
        }));
    }
});
    
Q.scene("level1", function(stage) {
    stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level.json', sheet: 'tiles' }));

    var archer1 = new Q.Archer({ x: 700, y: 0 }); 
    stage.insert(archer1);
    var archer2 = new Q.Archer({ x: 900, y: 0 })
    stage.insert(archer2);
    var angel = new Q.Angel({ x: 510, y: 90 })
    stage.insert(angel);
    stage.add("viewport").follow(angel);

    stage.people = [archer1, archer2, angel];
    Q.input.on("tab", function() {
        stage.viewport.following.del("platformerControls, player");
        stage.viewport.following.add("myAI, aiBounce");
        var idx = stage.people.indexOf(stage.viewport.following) + 1;
        if( idx >= stage.people.length ) {
            idx = 0;
        }
        stage.viewport.following = stage.people[idx];
        stage.viewport.following.del("myAI, aiBounce");
        stage.viewport.following.add("player, platformerControls");
    });
});

Q.load("arrow.png, angel.png, archer.png, level.json, tiles.png", 
       function() {
    Q.sheet("tiles","tiles.png", { tilew: 32, tileh: 32 });
    Q.stageScene("level1");
});
