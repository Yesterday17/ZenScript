module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['plugin:@typescript-eslint/recommended'],
  rules: {
    // '@typescript-eslint/class-name-casing': 'warn',
    '@typescript-eslint/member-delimiter-style': [
      'warn',
      {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
      },
    ],
    '@typescript-eslint/no-unused-expressions': 'warn',
    '@typescript-eslint/semi': ['warn', 'always'],
    '@typescript-eslint/no-empty-function': 'off',
    curly: 'warn',
    eqeqeq: ['error', 'always'],
    'no-redeclare': 'warn',
    'no-throw-literal': 'warn',
  },
};
