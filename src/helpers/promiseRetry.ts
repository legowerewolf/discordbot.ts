import ratlog, { Ratlogger } from "ratlog";
import { Vocab } from "../typedef/Vocab";

export const Backoffs: { [key: string]: (arg0: number, arg1: number) => number } = {
	linear: (last, factor) => last + factor,
};

export function promiseRetry<T>(
	promise: () => Promise<T>,
	opts?: {
		backoff?: (last: number, factor: number) => number;
		factor?: number;
		maxDelay?: number;
		delay?: number;
		description?: string;
		console?: Ratlogger;
	}
): Promise<T> {
	opts = { backoff: Backoffs.linear, factor: 5000, maxDelay: 30000, delay: 0, description: "unnamed promise", console: ratlog(console.log), ...opts };
	return new Promise((resolve) => {
		promise().then(
			(success: T) => {
				opts.console(`Succeeded ${opts.description}`, "promise retry", Vocab.Info);
				resolve(success);
			},
			(reason) => {
				const backoff = Math.min(opts.backoff(opts.delay, opts.factor), opts.maxDelay);
				opts.console(`Failed ${opts.description} (${reason}) (Retrying in ${backoff}ms.)`, "promise retry", Vocab.Error);
				setTimeout(() => {
					resolve(promiseRetry(promise, { ...opts, delay: backoff }));
				}, backoff);
			}
		);
	});
}
