const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

// Expo CLI will await this method so you can optionally return a promise.
module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Fix socket.io client loading
  config.resolve.alias = {
    ...config.resolve.alias,
    'socket.io-client': path.resolve(__dirname, 'node_modules/socket.io-client/dist/socket.io.js'),
  };

  return config;
};