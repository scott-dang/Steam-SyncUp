import { addition } from "../App";
import assert from "assert";

describe("Calculator Tests", () => {
    it("should return 5 when 2 is added to 3", () => {
    const result = addition(2, 3);
    assert.equal(result, 5);
    });

    it("should not return 5 when 3 is added to 3", () => {
        const result = addition(3, 3);
        assert.notEqual(result, 5);
    });
});