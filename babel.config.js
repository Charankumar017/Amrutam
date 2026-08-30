/**
 * Babel configuration.
 *
 * - `module-resolver` gives us the `@/*` alias so imports never contain `../../../`.
 *   It must stay in sync with `compilerOptions.paths` in tsconfig.json.
 * - `transform-inline-environment-variables` inlines `process.env.APP_ENV` at build
 *   time so `src/core/config` can pick an environment without a native dependency.
 */
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['transform-inline-environment-variables', { include: ['APP_ENV', 'APP_VARIANT'] }],
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: { '@': './src' },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    ],
  ],
};
