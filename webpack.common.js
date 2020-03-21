const path = require("path");
const fs = require("fs");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { DefinePlugin } = require("webpack");
const NodemonPlugin = require("nodemon-webpack-plugin");
const packagejson = require("./package.json");
const childprocess = require("child_process");

const identifierHash = (identifier, short = true) =>
	childprocess
		.execSync(`git log -1 --pretty=tformat:%${short ? "h" : "H"} ${identifier}`)
		.toString()
		.trim();

var nodeModules = {};
fs.readdirSync("node_modules")
	.filter((x) => [".bin"].indexOf(x) === -1)
	.forEach(function(module) {
		nodeModules[module] = "commonjs " + module;
	});

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
		new NodemonPlugin({
			script: "./build/manager.js",
			watch: path.resolve("./build"),
		}),
	],
	resolve: {
		mainFields: ["main", "module"],
		extensions: [".ts", ".tsx", ".json", ".js"],
	},
	target: "node",
	externals: nodeModules,
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "build"),
	},
	devtool: "source-map",
};
