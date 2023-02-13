module.exports = {
  env: {
    browser: true,
    es2018: true,
    node: true,
    jest: true,
  },
  globals: {
    uni: 'readonly',
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {},
}
