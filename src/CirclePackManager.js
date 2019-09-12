import Vector2 from './Vector2';
import CirclePackPoint from './CirclePackPoint';

export default class CirclePackManager {
  constructor(opts = {}) {
    this.tightness = 1;
    this.active = true;
    this.points = [];
    this.pointsArray = new Float32Array(opts.size || 100);
    this.center = opts.center || new Vector2();
    this.area = 0;
    this.radius = 0;
    this.updateCallback = opts.onUpdate || null;

    // for optional interaction. positioned offscreen initially
    this.mouse = new Vector2(window.innerHeight * 2, window.innerHeight * 2);
    this.mouseRadius = 100;
    this.mouseInteractive = true;

    this._tmpVec = new Vector2();
  }

  calculateArea() {
    this.area = 0;

    for (let i = 0, total = this.points.length; i < total; i += 1) {
      this.area += this.points[i].radius * this.points[i].radius * Math.PI;
    }

    this.radius = Math.sqrt(this.area / Math.PI);
  }

  reset(size) {
    this.points = [];
    this.pointsArray = new Float32Array(size * 2);
  }

  addPoint(x, y, radius) {
    this.points.push(new CirclePackPoint({
      x,
      y,
      radius,
      index: this.points.length,
      manager: this,
    }));
  }

  update() {
    if (!this.active) { return; }

    // pre-instantiate vars so we aren't doing it on each iteration
    let dist;
    let radii;
    let inverseForce;
    const pointTotal = this.points.length;

    // check every point against every other point
    for (let i = 0; i < pointTotal; i += 1) {
      for (let j = 0; j < pointTotal; j += 1) {
        if (j !== i) { // don't compare this point to itself
          dist = this.points[i].position.distanceToSquared(this.points[j].position);
          radii = (this.points[i].radius + this.points[j].radius) / 3;

          if (dist < radii * radii) {
            // get direction between points
            this._tmpVec.subVectors(this.points[i].position, this.points[j].position).normalize();

            // applying an inverse force helps points come to rest
            inverseForce = (radii - Math.sqrt(dist));
            this._tmpVec.multiplyScalar(inverseForce / 3);

            // adjust velocities based on previously calculated distance and direction
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
  }
}
