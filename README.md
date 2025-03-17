# json-string-pack

[![npm version](https://badge.fury.io/js/json-string-pack.svg)](https://badge.fury.io/js/json-string-pack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个高效的 JSON 字符串压缩工具，特别适用于包含大量重复字符串的 JSON 数据。该库使用 MessagePack 和 GZIP 压缩算法，可以显著减小数据大小。

## 特性

- 🚀 高效压缩：使用 MessagePack 和 GZIP 双重压缩
- 🔄 字符串去重：自动检测和优化重复字符串
- 💪 类型支持：完整的 TypeScript 类型定义
- 🌐 跨平台：支持浏览器和 Node.js 环境
- 📦 轻量级：最小化的依赖

## 安装

```bash
npm install json-string-pack
```

## 使用方法

### ESM 方式导入

```js
import { pack, unpack } from 'json-string-pack';

// 压缩数据
const data = {
  users: [
    { name: 'Alice', role: 'admin' },
    { name: 'Bob', role: 'admin' },
  ],
};

const compressed = await pack(data);
console.log(compressed); // 输出 base64 编码的压缩数据

// 解压数据
const decompressed = await unpack(compressed);
console.log(decompressed); // 输出原始对象
```

### CommonJS 方式导入

```js
const { pack, unpack } = require('json-string-pack');

// 使用方法同上
```

## API 文档

### pack(value: Object): Promise\<string\>

将 JavaScript 对象压缩为 base64 字符串。

参数：

- `value`: 要压缩的数据, json 格式的对象或数组

返回：

- Promise\<string\>: base64 编码的压缩数据

### unpack(data: string): Promise\<Object\>

将压缩的 base64 字符串解压为原始数据。

参数：

- `data`: base64 编码的压缩数据

返回：

- Promise\<Object\>: 解压后的原始数据

## 性能优化建议

1. 对于如果**数据量较小或者字符串基本不重复**，使用该库反而会导致体积增加；
2. 如果数据量较大，建议在 Web Worker 中进行压缩/解压操作；
3. 考虑使用流式处理来处理超大数据集；
4. 解压后的对象的属性顺序不能保证。

## 贡献指南

欢迎提交 Issue 和 Pull Request！在提交 PR 之前，请确保：

1. 添加/更新测试用例
2. 通过所有测试
3. 更新相关文档
4. 遵循代码风格指南

## 许可证

MIT
