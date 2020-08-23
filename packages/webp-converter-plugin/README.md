##### webp-converter-plugin

##### npm i webp-converter-plugin
```
const webpConverterPlugin = require('webp-converter-plugin);

plugins: [
  new webpConverterPlugin();
]

其中 xxxx 是生成的 hash, 现在可能在mac上只支持mac os 10.15之后的版本, 正在修复
自动转化成webp格式的插件, 会将 test.xxxx.png => test.xxxx.png.webp

```