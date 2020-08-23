#### webp-detect-plugin

##### judge webp format can you use in browser

##### npm i webp-detect-plugin

```
// use
const BrowserDetect = require('webp-detect-plugin');

// in webpack, you can use this
plugins: [
  new BrowserDetect(),
],

you can transmit a option to the plugin

option is a object type, it's optional, each property default is that:

default option below

{
  // inject code into file regexp
  test: /.\.html$/,
  // compress type detect, you can use lossy lossless alpha animation
  feature = 'lossless',
  // inject code
  insertCode = 'document.documentElement.setAttribute("webp", true);window.__detect_webp__ = true;',
  // inject flag, you can define it, but you should add in html page
  // about insertFlag, it's should in head tag inset
  insertFlag = '<head>',
}

with set the insertCode property, in other place, you can judgement by this

const isCanUseWebp = document.documentElement.getAttribute('webp') === 'true';

or

const isCanUseWebp = window.__detect_webp__
```

```
插件支持一个对象入参，默认参数如上所示, 但你也可以更改
test 就是正则匹配到了的需要注入兼容性代码的文件
feature webp压缩格式, 有些特殊的压缩格式可能存在兼容, 默认的无损压缩
insertCode 用来在浏览器中取到的标识判断，建议不要更改, 后续其他的工具可能都会根据此来判断
insertFlag 默认在head标签后追加, 当然你也可以在模板中定义其他占位符, 但一定要在head中靠前的位置

运行时对于支持webp格式的 window.__detect_webp__ 为true

```
