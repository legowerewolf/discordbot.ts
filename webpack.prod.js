const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = merge(common, {
	mode: "production",
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					keep_classnames: true,
				},
			}),
		],
	},
	plugins: [
		new CopyWebpackPlugin(
			Object.keys(common.externals).map((key) => {
				return { from: `./node_modules/${key}`, to: `../node_modules/${key}` };
			})
		),
	],
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "build/dist/app"),
	},
});
