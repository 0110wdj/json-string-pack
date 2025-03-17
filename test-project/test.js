import { pack, unpack } from '../dist/index.mjs';

async function testLargeData() {
  const largeData = {
    users: Array(1000).fill(null).map((_, i) => ({
      id: i,
      name: `用户${i}`,
      role: "admin",
      status: "active",
      description: "这是一个测试用户，角色为管理员，状态为活跃。" // 重复的字符串
    }))
  };

  try {
    console.log("\n=== 大数据测试 ===");
    console.log("原始大数据大小:", JSON.stringify(largeData).length, "字节");
    
    const packed = await pack(largeData, { role: true, status: true, description: true });
    console.log("压缩后大数据大小:", packed.length, "字节");
    
    const unpacked = await unpack(packed);
    console.log("解压后大数据大小:", JSON.stringify(unpacked).length, "字节");

    console.log("大数据测试成功！（对象属性顺序不能保证。）");
  } catch (error) {
    console.error("大数据测试失败:", error);
  }
}

testLargeData(); 