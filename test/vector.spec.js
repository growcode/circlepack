import { assert } from 'chai';
import Vector2 from '../src/Vector2';

describe('Vector2', function () {
  let vec;

  before('setup Vector2', function () {
    vec = new Vector2();
  });

  this.beforeEach(() => {
    vec.set(0, 0);
  })

  describe('#constructor', function () {
    it(
      'should create a Vector2',
      function () {
        assert(vec instanceof Vector2);
      },
    );

    it(
      'should default to [0, 0]',
      function () {
        assert(vec.x === 0 && vec.y === 0);
      },
    );

    it(
      'should add vectors',
      function () {
        const _vec2 = new Vector2(1, 2);
        vec.add(_vec2);

        assert(vec.x === 1 && vec.y === 2);
      },
    );

    it(
      'should return itself after adding',
      function () {
        const _vec2 = new Vector2(0, 0);
        const _vec = vec.add(_vec2);

        assert(vec === _vec);
      },
    );

    it(
      'should copy a vector and return itself',
      function () {
        const _vec2 = new Vector2(1, 1);
        const _vec = vec.copy(_vec2);

        assert(vec === _vec && vec.x === 1 && vec.y === 1);
      },
    );

    it(
      'should return distances between vectors',
      function () {
        const _vec = new Vector2(0, 0);
        const _vec2 = new Vector2(2, 2);

        assert(_vec.distanceToSquared(_vec2) === 8);
      },
    );

    it(
      'should divide by scalar and return itself',
      function () {
        vec.set(4, 4);
        const _vec = vec.divideScalar(2);

        assert(vec.x === 2 && vec.y === 2 && vec === _vec);
      },
    );

    it(
      'should multiply by scalar and return itself',
      function () {
        vec.set(2, 2);
        const _vec = vec.multiplyScalar(2);

        assert(vec.x === 4 && vec.y === 4 && vec === _vec);
      },
    );

    it(
      'should subtract a vector and return itself',
      function () {
        vec.set(2, 2);
        const _subVec = new Vector2(1, 1);
        const _vec = vec.sub(_subVec);

        assert(vec.x === 1 && vec.y === 1 && vec === _vec);
      },
    );

    it(
      'should set itself to the difference between two scalars and return itself',
      function () {
        const _vecA = new Vector2(4, 4)
        const _vecB = new Vector2(2, 2);
        const _vec = vec.subVectors(_vecA, _vecB);

        assert(vec.x === 2 && vec.y === 2 && vec === _vec);
      },
    );
  });
});
