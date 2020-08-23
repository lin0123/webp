/* eslint-disable */
/**
 * webp-converter-plugin
 */

const webpConverter = require('webp-converter');

class webpConverterPlugin {
  constructor({
    test = /\.(jpe?g|png)$/,
    quality = 90,
  } = {}) {
    this.test = test;
    this.quality = quality;
  }

  apply(compiler) {
    const onEmit = (compilation, cb) => {
      const assetsObj = compilation.assets;
      let assetNames = Object.keys(assetsObj);
      Promise.all(
        assetNames.map((fileKey) => {
          if (this.test.test(fileKey)) {
            const suffix = fileKey.split('.').pop();
            const fileItem = assetsObj[fileKey];
            let result = webpConverter.buffer2webpbuffer(
              fileItem.source(),
              suffix,
              `-q ${this.quality}`,
            );
            return result.then(function(result) {
              assetsObj[`${fileKey}.webp`] = {
                source: () => result,
                size: () => result.length,
              };
            }).catch((error) => {
              throw new Error(`${fileKey} transfer error`, error);
            });
          }
        }),
      ).then(() => {
        if (cb) cb();
      }).catch((err) => {
        console.log('webp transfer error');
        throw new Error(err);
      });
    };

    if (compiler.hooks) {
      // webpack 4.x
      compiler.hooks.emit.tapAsync('webpConverterPlugin', onEmit);
    } else {
      // older versions
      compiler.plugin('emit', onEmit);
    }
  }
}

module.exports = webpConverterPlugin;
