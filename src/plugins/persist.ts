import { Firestore, Timestamp } from "@google-cloud/firestore";
import { promiseRetry } from "../helpers/promiseRetry";
import { queryWithObject } from "../helpers/queryWithObject";
import { DiscordBot } from "../typedef/DiscordBot";
import { Plugin } from "../typedef/Plugin";

interface Config {
	keyPath: string;
}

export default class Persist extends Plugin<Config> {
	static defaultConfig: Config = {
		keyPath: "",
	};

	private db: Firestore;
	private context: DiscordBot;

	constructor(_config?: Config) {
		super(_config);
		this.db = new Firestore({ keyFilename: this.config.keyPath });
	}

	inject(context: DiscordBot): void {
		this.db
			.collection("stats")
			.doc("bot")
			.set({ bootTime: Timestamp.fromDate(new Date()) }, { merge: true });

		this.context = context;
	}

	extract(): void {
		this.db.terminate();
	}

	async readUser<T>(userID: string, query: T): Promise<T> {
		const userdoc = await this.db
			.collection("users")
			.doc(userID)
			.get()
			.then((docref) => docref.data());

		return userdoc != undefined ? queryWithObject(userdoc, query) : undefined;
	}

	async writeUser(userID: string, data: object): Promise<FirebaseFirestore.WriteResult> {
		return promiseRetry(
			() => {
				return this.db
					.collection("users")
					.doc(userID)
					.set(data, { merge: true });
			},
			{ description: `firebase write on user ${userID}`, console: this.context.console }
		);
	}
}
