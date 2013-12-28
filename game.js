var Q = Quintus({ development: true }).include("Sprites, Scenes, Input, 2D")
  .setup({ maximize: true }).controls();

Q.Sprite.extend("Player", {
    init: function(p) {
        this._super(p, {
          asset: "angel.png"
        });
        this.add("2d, platformerControls");
    }
});

Q.scene("level1", function(stage) {
    stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level.json', sheet: 'tiles' }));

    var player = new Q.Player({ x: 510, y: 90 })
    stage.insert(player);
    stage.add("viewport").follow(player);
});

Q.load("angel.png, level.json, tiles.png", function() {
    Q.sheet("tiles","tiles.png", { tilew: 32, tileh: 32 });
    Q.stageScene("level1");
});
