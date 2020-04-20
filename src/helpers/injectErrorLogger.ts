import { stripIndents } from "common-tags";
import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import { META_HASH, META_VERSION } from "./helpers";
export function injectErrorLogger(): void {
	process.addListener("uncaughtException", async (error) => {
		const path = `./fatals/${Date.now()}.log`;
		console.error(`Fatal error. See crash dump: ${path}`);
		mkdirSync(dirname(path), { recursive: true });
		writeFileSync(
			path,
			[
				`Version: v${await META_VERSION} / ${await META_HASH}`,
				`Error: ${error.name}: ${error.message}`,
				stripIndents`
					Trace:
					${error.message}
					${error.stack}
				`,
			].join("\n\n")
		);
		process.exit(1);
	});
}
