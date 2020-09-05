/* eslint-disable */
/**
 * webp browser detect
 */

// /**
//  * 注入能力检测代码段至html页面
//  * @param {string} insertStr 需要在页面打上的标识
//  */
// const insertScriptFn = (insertStr) => `
// <script>
//   (function(){
//     if (document) {
//       var detectCanvas = document.createElement('canvas') || {};
//       detectCanvas.width = detectCanvas.height = 1;
//       var detectFlag = detectCanvas.toDataURL ? detectCanvas.toDataURL('image/webp').indexOf('image/webp') === 5 : false;
//       if (detectFlag) {
//         ${insertStr}
//       }
//     }
//   })();
// </script>`;
/**
 * 注入能力检测代码段至html页面
 * @param {string} featureStr 检测哪种压缩形势
 * @param {string} insertStr 需要在页面打上的标识
 * @param {string} errorStr 加载失败时的处理
 */
const insertScriptFn = (featureStr, insertStr, errorStr) => `
<script>
  (function () {
    var img = new Image();
    img.onload = function () {
      var result = (img.width > 0) && (img.height > 0);
      if (result) {
        ${insertStr}
      } else {
        ${errorStr}
      }
    };
    img.onerror = function () {
      ${errorStr}
    };
    img.src = '${featureStr}';
  })();
</script>`;

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
    errorCode = 'document.documentElement.setAttribute("webp", false);window.__detect_webp__ = false;',
    insertFlag = '<head>',
  } = {}) {
    this.feature = feature;
    this.insertCode = insertCode;
    this.errorCode = errorCode;
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
          const htmlSource = fileItem.source();
          let htmlStr = htmlSource.toString();
          let preFix = '';
          if (this.insertFlag === '<head>') preFix = '<head>';
          const targetStr = `
            ${preFix}
            ${insertScriptFn(
              'data:image/webp;base64,' + webpCompressFormatObj[this.feature],
              this.insertCode,
              this.errorCode,
            )}
          `;

          // const targetStr = `
          //   ${preFix}
          //   ${insertScriptFn(this.insertCode)}
          // `;
          let targetSource = htmlStr.replace(this.insertFlag, targetStr);
          if (typeof htmlSource === 'object') targetSource = Buffer.from(targetSource);
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
