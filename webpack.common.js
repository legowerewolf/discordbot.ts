const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { DefinePlugin } = require("webpack");
const packagejson = require("./package.json");
const childprocess = require("child_process");
const dependencyTree = require("dependency-tree");

const identifierHash = (identifier, short = true) =>
	childprocess
		.execSync(`git log -1 --pretty=tformat:%${short ? "h" : "H"} ${identifier}`)
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
	externals: ["@google-cloud/firestore"]
		.map((elem) => [
			elem,
			...dependencyTree
				.toList({
					filename: `./node_modules/${elem}/${require(`./node_modules/${elem}/package.json`).main}`,
					directory: ".",
				})
				.map((elem) => elem.match(/node_modules[\/\\]*([@\w-\.]*)/)[1]), //get the dep name
		])
		.reduce((accum, cur) => [...accum, ...cur], []) // flatten
		.filter((item, index, arr) => arr.indexOf(item) == index) // dedupe
		.reduce((accum, cur) => {
			return { ...accum, [cur]: `commonjs ${cur}` };
		}, {}),
	devtool: "source-map",
};
