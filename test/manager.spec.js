import { assert } from 'chai';
import CirclePackManager from '../src/CirclePackManager';

describe('Manager', function () {
  let circlePackManager;

  before('setup manager', function () {
    circlePackManager = new CirclePackManager();
  });

  describe('#constructor', function () {
    it(
      'should create a manager',
      function () {
        assert(circlePackManager instanceof CirclePackManager);
      },
    );
  });
});
