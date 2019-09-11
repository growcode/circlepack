/**
 * Sets the Babel config for unit tests
 */

module.exports = {
  "env": {
    "test": {
      "presets": [
        [
          "@babel/preset-env",
          {
            "targets": {
              "node": true
            }
          }
        ]
      ]
    }
  }
}
