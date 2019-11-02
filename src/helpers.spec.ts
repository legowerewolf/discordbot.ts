import { expect } from "chai";
import "mocha";
import { getPropertySafe, valuesOf } from "./helpers";

describe("helpers", () => {
	describe("getPropertySafe", () => {
		const testObj = { a: { b: { c: true } } };
		it("should return true", () => {
			expect(getPropertySafe(testObj, ["a", "b", "c"])).to.equal(true);
		});
		it("should be undefined", () => {
			expect(getPropertySafe(testObj, ["a", "c"]));
		});
	});

	describe("valuesOf", () => {
		it("should return [1,2,3]", () => {
			expect(valuesOf({ one: 1, two: 2, three: 3 })).to.deep.equal([1, 2, 3]);
		});
	});
});
