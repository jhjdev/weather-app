const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Exclude Node.js modules from bundling
    blockList: [/node_modules\/dotenv\/.*/],
    // Don't bundle dotenv and other Node.js specific modules
    resolverMainFields: ['react-native', 'browser', 'main'],
  },
  resetCache: true
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
