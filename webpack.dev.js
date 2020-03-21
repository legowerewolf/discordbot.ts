const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");
const NodemonPlugin = require("nodemon-webpack-plugin");

module.exports = merge(common, {
	mode: "development",
	plugins: [
		new NodemonPlugin({
			script: "./app/manager.js",
			watch: path.resolve("./app"),
		}),
	],
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "app"),
	},
});
