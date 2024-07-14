import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: './source/cli.tsx',
  target: 'node',
  mode: 'production',
  experiments: {
    outputModule: true,
  },
  output: {
    filename: 'cli.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'module',
    },
    chunkFormat: 'module',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { modules: false, targets: { node: 'current' } }],
              '@babel/preset-react',
              '@babel/preset-typescript'
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
  },
};
