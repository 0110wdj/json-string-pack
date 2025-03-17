import { pack, unpack } from '../index.js';

describe('json-string-pack', () => {
  // 基础类型测试
  describe('基础类型测试', () => {
    const basicTypes = [
      ['数字', 42],
      ['字符串', 'hello world'],
      ['布尔值', true],
      ['null', null],
      ['空数组', []],
      ['空对象', {}],
    ] as const;

    test.each(basicTypes)('应该正确处理 %s', async (_, value) => {
      const packed = await pack(value);
      const unpacked = await unpack(packed);
      expect(unpacked).toEqual(value);
    });

    it('应该将 undefined 转换为 null（符合 JSON 标准）', async () => {
      const packed = await pack(undefined);
      const unpacked = await unpack(packed);
      expect(unpacked).toBeNull();
    });
  });

  // 复杂数据结构测试
  describe('复杂数据结构测试', () => {
    it('应该正确处理嵌套对象', async () => {
      const data = {
        user: {
          id: 1,
          profile: {
            name: '张三',
            age: 30,
            address: {
              city: '北京',
              street: '长安街',
            },
          },
          settings: {
            theme: 'dark',
            notifications: true,
          },
        },
      };

      const packed = await pack(data);
      const unpacked = await unpack(packed);
      expect(unpacked).toEqual(data);
    });

    it('应该正确处理复杂数组', async () => {
      const data = {
        items: [
          { id: 1, value: [1, 2, 3] },
          { id: 2, value: ['a', 'b', 'c'] },
          { id: 3, value: [true, false, null] },
        ],
        meta: {
          total: 3,
          tags: ['测试', '数组'],
        },
      };

      const packed = await pack(data);
      const unpacked = await unpack(packed);
      expect(unpacked).toEqual(data);
    });
  });

  // 压缩效果测试
  describe('压缩效果测试', () => {
    it('应该有效压缩重复字符串', async () => {
      const data = {
        users: Array(100).fill({
          role: '管理员',
          status: '活跃',
          description:
            '这是一段很长的描述文本，用于测试字符串压缩效果。这段文本会重复很多次。',
        }),
      };

      const originalSize = JSON.stringify(data).length;
      const packed = await pack(data);
      const compressionRatio = packed.length / originalSize;

      console.log('原始大小:', originalSize);
      console.log('压缩后大小:', packed.length);
      console.log('压缩比:', compressionRatio);

      expect(packed.length).toBeLessThan(originalSize);
      expect(compressionRatio).toBeLessThan(0.5); // 压缩比应小于 50%

      const unpacked = await unpack(packed);
      expect(unpacked).toEqual(data);
    });

    it('应该有效压缩大型数据集', async () => {
      const data = {
        records: Array(1000)
          .fill(null)
          .map((_, index) => ({
            id: index,
            timestamp: new Date().toISOString(),
            category: index % 2 === 0 ? '类型A' : '类型B',
            status: index % 3 === 0 ? '待处理' : '已完成',
            description: '这是记录的详细描述信息，包含一些重复的文本内容。',
          })),
      };

      const originalSize = JSON.stringify(data).length;
      const packed = await pack(data);
      const compressionRatio = packed.length / originalSize;

      console.log('大型数据集 - 原始大小:', originalSize);
      console.log('大型数据集 - 压缩后大小:', packed.length);
      console.log('大型数据集 - 压缩比:', compressionRatio);

      expect(packed.length).toBeLessThan(originalSize);
      expect(compressionRatio).toBeLessThan(0.5);

      const unpacked = await unpack(packed);
      expect(unpacked).toEqual(data);
    });
  });

  // 错误处理测试
  describe('错误处理测试', () => {
    it('应该正确处理无效的压缩数据', async () => {
      const invalidInputs = [
        '',
        'invalid-base64',
        'not-a-valid-packed-string',
        'abc123',
        Buffer.from([1, 2, 3, 4]).toString('base64'), // 无效的压缩数据
        Buffer.from('invalid data').toString('base64'), // 无效的压缩数据
      ];

      for (const input of invalidInputs) {
        try {
          await unpack(input);
          // 如果执行到这里，说明没有抛出错误
          throw new Error('应该抛出错误，但没有抛出');
        } catch (error) {
          expect(error).toBeTruthy();
          if (error instanceof Error) {
            expect(typeof error.message).toBe('string');
            expect(error.message.length).toBeGreaterThan(0);
          }
        }
      }
    });

    it('应该正确处理特殊字符', async () => {
      const data = {
        special: '!@#$%^&*()',
        chinese: '你好，世界！',
        emoji: '👋🌍🎉',
        mixed: '中文English123!@#$',
      };

      const packed = await pack(data);
      const unpacked = await unpack(packed);
      expect(unpacked).toEqual(data);
    });
  });
});
