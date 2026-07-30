const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

function buildExperience(experienceCode, experiencePath) {
  return new Promise((resolve, reject) => {
    const monorepoRoot = path.resolve(__dirname, '../../..');
    const configPath = path.join(monorepoRoot, 'config/webpack.experience.js');
    const getBaseConfig = require(configPath);

    const experienceWebpackPath = path.join(experiencePath, 'webpack.config.js');
    let config;

    if (fs.existsSync(experienceWebpackPath)) {
      config = require(experienceWebpackPath);
    } else {
      config = getBaseConfig(experienceCode);
    }

    // Set context to experience directory so ./src/index.js resolves correctly
    config.context = experiencePath;

    const compiler = webpack(config);
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
        return;
      }

      if (stats.hasErrors()) {
        const errors = stats.toJson().errors;
        const errorMsg = errors.map(e => {
          if (typeof e === 'string') return e;
          return e.message || JSON.stringify(e);
        }).join('\n');
        reject(new Error(errorMsg));
        return;
      }

      resolve();
    });
  });
}

module.exports = { buildExperience };
