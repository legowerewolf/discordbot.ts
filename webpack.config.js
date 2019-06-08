const path = require("path");

module.exports = {
	entry: {
		shard: "./src/discordbot.ts",
		spawner: "./src/shard-manager.ts",
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
	resolve: {
		extensions: [".ts", ".tsx", ".json", ".js"],
	},
	target: "node",
	mode: "development",
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "build"),
	},
};
