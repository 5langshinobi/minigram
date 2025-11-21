// webpack.config.js
const fs = require('fs');
const path = require('path');

module.exports = {
  watchOptions: {
    ignored: [
      '**/node_modules',
      'C:\\pagefile.sys',
      'C:\\hiberfil.sys',
      'C:\\swapfile.sys'
    ].filter(file => {
      try {
        return fs.existsSync(file);
      } catch {
        return false;
      }
    })
  }
};