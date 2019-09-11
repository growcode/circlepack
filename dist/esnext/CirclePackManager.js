const THREE = require('three');

export default class CirclePackManager {
  constructor(opts = {}) {
    this.tightness = 0.5;
    this.active = true;
    this.points = [];
    this.center = opts.center;
    this.volume = 0;
    this.updateCallback = opts.onUpdate || null; // for optional interaction. positioned offscreen initially

    this.mouse = new THREE.Vector2(window.innerHeight * 2, window.innerHeight * 2);
    this.mouseRadius = 100;
    this.mouseInteractive = true;
    this._tmpPointA = new THREE.Vector2();
    this._tmpPointB = new THREE.Vector2();
    this._tmpVec = new THREE.Vector2();
  }

  calculateVolume() {
    this.volume = 0;

    for (let i = 0, total = this.points.length; i < total; i += 1) {
      this.volume += this.points[i].radius;
    }
  }

  update() {
    if (!this.active) {
      return;
    }

    let dist;
    let radii;
    let inverseForce;
    const pointTotal = this.points.length;

    for (let i = 0; i < pointTotal; i += 1) {
      for (let j = 0; j < pointTotal; j += 1) {
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
  }

}