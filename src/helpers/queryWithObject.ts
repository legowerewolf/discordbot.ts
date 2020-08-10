/* eslint-disable no-mixed-spaces-and-tabs */

export function queryWithObject(source: any, query: any): any {
	if (source instanceof Array) {
		if (query === null) {
			// If the query is null, return the full array
			return source;
		}
		return Object.keys(query).reduce((accum, indexstr) => {
			// Otherwise build a sparse array of the queried values
			accum[Number(indexstr)] = source[Number(indexstr)];
			return accum;
		}, []);
	} else if (source instanceof Object) {
		return Object.entries(source)
			.filter((entry) => Object.keys(query).indexOf(entry[0]) != -1)
			.map((entry) => (typeof entry[1] == "object" ? [entry[0], queryWithObject(entry[1], query[entry[0]])] : entry))
			.reduce((accum, cur) => {
				return { ...accum, [cur[0]]: cur[1] };
			}, {});
	}
}
