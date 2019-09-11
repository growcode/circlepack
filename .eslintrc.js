module.exports = {
  env: {
    es6: true,
    browser: true,
  },
  extends: [
    'airbnb-base',
    'plugin:jsdoc/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'no-console': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'import/no-useless-path-segments': 0,
    'import/extensions': [
      '.js',
      '.mjs',
      '.jsx',
      '.vue',
    ],
    'max-len': [ 'error', {
      code: 200,
      ignoreComments: true,
      ignoreStrings: true, // ignores lines that contain a double-quoted or single-quoted string
      ignoreTemplateLiterals: true, // ignores lines that contain a template literal
      ignoreRegExpLiterals: true,
    } ],
    'arrow-parens': 0,
    'array-bracket-spacing': [ 2, 'always' ],
    'no-underscore-dangle': 0,

    // jsdoc rules
    // https://github.com/gajus/eslint-plugin-jsdoc#readme

    "jsdoc/check-tag-names": [
      1,
      {
        'definedTags': [
          // Document This VS code extension adds this as it is a valid Closure tag https://github.com/google/closure-compiler/wiki/Annotating-JavaScript-for-the-Closure-Compiler
          'export'
        ]
      }
    ],
  },
  settings: {
    jsdoc: {
      tagNamePreference: {
        'prop': {
          'replacement': 'prop'
        },
        'property': {
          'replacement': 'prop',
          "message": "Use `prop` instead of `property` and save some keystrokes."
        },
        'extends': {
          'replacement': 'extends'
        },
        'augments': {
          'replacement': 'extends',
          "message": "Use `extends` instead of `augments` because its easier to understand."
        },
      },

    }
  }
};
