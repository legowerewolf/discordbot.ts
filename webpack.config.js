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
	mode: "production",
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "build"),
	},
};
