module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true,
    jest: true
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  ignorePatterns: ["dist", "node_modules"],
  rules: {
    "no-console": "off"
  }
};