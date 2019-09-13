/* eslint-disable no-restricted-globals */
/* global self */

/**
 * Wraps circle pack manager in a worker-capable function
 */
export default function workerWrapper() {
  class Vector2 {
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

  class CirclePackPoint {
    constructor(opts = {}) {
      this.position = new Vector2(opts.x, opts.y);
      this.velocity = new Vector2();
      this.radius = opts.radius;
      this.manager = opts.manager;

      this.index = opts.index * 2;
      this._tmpVec = new Vector2(); // reused for various calculations

      this.updateBackingArray();
    }

    update() {
      // apply gravitational force. this moves points towards the manager's defined center at all times
      const _dist = this.position.distanceTo(this.manager.center);
      this._tmpVec.subVectors(this.manager.center, this.position).multiplyScalar(_dist / 100000000); // magic numbery. really not sure

      // multiply the gravitational force if circle is outside of the container area.
      if (_dist > this.manager.radius * (1 - this.manager.tightness)) {
        this._tmpVec.multiplyScalar(500);
      }

      this.velocity.add(this._tmpVec);

      if (this.manager.mouseInteractive) {
        const dist = this.manager.mouse.distanceTo(this.position);

        if (dist < this.manager.mouseRadius) {
          this._tmpVec.subVectors(this.position, this.manager.mouse).normalize();
          this.velocity.add(this._tmpVec);
        }
      }

      // apply friction and update position based on new velocity
      this.velocity.multiplyScalar(0.9);
      this.position.add(this.velocity);

      // apply position to backing array
      this.updateBackingArray();
    }

    updateBackingArray() {
      this.manager.pointsArray[this.index] = this.position.x;
      this.manager.pointsArray[this.index + 1] = this.position.y;
    }
  }

  class CirclePackManager {
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
      this.mouse = new Vector2(-200, -200);
      this.mouseRadius = 200;
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
            radii = (this.points[i].radius + this.points[j].radius);

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

  const circlePackManager = new CirclePackManager();

  self.onmessage = (event) => {
    if (event.data.action === 'setup') {
      circlePackManager.reset(event.data.pointCount);
    } else if (event.data.action === 'update') {
      circlePackManager.update();

      const points = new Float32Array(circlePackManager.pointsArray);

      postMessage({
        points: points.buffer,
      }, [ points.buffer ]);
    } else if (event.data.action === 'add') {
      const { point } = event.data;

      circlePackManager.addPoint(point.x, point.y, point.radius);
    } else if (event.data.action === 'calculateArea') {
      circlePackManager.calculateArea();
    } else if (event.data.action === 'updateMouse') {
      circlePackManager.mouse.x = event.data.x;
      circlePackManager.mouse.y = event.data.y;
    } else if (event.data.action === 'updateValue') {
      circlePackManager[event.data.key] = event.data.value;
    }
  };
}
