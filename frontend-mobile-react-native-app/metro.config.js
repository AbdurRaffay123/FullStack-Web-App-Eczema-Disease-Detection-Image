// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Exclude plugin files from bundling (they're only used during Babel transformation)
config.resolver.blockList = [
  ...(config.resolver.blockList || []),
  /node_modules\/react-native-worklets.*\/plugin/,
  /node_modules\/react-native-worklets-core.*\/plugin/,
];

module.exports = config;

