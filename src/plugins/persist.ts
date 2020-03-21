import { Firestore } from "@google-cloud/firestore";
import { DiscordBot } from "../typedef/DiscordBot";
import { Plugin } from "../typedef/Plugin";
import { Vocab } from "../typedef/Vocab";

interface Config {
	keyPath: string;
}

export default class Persist extends Plugin<Config> {
	static defaultConfig: Config = {
		keyPath: "",
	};

	db: Firestore;

	inject(context: DiscordBot): void {
		console.log("Prepping Firestore instance");
		this.db = new Firestore({ keyFilename: this.config.keyPath });

		context.console("Firestore should be connected", Vocab.Info);
	}

	extract(): void {
		this.db.terminate();
	}
}
