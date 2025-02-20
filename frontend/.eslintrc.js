module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:import/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:react-hooks/recommended",
    "standard",
    "plugin:prettier/recommended"
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: ["react", "react-hooks", "import", "jsx-a11y"],
  rules: {
    "no-unused-vars": "warn",
    "react/prop-types": "off",
    "prettier/prettier": ["error", { "singleQuote": true, "semi": false }]
  }
};