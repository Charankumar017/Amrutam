module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: ['node_modules/', 'android/', 'ios/'],
  rules: {
    // The design system owns styling; inline theme-derived styles are the point.
    'react-native/no-inline-styles': 'off',
    // `void somePromise()` is this codebase's explicit "fire and forget" marker.
    // Banning it would push us back to unmarked floating promises.
    'no-void': 'off',
    // `export const X = memo(function X() {})` is the standard way to keep a
    // useful name in React DevTools; the rule only ever fires on that pattern.
    '@typescript-eslint/no-shadow': 'off',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      },
    },
  ],
};
