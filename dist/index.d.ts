declare function unpack(data: string): Promise<unknown>;
/**
 * 将一个对象进行压缩序列化
 * @param v - 要序列化的对象
 * @returns 压缩后的数据，以base64字符串的形式表示
 */
declare function pack(v: unknown): Promise<string>;

declare const _default: {
    pack: typeof pack;
    unpack: typeof unpack;
};

export { _default as default, pack, unpack };
