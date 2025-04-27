module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      blacklist: null,
      whitelist: null,
      safe: true,
      allowUndefined: false,
    }],
  ],
  env: {
    production: {
      plugins: [
        ['module:react-native-dotenv', {
          moduleName: '@env',
          path: '.env.production',
          safe: true,
          allowUndefined: false,
        }],
      ],
    },
    development: {
      plugins: [
        ['module:react-native-dotenv', {
          moduleName: '@env',
          path: '.env.development',
          safe: true,
          allowUndefined: false,
        }],
      ],
    },
    test: {
      plugins: [
        '@babel/plugin-transform-runtime',
        ['module:react-native-dotenv', {
          moduleName: '@env',
          path: '.env.test',
          safe: true,
          allowUndefined: false,
        }],
      ],
    },
  },
};
