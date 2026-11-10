const path = require('path');
const baseConfig = require('../../../config/webpack.experience.js');

module.exports = {
  ...baseConfig('SY012', 'variation-1'),
  // Override base config here if needed
};
