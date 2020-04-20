import { expect } from "chai";
import "mocha";
import { valuesOf } from "./objectsAndArrays";

describe("helpers", () => {
	describe("valuesOf", () => {
		it("should return [1,2,3]", () => {
			expect(valuesOf({ one: 1, two: 2, three: 3 })).to.deep.equal([1, 2, 3]);
		});
	});
});
