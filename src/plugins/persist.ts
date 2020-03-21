import { Firestore, Timestamp } from "@google-cloud/firestore";
import { DiscordBot } from "../typedef/DiscordBot";
import { Plugin } from "../typedef/Plugin";

interface Config {
	keyPath: string;
}

export default class Persist extends Plugin<Config> {
	static defaultConfig: Config = {
		keyPath: "",
	};

	db: Firestore;

	constructor(_config?: Config) {
		super(_config);
		this.db = new Firestore({ keyFilename: this.config.keyPath });
	}

	inject(context: DiscordBot): void {
		this.db
			.collection("stats")
			.doc("bot")
			.set({ bootTime: Timestamp.fromDate(new Date()) }, { merge: true });
	}

	extract(): void {
		this.db.terminate();
	}
}
