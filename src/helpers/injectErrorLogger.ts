import { stripIndents } from "common-tags";
import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import { META_HASH, META_VERSION } from "./helpers";
export function injectErrorLogger(): void {
	process.addListener("uncaughtException", (error) => {
		const path = `./fatals/${Date.now()}.log`;
		console.error(`Fatal error. See crash dump: ${path}`);
		mkdirSync(dirname(path), { recursive: true });
		writeFileSync(
			path,
			[
				// The values for "META_VERSION" and "META_HASH" are filled in at build time.
				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore
				`Version: v${META_VERSION} / ${META_HASH}`,
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
