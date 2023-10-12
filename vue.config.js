module.exports = {
    devServer: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
      // open: process.platform === 'darwin',
      // host: '0.0.0.0',
      // port: 8085,
      // https: true,
    },
  };