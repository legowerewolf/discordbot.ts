import { expect } from "chai";
import "mocha";
import { queryWithObject } from "./queryWithObject";

const source = {
	stringval: "hello",
	numval: 4.238,
	oval: {
		nestedstring: "again",
	},
	arr: ["one", "two", "three"],
};

describe("helpers", () => {
	describe("queryWithObject", () => {
		it("empty query", () => {
			expect(queryWithObject(source, {})).to.deep.equal({});
		});
		it("root vals", () => {
			expect(queryWithObject(source, { stringval: null, numval: null })).to.deep.equal({ stringval: "hello", numval: 4.238 });
		});
		it("nested obj vals", () => {
			expect(queryWithObject(source, { oval: { nestedstring: null } })).to.deep.equal({ oval: { nestedstring: "again" } });
		});
		it("sparse arr vals", () => {
			expect(
				queryWithObject(source, {
					arr: {
						0: null,
						2: null,
					},
				})
				// eslint-disable-next-line no-sparse-arrays
			).to.deep.equal({ arr: ["one", , "three"] });
		});
	});
});
