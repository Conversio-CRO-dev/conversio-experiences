const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const { locate, root } = require('../../../scripts/lib/experience.js');

// Builds one folder of an experience (a variation or the control) and resolves with the output file.
// styles.scss is not imported by index.js, so it is added as a second entry: without that the built
// file would have no CSS.
function buildExperience(code, variation) {
  return new Promise((resolve, reject) => {
    let target;
    try {
      target = locate(code, variation);
    } catch (err) {
      reject(err);
      return;
    }

    const getBaseConfig = require(path.join(root, 'config/webpack.experience.js'));
    const ownConfigPath = path.join(target.folder, 'webpack.config.js');
    const config = Object.assign(
      {},
      fs.existsSync(ownConfigPath) ? require(ownConfigPath) : getBaseConfig(code, target.variation)
    );

    config.context = target.folder;
    config.entry = fs.existsSync(target.scss)
      ? ['./src/index.js', './src/styles.scss']
      : './src/index.js';

    webpack(config).run((err, stats) => {
      if (err) {
        reject(err);
        return;
      }

      if (stats.hasErrors()) {
        const errors = stats.toJson().errors;
        reject(
          new Error(
            errors
              .map((e) => (typeof e === 'string' ? e : e.message || JSON.stringify(e)))
              .join('\n')
          )
        );
        return;
      }

      resolve({ file: path.join(config.output.path, config.output.filename), target });
    });
  });
}

module.exports = { buildExperience };
