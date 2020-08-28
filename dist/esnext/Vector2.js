export default class Vector2 {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  add(vec) {
    this.x += vec.x;
    this.y += vec.y;
    return this;
  }

  copy(vec) {
    this.x = vec.x;
    this.y = vec.y;
    return this;
  }

  distanceTo(vec) {
    return Math.sqrt(this.distanceToSquared(vec));
  }

  distanceToSquared(vec) {
    const dx = this.x - vec.x;
    const dy = this.y - vec.y;
    return dx * dx + dy * dy;
  }

  divideScalar(scalar) {
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  normalize() {
    return this.divideScalar(this.length() || 1);
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }

  sub(vec) {
    this.x -= vec.x;
    this.y -= vec.y;
    return this;
  }

  subVectors(vec, vec2) {
    this.x = vec.x - vec2.x;
    this.y = vec.y - vec2.y;
    return this;
  }

}