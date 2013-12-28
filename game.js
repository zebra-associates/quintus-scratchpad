Quintus.MyAI = function(Q) {
    Q.component("myAI", {
        init: function(p) {
            this.on("bump.left", this, "jumpLeft");
            this.on("bump.right", this, "jumpRight");
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
};

var Q = Quintus({ development: true }).include("Sprites, Scenes, Input, 2D, MyAI")
  .setup({ height: 500, width: 500, maximize: false }).controls();

Q.input.keyboardControls({
    9: "tab"
});

Q.Sprite.extend("Player", {
    init: function(p) {
        this._super(p, {
          asset: "angel.png"
        });
        this.add("2d, platformerControls");
        this.on("bump.bottom", function(collision) {
            if( collision.obj.isA("Archer") ) { 
//                collision.obj.destroy();
            }
        });
    }
});

Q.Sprite.extend("Archer", {
    init: function(p) {
        this._super(p, { asset: "archer.png", vx: 100 });
        this.add("2d, aiBounce, myAI");
    }
});
    
Q.scene("level1", function(stage) {
    stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level.json', sheet: 'tiles' }));

    var archer1 = new Q.Archer({ x: 700, y: 0 }); 
    stage.insert(archer1);
    var archer2 = new Q.Archer({ x: 900, y: 0 })
    stage.insert(archer2);
    var player = new Q.Player({ x: 510, y: 90 })
    stage.insert(player);
    stage.add("viewport").follow(player);

    var people = [archer1, archer2, player];
    Q.input.on("tab", function() {
        stage.viewport.following.del("platformerControls");
        stage.viewport.following.add("myAI, aiBounce");
        if( stage.viewport.following == player ) {
            stage.viewport.following = archer1;
        } else {
            stage.viewport.following = people[people.indexOf(stage.viewport.following) + 1];
        }
        stage.viewport.following.del("myAI, aiBounce");
        stage.viewport.following.add("platformerControls");
    });
});

Q.load("angel.png, archer.png, level.json, tiles.png", function() {
    Q.sheet("tiles","tiles.png", { tilew: 32, tileh: 32 });
    Q.stageScene("level1");
});
