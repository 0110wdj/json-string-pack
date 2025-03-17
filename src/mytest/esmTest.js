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
