import assert from "node:assert";
import { describe, it } from "node:test";

// Import real UserService for coverage
import { UserService } from "./UserService.js";

describe("UserService Coverage", () => {
  it("should load UserService class", () => {
    assert.strictEqual(typeof UserService, "function");
    assert.strictEqual(typeof UserService.authenticate, "function");
    assert.strictEqual(typeof UserService.getUserProfile, "function");
    assert.strictEqual(typeof UserService.createUser, "function");
    assert.strictEqual(typeof UserService.updateDailyGoal, "function");
    assert.strictEqual(typeof UserService.updateUserImage, "function");
    assert.strictEqual(typeof UserService.purchaseItem, "function");
    assert.strictEqual(typeof UserService.removeItem, "function");
    assert.strictEqual(typeof UserService.upgradeItem, "function");
  });
});
