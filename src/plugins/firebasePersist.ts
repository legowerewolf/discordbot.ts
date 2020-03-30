import { Firestore, Timestamp } from "@google-cloud/firestore";
import { promiseRetry } from "../helpers/promiseRetry";
import { queryWithObject } from "../helpers/queryWithObject";
import { DiscordBot } from "../typedef/DiscordBot";
import { PersistenceProvider } from "../typedef/PersistenceProvider";
import { Plugin } from "../typedef/Plugin";

interface Config {
	keyPath: string; // Where the Firestore service account JSON keyfile is, relative to the start directory.
}

/**
 * Adds Firebase's Firestore cloud database as a persistence provider for the bot.
 * Does nothing except provide a read/write interface for the database.
 */
export default class FirebasePersistPlugin extends Plugin<Config> implements PersistenceProvider {
	static defaultConfig: Config = {
		keyPath: "",
	};

	private db: Firestore;
	private context: DiscordBot;

	constructor(_config?: Config) {
		super(_config);
		if (this.config.keyPath === "") throw new Error("Firestore keypath missing. Please configure or disable Firestore persistence.");
		this.db = new Firestore({ keyFilename: this.config.keyPath });
	}

	inject(context: DiscordBot): void {
		this.db
			.collection("stats")
			.doc("bot")
			.set({ bootTime: Timestamp.fromDate(new Date()) }, { merge: true });

		this.context = context;

		this.context.persister = this;
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

	async writeUser(userID: string, data: object): Promise<Date> {
		return promiseRetry(
			() => {
				return this.db
					.collection("users")
					.doc(userID)
					.set(data, { merge: true })
					.then((result) => result.writeTime.toDate());
			},
			{ description: `firebase write on user ${userID}`, console: this.context.console }
		);
	}
}
