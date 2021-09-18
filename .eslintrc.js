module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json"
  },
  env: {
    browser: true
  },
  extends: [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  settings: {
    react: {
      version: "detect"
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
      }
    }
  },
  rules: {
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/indent": ["error", 2]
  }
};
