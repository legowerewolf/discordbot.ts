const path = require("path");

module.exports = {
	entry: "./src/index.ts",
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
		filename: "index.js",
		path: path.resolve(__dirname, "build"),
	},
};
