/**
 * ========================================
 * CONFIGURAÇÃO DO WEBPACK
 * ========================================
 * 
 * Configuração para build e desenvolvimento do frontend
 * Inclui:
 * - Bundling de JavaScript e CSS
 * - Hot reloading para desenvolvimento
 * - Otimizações para produção
 * - Proxy para API do backend
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // Modo de desenvolvimento (pode ser alterado para 'production')
    mode: 'development',
    
    // Ponto de entrada da aplicação
    entry: {
        main: './src/frontend/js/app.js'
    },
    
    // Configuração de saída dos arquivos bundled
    output: {
        filename: '[name].[contenthash].js', // Nome com hash para cache busting
        path: path.resolve(__dirname, 'dist'), // Diretório de saída
        clean: true, // Limpa o diretório dist antes de cada build
        publicPath: '/static/' // Caminho público dos assets
    },
    
    // Configuração do servidor de desenvolvimento
    devServer: {
        contentBase: path.join(__dirname, 'dist'), // Diretório base
        compress: true, // Compressão gzip
        port: 8080, // Porta do dev server
        hot: true, // Hot module replacement
        open: true, // Abre navegador automaticamente
        // Proxy para redirecionar chamadas da API para o backend
        proxy: {
            '/api': {
                target: 'http://localhost:3000', // URL do backend
                changeOrigin: true
            }
        }
    },
    
    // Configuração de loaders para diferentes tipos de arquivo
    module: {
        rules: [
            // Loader para JavaScript/ES6+ com Babel
            {
                test: /\.js$/, // Arquivos .js
                exclude: /node_modules/, // Exclui node_modules
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'] // Preset para ES6+
                    }
                }
            },
            
            // CSS
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            },
            
            // Imagens
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'images/[hash][ext][query]'
                }
            },
            
            // Fontes
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[hash][ext][query]'
                }
            }
        ]
    },
    
    // Plugins
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/frontend/index.html',
            filename: 'index.html',
            inject: 'body',
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            }
        })
    ],
    
    // Configuração de resolução
    resolve: {
        extensions: ['.js', '.json'],
        alias: {
            '@': path.resolve(__dirname, 'src/frontend'),
            '@js': path.resolve(__dirname, 'src/frontend/js'),
            '@css': path.resolve(__dirname, 'src/frontend/css')
        }
    },
    
    // Configuração de otimização
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    },
    
    // Source maps para desenvolvimento
    devtool: 'eval-source-map'
};
