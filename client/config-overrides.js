// config-overrides.js
const { override, addWebpackPlugin } = require('customize-cra');
const webpack = require('webpack');

module.exports = override(
  (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: /node_modules|pagefile\.sys|hiberfil\.sys|swapfile\.sys/
    };
    return config;
  }
);