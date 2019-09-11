"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _Vector = _interopRequireDefault(require("./Vector2"));

var CirclePackManager =
/*#__PURE__*/
function () {
  function CirclePackManager(opts) {
    if (opts === void 0) {
      opts = {};
    }

    this.tightness = 0.5;
    this.active = true;
    this.points = [];
    this.center = opts.center || new _Vector.default();
    this.volume = 0;
    this.updateCallback = opts.onUpdate || null; // for optional interaction. positioned offscreen initially

    this.mouse = new _Vector.default(window.innerHeight * 2, window.innerHeight * 2);
    this.mouseRadius = 100;
    this.mouseInteractive = true;
    this._tmpPointA = new _Vector.default();
    this._tmpPointB = new _Vector.default();
    this._tmpVec = new _Vector.default();
  }

  var _proto = CirclePackManager.prototype;

  _proto.calculateVolume = function calculateVolume() {
    this.volume = 0;

    for (var i = 0, total = this.points.length; i < total; i += 1) {
      this.volume += this.points[i].radius;
    }
  };

  _proto.update = function update() {
    if (!this.active) {
      return;
    }

    var dist;
    var radii;
    var inverseForce;
    var pointTotal = this.points.length;

    for (var i = 0; i < pointTotal; i += 1) {
      for (var j = 0; j < pointTotal; j += 1) {
        if (j !== i) {
          dist = this.points[i].position.distanceToSquared(this.points[j].position);
          radii = (this.points[i].radius + this.points[j].radius) / 3;

          if (dist < radii * radii) {
            this._tmpVec.subVectors(this.points[i].position, this.points[j].position).normalize();

            inverseForce = radii - Math.sqrt(dist);

            this._tmpVec.multiplyScalar(inverseForce / 3);

            this.points[i].velocity.add(this._tmpVec);
            this.points[j].velocity.sub(this._tmpVec);
          }
        }
      }

      this.points[i].update();
    }

    if (this.updateCallback) {
      this.updateCallback.call();
    }
  };

  return CirclePackManager;
}();

exports.default = CirclePackManager;