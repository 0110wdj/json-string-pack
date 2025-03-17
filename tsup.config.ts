import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  treeshake: true,
  target: 'es2020',
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.mjs',
    };
  },
  platform: 'neutral',
  external: ['@msgpack/msgpack', 'pako'],
  noExternal: [],
  esbuildOptions(options) {
    if (options.format === 'cjs') {
      options.footer = {
        js: 'if (module.exports.default) { Object.assign(module.exports, module.exports.default); }',
      };
    }
  },
});
