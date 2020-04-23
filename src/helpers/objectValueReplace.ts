export function objectValueReplace(obj: Object, seekVal: any, replaceVal: any) {
	return Object.entries(obj)
		.map((k) => {
			if (k[1] instanceof Object) k[1] = objectValueReplace(k[1], seekVal, replaceVal);
			else if (k[1] === seekVal) k[1] = replaceVal;
			return k;
		})
		.reduce((accum, kv) => {
			return { ...accum, ...{ [kv[0]]: kv[1] } };
		}, {} as any);
}
