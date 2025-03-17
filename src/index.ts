/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { decode, encode } from '@msgpack/msgpack';
import pako from 'pako';

type Meta = string[][];
type MetaMap = { [key: string]: number };

function fromPackValue(v: unknown): unknown {
  if (!Array.isArray(v) || v.length !== 2) {
    throw new Error('Bad pack value format');
  }
  const [meta, value] = v;
  if (!Array.isArray(meta) || !meta.every(a => Array.isArray(a))) {
    throw new Error('Bad pack value meta format');
  }

  return convertValue(value);

  function convertValue(v: unknown): unknown {
    switch (typeof v) {
      case 'object':
        if (Array.isArray(v)) {
          if (v.length < 1) {
            throw new Error('Bad pack array value');
          }
          const tag = v[0];
          if (Array.isArray(tag)) {
            const r: Record<string, unknown> = {};
            for (let i = 0; i < tag.length; i++) {
              let key = tag[i];
              if (typeof key === 'number') {
                key = meta[0][-key - 1];
              }
              r[key] = convertValue(v[i + 1]);
            }
            return r;
          }
          if (tag === 0) {
            return v.slice(1).map(convertValue);
          }
          if (tag < 0) {
            return meta[0][-tag - 1];
          }
          const r: Record<string, unknown> = {};
          const fields = meta[tag];
          for (let i = 0; i < fields.length; i++) {
            r[fields[i]] = convertValue(v[i + 1]);
          }
          return r;
        }
        return v;
      default:
        return v;
    }
  }
}

async function unpack(data: string): Promise<unknown> {
  // 创建一个 data URL 并获取原始数据
  const res = await fetch(`data:application/octet-stream;base64,${data}`);
  const buf = await res.arrayBuffer();

  // 使用 pako 解压 ArrayBuffer 数据
  let decompressed: Uint8Array;
  try {
    decompressed = pako.inflate(new Uint8Array(buf));
  } catch (error) {
    console.error('Decompression failed:', error);
    throw error;
  }

  // 修改这部分代码，避免使用 ReadableStream
  try {
    const blob = new Blob([decompressed]);
    const buffer = await blob.arrayBuffer();
    const r = decode(buffer);
    return fromPackValue(r);
  } catch (error) {
    console.error('Decoding failed:', error);
    throw error;
  }
}

function toPackValueWithMeta(
  meta: Meta,
  metamap: MetaMap,
  key: string | undefined,
  value: unknown,
): unknown {
  switch (typeof value) {
    case 'string':
      return value;
    case 'object': {
      if (value === null) {
        return null;
      }
      if (Array.isArray(value)) {
        return [
          0,
          ...value.map(v =>
            toPackValueWithMeta(
              meta,
              metamap,
              undefined,
              v,
            ),
          ),
        ];
      }
      const keys = Object.keys(value);
      keys.sort();
      const mapk = keys.join(',');
      let metaindex = metamap[mapk];
      if (!metaindex) {
        metaindex = meta.length;
        metamap[mapk] = metaindex;
        meta.push(keys);
      }
      return [
        metaindex,
        ...keys.map(key =>
          toPackValueWithMeta(
            meta,
            metamap,
            key,
            value[key],
          ),
        ),
      ];
    }
    default:
      return value;
  }
}

function toPackValue(
  v: unknown,
): [Meta, unknown] {
  const meta: Meta = [[]];
  const value = toPackValueWithMeta(
    meta,
    {},
    undefined,
    v,
  );
  return [meta, value];
}

/**
 * 将一个对象进行压缩序列化
 * @param v - 要序列化的对象
 * @returns 压缩后的数据，以base64字符串的形式表示
 */
async function pack(
  v: unknown,
): Promise<string> {
  const packed = toPackValue(v);
  const mp = encode(packed);

  const compressed = pako.gzip(mp);
  const blob = new Blob([compressed]);

  if (typeof window !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          resolve(result.split(',')[1]);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }
  const buffer = await blob.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

export { pack, unpack };
export default { pack, unpack }; 