import { pack, unpack } from '../index';

describe('json-string-pack', () => {
  describe('pack and unpack', () => {
    it('should correctly handle basic types', async () => {
      const testCases = [42, 'hello', true, null, [1, 2, 3], { a: 1, b: 2 }];

      for (const testCase of testCases) {
        const packed = await pack(testCase);
        expect(typeof packed).toBe('string');
        const unpacked = await unpack(packed);
        expect(unpacked).toEqual(testCase);
      }
    });

    it('should handle nested objects', async () => {
      const data = {
        users: [
          { name: 'Alice', role: 'admin' },
          { name: 'Bob', role: 'user' },
        ],
        settings: {
          theme: 'dark',
          notifications: true,
        },
      };

      const packed = await pack(data);
      const unpacked = await unpack(packed);
      expect(unpacked).toEqual(data);
    });

    it('should optimize repeated strings with packStringKeys', async () => {
      const data = {
        items: [
          { type: 'book', category: 'fiction' },
          { type: 'book', category: 'fiction' },
          { type: 'book', category: 'science' },
        ],
      };

      const packedWithoutOpt = await pack(data);
      const packedWithOpt = await pack(data, {
        type: true,
        category: true,
      });

      expect(packedWithOpt.length).toBeLessThan(packedWithoutOpt.length);

      const unpackedWithOpt = await unpack(packedWithOpt);
      expect(unpackedWithOpt).toEqual(data);
    });

    it('should throw error for invalid input', async () => {
      const invalidBase64 = 'invalid-base64-string';
      await expect(unpack(invalidBase64)).rejects.toThrow();
    });
  });
});
