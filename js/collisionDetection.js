console.clear();
//
// EDGE
// ===========================================================================
var Edge = /** @class */ (function () {
  function Edge(p1, p2) {
    if (p1 === void 0) { p1 = new PIXI.Point(); }
    if (p2 === void 0) { p2 = new PIXI.Point(); }
    this.p1 = p1;
    this.p2 = p2;
  }
  Edge.prototype.intersects = function (edge, asSegment, point) {
    if (asSegment === void 0) { asSegment = true; }
    if (point === void 0) { point = new PIXI.Point(); }
    var a = this.p1;
    var b = this.p2;
    var e = edge.p1;
    var f = edge.p2;
    var a1 = b.y - a.y;
    var a2 = f.y - e.y;
    var b1 = a.x - b.x;
    var b2 = e.x - f.x;
    var c1 = (b.x * a.y) - (a.x * b.y);
    var c2 = (f.x * e.y) - (e.x * f.y);
    var denom = (a1 * b2) - (a2 * b1);
    if (denom === 0) {
      return null;
    }
    point.x = ((b1 * c2) - (b2 * c1)) / denom;
    point.y = ((a2 * c1) - (a1 * c2)) / denom;
    if (asSegment) {
      var uc = ((f.y - e.y) * (b.x - a.x) - (f.x - e.x) * (b.y - a.y));
      var ua = (((f.x - e.x) * (a.y - e.y)) - (f.y - e.y) * (a.x - e.x)) / uc;
      var ub = (((b.x - a.x) * (a.y - e.y)) - ((b.y - a.y) * (a.x - e.x))) / uc;
      if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        return point;
      }
      else {
        return null;
      }
    }
    return point;
  };
  return Edge;
}());
//
// COLLISION SHAPE
// ===========================================================================
var CollisionShape = /** @class */ (function () {
  function CollisionShape(target, vertices) {
    if (vertices === void 0) { vertices = []; }
    this.target = target;
    this.vertices = vertices;
    this.edges = [];
    this.points = [];
    this.AABB = new PIXI.Rectangle();
    this.bounds = new PIXI.Bounds();
    this.intersectionPoint = new PIXI.Point();
    for (var i = 0; i < vertices.length; i++) {
      var p1 = vertices[i];
      var p2 = vertices[i + 1] || vertices[0];
      this.points.push(p1.clone());
      this.edges.push(new Edge(p1, p2));
    }
    this.update();
  }
  CollisionShape.prototype.update = function () {
    var transform = this.target.transform.worldTransform;
    var vertices = this.vertices;
    var points = this.points;
    var bounds = this.bounds;
    bounds.clear();
    for (var i = 0; i < points.length; i++) {
      var vertex = transform.apply(points[i], vertices[i]);
      bounds.addPoint(vertex);
    }
    bounds.getRectangle(this.AABB);
  };
  CollisionShape.prototype.intersectsAABB = function (shape) {
    var a = this.bounds;
    var b = shape.bounds;
    return !(a.maxX < b.minX ||
      a.maxY < b.minY ||
      a.minX > b.maxX ||
      a.minY > b.maxY);
  };
  CollisionShape.prototype.intersectsShape = function (shape) {
    var edges1 = this.edges;
    var edges2 = shape.edges;
    for (var i = 0; i < edges1.length; i++) {
      var edge1 = edges1[i];
      for (var j = 0; j < edges2.length; j++) {
        var edge2 = edges2[j];
        if (edge1.intersects(edge2, true, this.intersectionPoint)) {
          return true;
        }
      }
    }
    return false;
  };
  return CollisionShape;
}());
//
// APPLICATION
// ===========================================================================
var COLLISION = {
  NONE: 0x4caf50,
  AABB: 0x2196F3,
  SHAPE: 0xf44336
};
var vw = window.innerWidth;
var vh = window.innerHeight;
var app = new PIXI.Application({
  view: document.querySelector("#view"),
  width: vw,
  height: vh
});
var sprites = [];
var container = new PIXI.Container();
for (var i = 0; i < 7; i++) {
  sprites.push(createSprite());
}
var text = new PIXI.Text("Drag the shapes around", {
  fill: "rgba(255,255,255,0.9)",
  fontSize: 16
});
text.position.set(12);
var graphics = new PIXI.Graphics();
app.stage.addChild(container, graphics, text);
app.ticker.add(update);
window.addEventListener("resize", onResize);
//
// CREATE SPRITE
// ===========================================================================
function createSprite() {
  var sides = random(4, 10) | 0;
  var step = Math.PI * 2 / sides;
  var points = [];
  var minX = Infinity;
  var minY = Infinity;
  console.log(sides);
  for (var i = 0; i < sides - 1; i++) {
    var theta = (step * i) + random(step);
    var radius = random(100, 160);
    var x = radius * Math.cos(theta);
    var y = radius * Math.sin(theta);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    points.push(new PIXI.Point(x, y));
  }
  points.forEach(function (point) {
    point.x = point.x - minX;
    point.y = point.y - minY;
  });
  var graphics = new PIXI.Graphics()
    .beginFill(0xffffff)
    .drawPolygon(points)
    .endFill();
  var sprite = new PIXI.Sprite(graphics.generateCanvasTexture());
  sprite.alpha = 0.6;
  sprite.x = random(100, vw - 100);
  sprite.y = random(100, vh - 100);
  sprite.pivot.x = sprite.width * 0.5;
  sprite.pivot.y = sprite.height * 0.5;
  sprite.rotation = random(Math.PI * 2);
  sprite.scale.set(random(0.4, 1));
  sprite.hitArea = new PIXI.Polygon(points);
  sprite.shape = new CollisionShape(sprite, points);
  sprite.collisionID = 1;
  sprite.collision = COLLISION.NONE;
  sprite.tint = sprite.collision;
  sprite.dragging = false;
  sprite.newPosition = new PIXI.Point();
  sprite.lastPosition = new PIXI.Point();
  sprite.interactive = true;
  sprite.buttonMode = true;
  sprite
    .on("pointerdown", onDragStart)
    .on("pointerup", onDragEnd)
    .on("pointerupoutside", onDragEnd)
    .on("pointermove", onDragMove);
  graphics.destroy();
  container.addChild(sprite);
  return sprite;
}
//
// DETECT COLLISIONS
// ===========================================================================
function detectCollisions() {
  container.updateTransform();
  for (var i = 0; i < sprites.length; i++) {
    var sprite = sprites[i];
    sprite.collision = COLLISION.NONE;
    if (sprite.collisionID) {
      sprite.shape.update();
      sprite.collisionID = 0;
    }
  }
  for (var i = 0; i < sprites.length; i++) {
    var sprite1 = sprites[i];
    for (var j = i + 1; j < sprites.length; j++) {
      var sprite2 = sprites[j];
      // Check for AABB intersections to determine what shapes might be overlapping
      if (sprite1.shape.intersectsAABB(sprite2.shape)) {
        if (sprite1.collision === COLLISION.NONE) {
          sprite1.collision = COLLISION.AABB;
        }
        if (sprite2.collision === COLLISION.NONE) {
          sprite2.collision = COLLISION.AABB;
        }
        if (sprite1.shape.intersectsShape(sprite2.shape)) {
          sprite1.collision = COLLISION.SHAPE;
          sprite2.collision = COLLISION.SHAPE;
        }
      }
      sprite2.tint = sprite2.collision;
    }
    sprite1.tint = sprite1.collision;
  }
}
//
// UPDATE
// ===========================================================================
function update() {
  detectCollisions();
  graphics
    .clear()
    .lineStyle(1, 0xffffff, 0.8);
  for (var i = 0; i < sprites.length; i++) {
    var box = sprites[i].shape.AABB;
    graphics.drawRect(box.x, box.y, box.width, box.height);
  }
}
//
// DRAG EVENTS
// ===========================================================================
function onDragStart(event) {
  this.dragging = true;
  this.dragData = event.data;
  this.lastPosition = this.dragData.getLocalPosition(this.parent, this.lastPosition);
}
function onDragMove(event) {
  if (this.dragging) {
    var newPosition = this.dragData.getLocalPosition(this.parent, this.newPosition);
    this.position.x += (newPosition.x - this.lastPosition.x);
    this.position.y += (newPosition.y - this.lastPosition.y);
    this.lastPosition.copy(newPosition);
    this.collisionID++;
  }
}
function onDragEnd(event) {
  this.dragData = null;
  this.dragging = false;
}
function onResize() {
  vw = window.innerWidth;
  vh = window.innerHeight;
  app.renderer.resize(vw, vh);
}
function random(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  if (min > max) {
    var tmp = min;
    min = max;
    max = tmp;
  }
  return min + (max - min) * Math.random();
}