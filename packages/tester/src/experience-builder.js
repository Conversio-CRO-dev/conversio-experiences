const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const getBaseConfig = require('../../config/webpack.experience.js');

function buildExperience(experienceCode, experiencePath) {
  return new Promise((resolve, reject) => {
    const experienceWebpackPath = path.join(experiencePath, 'webpack.config.js');
    let config;

    if (fs.existsSync(experienceWebpackPath)) {
      config = require(experienceWebpackPath);
    } else {
      config = getBaseConfig(experienceCode);
    }

    const compiler = webpack(config);
    compiler.run((err, stats) => {
      if (err || stats.hasErrors()) {
        const error = err || new Error(stats.toJson().errors[0]);
        reject(error);
        return;
      }

      resolve();
    });
  });
}

module.exports = { buildExperience };
