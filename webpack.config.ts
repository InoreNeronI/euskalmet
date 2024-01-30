// @see https://dev.to/oyemade/improve-performance-in-an-angular-app-using-brotli-and-gzip-text-compression-2p1e
import CompressionPlugin from 'compression-webpack-plugin';
import * as webpack from 'webpack';

export default (config: webpack.Configuration) => {
  config?.plugins?.push(new CompressionPlugin({ algorithm: 'gzip' }));
  return config;
};
