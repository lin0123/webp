/* eslint-disable */
/**
 * webp browser detect
 */

/**
 * 注入能力检测代码段至html页面
 * @param {string} feature 检测哪种压缩形势
 * @param {string} insertStr 需要在页面打上的标识
 */
const insertScriptFn = (featureStr, insertStr) => `
  <script>
    (function detectWebp () {
      var img = new Image();
      img.onload = function () {
        var result = (img.width > 0) && (img.height > 0);
        if (result) {
          ${insertStr}
        }
      };
      img.src = 'data:image/webp;base64,' + '${featureStr}';
    })();
  </script>
`;

/**
 * webp 几种压缩格式检测支持
 */
const webpCompressFormatObj = {
  lossy: 'UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
  lossless: 'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==',
  alpha: 'UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==',
  animation: 'UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA',
};

class WebpDetectPlugin {
  constructor({
    test = /.\.html$/,
    feature = 'lossless',
    insertCode = 'document.documentElement.setAttribute("webp", true);window.__detect_webp__ = true;',
    insertFlag = '<head>',
  } = {}) {
    this.feature = feature;
    this.insertCode = insertCode;
    this.test = test;
    this.insertFlag = insertFlag;
  }

  apply(compiler) {
    const onEmit = (compilation, cb) => {
      const assetsObj = compilation.assets;
      let assetNames = Object.keys(assetsObj);
      assetNames.forEach((fileKey) => {
        if (this.test.test(fileKey)) {
          const fileItem = assetsObj[fileKey];
          const htmlStr = fileItem.source();
          let preFix = '';
          if (this.insertFlag === '<head>') preFix = '<head>';
          const targetStr = `
            ${preFix}
            ${insertScriptFn(
            webpCompressFormatObj[this.feature],
            this.insertCode,
          )}
          `;
          const targetSource = htmlStr.replace(this.insertFlag, targetStr);
          assetsObj[fileKey] = {
            source: () => targetSource,
            size: () => targetSource.length,
          };
        }
      });
      if (cb) cb();
    };

    if (compiler.hooks) {
      // webpack 4.x
      compiler.hooks.emit.tapAsync('WebpDetectPlugin', onEmit);
    } else {
      // older versions
      compiler.plugin('emit', onEmit);
    }
  }
}

module.exports = WebpDetectPlugin;
