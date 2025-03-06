// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  
  // Modify the config to properly resolve entry points
  config.resolver = {
    ...config.resolver,
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json']
  };
  
  return config;
})();