import { expect } from "chai";
import VoiceScaling from "./voice-scaling";

describe("voice-scaling", () => {
	describe("new key generation", () => {
		it("should return 1", () => {
			expect(VoiceScaling.newIndex([])).to.equal(1);
		});

		it("should return 3", () => {
			expect(VoiceScaling.newIndex([1, 2, 4, 5])).to.equal(3);
		});
	});
});
