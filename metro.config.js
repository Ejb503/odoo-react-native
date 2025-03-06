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
    minifierPath: require.resolve('metro-minify-terser'),
    minifierConfig: {
      // Terser options for better minification
      compress: {
        reduce_vars: true,
        inline: true,
      },
      mangle: {
        toplevel: true,
      },
    },
  };

  // Add server configuration with better network handling
  config.server = {
    ...config.server,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Add CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Add caching headers
        res.setHeader('Cache-Control', 'no-cache');
        return middleware(req, res, next);
      };
    },
    port: 8081,
  };

  // Configure caching - use the standard cache system instead of custom stores
  config.cacheVersion = "1.0";
  config.resetCache = false;
  
  return config;
})();