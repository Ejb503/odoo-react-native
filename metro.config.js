// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  
  // Modify the config to properly resolve entry points
  config.resolver = {
    ...config.resolver,
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
    extraNodeModules: {
      ...(config.resolver.extraNodeModules || {}),
      'socket.io-client': require.resolve('socket.io-client'),
    },
    // Add assetExts for proper handling of images and other assets
    assetExts: [...config.resolver.assetExts, 'db', 'mp3', 'ttf', 'obj', 'png', 'jpg', 'jpeg', 'gif']
  };
  
  // Optimize transformation options
  config.transformer = {
    ...config.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  };
  
  return config;
})();