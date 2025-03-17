'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var msgpack = require('@msgpack/msgpack');
var pako = require('pako');

function _interopDefault(e) {
  return e && e.__esModule ? e : { default: e };
}

var pako__default = /*#__PURE__*/ _interopDefault(pako);

// src/index.ts
function fromPackValue(v) {
  if (!Array.isArray(v) || v.length !== 2) {
    throw new Error('Bad pack value format');
  }
  const [meta, value] = v;
  if (!Array.isArray(meta) || !meta.every(a => Array.isArray(a))) {
    throw new Error('Bad pack value meta format');
  }
  return convertValue(value);
  function convertValue(v2) {
    switch (typeof v2) {
      case 'object':
        if (Array.isArray(v2)) {
          if (v2.length < 1) {
            throw new Error('Bad pack array value');
          }
          const tag = v2[0];
          if (Array.isArray(tag)) {
            const r2 = {};
            for (let i = 0; i < tag.length; i++) {
              let key = tag[i];
              if (typeof key === 'number') {
                key = meta[0][-key - 1];
              }
              r2[key] = convertValue(v2[i + 1]);
            }
            return r2;
          }
          if (tag === 0) {
            return v2.slice(1).map(convertValue);
          }
          if (tag < 0) {
            return meta[0][-tag - 1];
          }
          const r = {};
          const fields = meta[tag];
          for (let i = 0; i < fields.length; i++) {
            r[fields[i]] = convertValue(v2[i + 1]);
          }
          return r;
        }
        return v2;
      default:
        return v2;
    }
  }
}
async function unpack(data) {
  const res = await fetch(`data:application/octet-stream;base64,${data}`);
  const buf = await res.arrayBuffer();
  let decompressed;
  try {
    decompressed = pako__default.default.inflate(new Uint8Array(buf));
  } catch (error) {
    console.error('Decompression failed:', error);
    throw error;
  }
  try {
    const blob = new Blob([decompressed]);
    const buffer = await blob.arrayBuffer();
    const r = msgpack.decode(buffer);
    return fromPackValue(r);
  } catch (error) {
    console.error('Decoding failed:', error);
    throw error;
  }
}
function toPackValueWithMeta(meta, metamap, key, value) {
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
          ...value.map(v => toPackValueWithMeta(meta, metamap, void 0, v)),
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
        ...keys.map(key2 =>
          toPackValueWithMeta(meta, metamap, key2, value[key2]),
        ),
      ];
    }
    default:
      return value;
  }
}
function toPackValue(v) {
  const meta = [[]];
  const value = toPackValueWithMeta(meta, {}, void 0, v);
  return [meta, value];
}
async function pack(v) {
  const packed = toPackValue(v);
  const mp = msgpack.encode(packed);
  const compressed = pako__default.default.gzip(mp);
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
var index_default = { pack, unpack };

exports.default = index_default;
exports.pack = pack;
exports.unpack = unpack;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map
