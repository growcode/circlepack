import Vector2 from './Vector2';
export default class Point {
  constructor(opts = {}) {
    this.position = new Vector2(opts.x, opts.y);
    this.velocity = new Vector2();
    this.radius = opts.radius;
    this.points = opts.pointsArray;
    this.manager = opts.manager; // reference to CirclePackManager instance

    this.index = opts.index;
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
    } // apply friction and update position based on new velocity


    this.velocity.multiplyScalar(0.9);
    this.position.add(this.velocity); // apply position to backing array

    this.updateBackingArray();
  }

  updateBackingArray() {
    this.points[this.index] = this.position.x;
    this.points[this.index + 1] = this.position.y;
  }

}