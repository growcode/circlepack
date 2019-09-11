const THREE = require('three');

export default class Point {
  constructor(opts = {}) {
    this.position = new THREE.Vector2(opts.x, opts.y);
    this.velocity = new THREE.Vector2();
    this.radius = opts.radius;
    this.points = opts.pointsArray;
    this.manager = opts.manager; // reference to CirclePackManager instance

    this.index = opts.index;
    this._tmpVec = new THREE.Vector2(); // reused for various calculations

    this.points[this.index] = this.position.x;
    this.points[this.index + 1] = this.position.y;
  }

  update() {
    const _dist = this.position.distanceTo(this.manager.center);

    this._tmpVec.subVectors(this.manager.center, this.position).multiplyScalar(_dist / 100000000);

    if (_dist > this.manager.volume / 200 * Math.max(3.5, 80 - this.manager.tightness * 100)) {
      this._tmpVec.multiplyScalar(1000);
    }

    this.velocity.add(this._tmpVec);

    if (this.manager.mouseInteractive) {
      const dist = this.manager.mouse.distanceTo(this.position);

      if (dist < this.manager.mouseRadius) {
        this._tmpVec.subVectors(this.position, this.manager.mouse).normalize();

        this.velocity.add(this._tmpVec);
      }
    }

    this.velocity.multiplyScalar(0.9);
    this.position.add(this.velocity);
    this.points[this.index] = this.position.x;
    this.points[this.index + 1] = this.position.y;
  }

}