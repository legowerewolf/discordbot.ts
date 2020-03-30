import ms from "ms";

export default class Duration {
	private time: number;

	constructor(time: string | number) {
		const casts = {
			number: (t: number): number => t,
			string: (t: string): number => ms(t),
		};

		// @ts-ignore: Checked at the constructor level.
		this.time = casts[typeof time](time);
	}

	get ms(): number {
		return this.time;
	}

	get secs(): number {
		return this.time / 1000;
	}
}
