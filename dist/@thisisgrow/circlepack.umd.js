(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global['@thisisgrow/circlepack'] = {})));
}(this, (function (exports) { 'use strict';

  var Vector2 =
  /*#__PURE__*/
  function () {
    function Vector2(x, y) {
      this.x = x || 0;
      this.y = y || 0;
    }

    var _proto = Vector2.prototype;

    _proto.add = function add(vec) {
      this.x += vec.x;
      this.y += vec.y;
      return this;
    };

    _proto.copy = function copy(vec) {
      this.x = vec.x;
      this.y = vec.y;
      return this;
    };

    _proto.distanceTo = function distanceTo(vec) {
      return Math.sqrt(this.distanceToSquared(vec));
    };

    _proto.distanceToSquared = function distanceToSquared(vec) {
      var dx = this.x - vec.x;
      var dy = this.y - vec.y;
      return dx * dx + dy * dy;
    };

    _proto.divideScalar = function divideScalar(scalar) {
      this.x /= scalar;
      this.y /= scalar;
      return this;
    };

    _proto.length = function length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    _proto.multiplyScalar = function multiplyScalar(scalar) {
      this.x *= scalar;
      this.y *= scalar;
      return this;
    };

    _proto.normalize = function normalize() {
      return this.divideScalar(this.length() || 1);
    };

    _proto.set = function set(x, y) {
      this.x = x;
      this.y = y;
    };

    _proto.sub = function sub(vec) {
      this.x -= vec.x;
      this.y -= vec.y;
      return this;
    };

    _proto.subVectors = function subVectors(vec, vec2) {
      this.x = vec.x - vec2.x;
      this.y = vec.y - vec2.y;
      return this;
    };

    return Vector2;
  }();

  var CirclePackManager =
  /*#__PURE__*/
  function () {
    function CirclePackManager(opts) {
      if (opts === void 0) {
        opts = {};
      }

      this.tightness = 1;
      this.active = true;
      this.points = [];
      this.center = opts.center || new Vector2();
      this.area = 0;
      this.radius = 0;
      this.updateCallback = opts.onUpdate || null; // for optional interaction. positioned offscreen initially

      this.mouse = new Vector2(window.innerHeight * 2, window.innerHeight * 2);
      this.mouseRadius = 100;
      this.mouseInteractive = true;
      this._tmpPointA = new Vector2();
      this._tmpPointB = new Vector2();
      this._tmpVec = new Vector2();
    }

    var _proto = CirclePackManager.prototype;

    _proto.calculateArea = function calculateArea() {
      this.area = 0;

      for (var i = 0, total = this.points.length; i < total; i += 1) {
        this.area += this.points[i].radius * this.points[i].radius * Math.PI;
      }

      this.radius = Math.sqrt(this.area / Math.PI);
    };

    _proto.update = function update() {
      if (!this.active) {
        return;
      } // pre-instantiate vars so we aren't doing it on each iteration


      var dist;
      var radii;
      var inverseForce;
      var pointTotal = this.points.length; // check every point against every other point

      for (var i = 0; i < pointTotal; i += 1) {
        for (var j = 0; j < pointTotal; j += 1) {
          if (j !== i) {
            // don't compare this point to itself
            dist = this.points[i].position.distanceToSquared(this.points[j].position);
            radii = (this.points[i].radius + this.points[j].radius) / 3;

            if (dist < radii * radii) {
              // get direction between points
              this._tmpVec.subVectors(this.points[i].position, this.points[j].position).normalize(); // applying an inverse force helps points come to rest


              inverseForce = radii - Math.sqrt(dist);

              this._tmpVec.multiplyScalar(inverseForce / 3); // adjust velocities based on previously calculated distance and direction


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

  var Point =
  /*#__PURE__*/
  function () {
    function Point(opts) {
      if (opts === void 0) {
        opts = {};
      }

      this.position = new Vector2(opts.x, opts.y);
      this.velocity = new Vector2();
      this.radius = opts.radius;
      this.points = opts.pointsArray;
      this.manager = opts.manager; // reference to CirclePackManager instance

      this.index = opts.index;
      this._tmpVec = new Vector2(); // reused for various calculations

      this.updateBackingArray();
    }

    var _proto = Point.prototype;

    _proto.update = function update() {
      // apply gravitational force. this moves points towards the manager's defined center at all times
      var _dist = this.position.distanceTo(this.manager.center);

      this._tmpVec.subVectors(this.manager.center, this.position).multiplyScalar(_dist / 100000000); // magic numbery. really not sure
      // multiply the gravitational force if circle is outside of the container area.


      if (_dist > this.manager.radius * (1 - this.manager.tightness)) {
        this._tmpVec.multiplyScalar(500);
      }

      this.velocity.add(this._tmpVec);

      if (this.manager.mouseInteractive) {
        var dist = this.manager.mouse.distanceTo(this.position);

        if (dist < this.manager.mouseRadius) {
          this._tmpVec.subVectors(this.position, this.manager.mouse).normalize();

          this.velocity.add(this._tmpVec);
        }
      } // apply friction and update position based on new velocity


      this.velocity.multiplyScalar(0.9);
      this.position.add(this.velocity); // apply position to backing array

      this.updateBackingArray();
    };

    _proto.updateBackingArray = function updateBackingArray() {
      this.points[this.index] = this.position.x;
      this.points[this.index + 1] = this.position.y;
    };

    return Point;
  }();

  exports.CirclePackManager = CirclePackManager;
  exports.CirclePackPoint = Point;
  exports.Vector2 = Vector2;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=circlepack.umd.js.map
