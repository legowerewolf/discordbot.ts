const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { DefinePlugin } = require("webpack");
const packagejson = require("./package.json");
const childprocess = require("child_process");

const identifierHash = (identifier, short = true) =>
	childprocess
		.execSync(`git rev-parse ${short ? "--short" : ""} ${identifier}`)
		.toString()
		.trim();

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
			META_VERSION: JSON.stringify(`${packagejson.version}${identifierHash("HEAD") === identifierHash(`v${packagejson.version}`) ? "" : "+"}`),
			META_HASH: JSON.stringify(identifierHash("HEAD", true)),
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
