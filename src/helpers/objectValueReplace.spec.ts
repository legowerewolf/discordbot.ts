import { expect } from "chai";
import "mocha";
import { objectValueReplace } from "./objectValueReplace";

describe("helpers", () => {
	describe("objectValueReplace", () => {
		it("should return empty", () => {
			expect(objectValueReplace({}, null, "one")).to.deep.equal({});
		});
		it("should replace null => one", () => {
			expect(objectValueReplace({ one: null }, null, "one")).to.deep.equal({ one: "one" });
		});
		it("should replace one => two", () => {
			expect(objectValueReplace({ one: "one" }, "one", "two")).to.deep.equal({ one: "two" });
		});
		it("should replace one => three", () => {
			expect(objectValueReplace({ one: { two: null } }, null, "three")).to.deep.equal({ one: { two: "three" } });
		});
	});
});
