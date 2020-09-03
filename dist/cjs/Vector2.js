"use strict";

exports.__esModule = true;
exports.default = void 0;

var Vector2 = /*#__PURE__*/function () {
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

exports.default = Vector2;