module.exports = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "env": {
    "browser": true
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "airbnb",
    "plugin:@typescript-eslint/recommended",
    "eslint-config-structure"
  ],
  "settings": {
    "import/resolver": {
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx"]
      }
    }
  },
  "rules": {
    "@typescript-eslint/indent": ["error", 2],
    "react/jsx-filename-extension": 0,
    "operator-linebreak": 0,
    "object-curly-newline": 0,
    "import/newline-after-import": 0,
    "react/jsx-boolean-value": 0,
    "@typescript-eslint/camelcase": 0,
    "import/no-extraneous-dependencies": 0,
    "import/prefer-default-export": 0,
    "@typescript-eslint/member-delimiter-style": ["error", {
      multiline: {
        delimiter: 'none',
        requireLast: false,
      },
      singleline: {
        requireLast: false,
      },
    }],
    "@typescript-eslint/no-var-requires": 0,
    // Noisy errors that we should reactivate once we"re up and running
    "@typescript-eslint/explicit-member-accessibility": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "comma-dangle": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "implicit-arrow-linebreak": 0,
    "arrow-parens": 0,
  }
}
