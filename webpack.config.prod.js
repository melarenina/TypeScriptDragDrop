const path = require('path'); // Building a absolute path
const CleanPlugin = require('clean-webpack-plugin');

module.exports = { // How to export something in a node.js environment
    mode: 'production',
    entry: './src/app.ts', // Which file shoudl be executed first
    output: {
        filename: 'bundle.js', // Single JS file that will be produced in the end
        path: path.resolve(__dirname, 'dist')
    }, 
    devtool: 'none', 
    module: {
        rules: [ // Loader is a package that tells webpack how to deal with files
            {
                test:/\.ts$/, // Checking for files that ends with .ts
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: { // Which file extensions it adds the to files it finds
        extensions: ['.ts', '.js'] // Will bundle all files that have these extensions
    },
    plugins: [
        new CleanPlugin.CleanWebpackPlugin()
    ]
 }; 