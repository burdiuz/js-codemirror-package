import serve from 'rollup-plugin-serve';

export default {
  input: 'virtual:serve',
  output: { file: '.rollup-serve.js', format: 'es' },
  onwarn(warning, warn) {
    if (warning.code !== 'EMPTY_BUNDLE') warn(warning);
  },
  plugins: [
    {
      name: 'virtual-serve-entry',
      resolveId(id) { if (id === 'virtual:serve') return id; },
      load(id) { if (id === 'virtual:serve') return ''; },
    },
    serve({
      contentBase: 'docs',
      port: 3000,
      open: true,
    }),
  ],
};
