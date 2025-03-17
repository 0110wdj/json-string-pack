const { pack, unpack } = require('json-string-pack');

// 压缩数据
const data = {
  users: [
    { name: 'Alice', role: 'admin' },
    { name: 'Bob', role: 'admin' },
  ],
};

// 使用 async/await
(async () => {
  const compressed = await pack(data);
  console.log(compressed); // 输出 base64 编码的压缩数据

  // 解压数据
  const decompressed = await unpack(compressed);
  console.log(decompressed); // 输出原始对象
})();
