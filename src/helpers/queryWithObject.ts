/* eslint-disable no-mixed-spaces-and-tabs */

export function queryWithObject(source: any, query: any): any {
	return Array.isArray(source)
		? Object.keys(query).reduce((accum, indexstr) => {
				accum[Number(indexstr)] = source[Number(indexstr)];
				return accum;
		  }, [])
		: Object.entries(source)
				.filter((entry) => Object.keys(query).indexOf(entry[0]) != -1)
				.map((entry) => (typeof entry[1] == "object" ? [entry[0], queryWithObject(entry[1], query[entry[0]])] : entry))
				.reduce((accum, cur) => {
					return { ...accum, [cur[0]]: cur[1] };
				}, {});
}
