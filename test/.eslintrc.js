module.exports = {
  env: {
    mocha: true,
    node: true,
  },
  plugins: [
    'chai-friendly',
  ],
  rules: {
    'func-names': 0,
    'prefer-arrow-callback': 0,
    'no-unused-expressions': 0,
    'chai-friendly/no-unused-expressions': 2,
  }
};
