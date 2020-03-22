export function randomElementFromArray<T>(array: Array<T>): T {
	return array[Math.floor(Math.random() * array.length)];
}
export function valuesOf<T>(obj: { [key: string]: T }): T[] {
	return Object.keys(obj).map((prop: string) => obj[prop]);
}
