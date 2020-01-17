const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { DefinePlugin } = require("webpack");
const packagejson = require("./package.json");
const childprocess = require("child_process");

module.exports = {
	entry: {
		shard: "./src/shard.ts",
		manager: "./src/shard-manager.ts",
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: "ts-loader",
			},
		],
	},
	plugins: [
		new CleanWebpackPlugin(), // Clean the build directory
		new DefinePlugin({
			META_VERSION: JSON.stringify(packagejson.version),
			META_HASH: JSON.stringify(
				childprocess
					.execSync("git rev-parse --short HEAD")
					.toString()
					.trim()
			),
		}),
	],
	resolve: {
		mainFields: ["main", "module"],
		extensions: [".ts", ".tsx", ".json", ".js"],
	},
	target: "node",
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "build"),
	},
	devtool: "source-map",
};
