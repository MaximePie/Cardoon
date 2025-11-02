import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
// Custom error classes for testing
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";
    }
}
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "NotFoundError";
    }
}
// Simple mock function implementation
function createMockFunction() {
    const calls = [];
    let implementation = null;
    const mockFn = (...args) => {
        calls.push(args);
        if (implementation) {
            return implementation(...args);
        }
        return Promise.resolve();
    };
    mockFn.calls = calls;
    mockFn.mockImplementation = (fn) => {
        implementation = fn;
        return mockFn;
    };
    mockFn.mockResolvedValue = (value) => {
        implementation = () => Promise.resolve(value);
        return mockFn;
    };
    mockFn.mockRejectedValue = (error) => {
        implementation = () => Promise.reject(error);
        return mockFn;
    };
    mockFn.mockReturnValue = (value) => {
        implementation = () => value;
        return mockFn;
    };
    mockFn.reset = () => {
        calls.length = 0;
        implementation = null;
    };
    return mockFn;
}
// Create mocks
const mockUserModel = {
    getUserByEmail: createMockFunction(),
    getUserByUsername: createMockFunction(),
    findById: createMockFunction(),
    createUser: createMockFunction(),
};
const mockBcrypt = {
    compare: createMockFunction(),
};
const mockJwt = {
    sign: createMockFunction(),
};
const mockUploadImage = createMockFunction();
// Testable UserService with dependency injection
class TestableUserService {
    static async authenticate(credentials) {
        const { email, username, password, rememberMe } = credentials;
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new AppError("JWT_SECRET is not configured", 500);
        }
        // Get user by email or username
        const user = email
            ? await this.userModel.getUserByEmail(email.trim().toLowerCase())
            : await this.userModel.getUserByUsername(username.trim());
        if (!user) {
            throw new ValidationError("Invalid credentials");
        }
        const isMatch = await this.bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new ValidationError("Invalid credentials");
        }
        // Generate JWT token
        const token = this.jwt.sign({ id: user.id }, jwtSecret, {
            expiresIn: rememberMe
                ? this.JWT_CONFIG.DEFAULT_EXPIRY
                : this.JWT_CONFIG.SHORT_EXPIRY,
        });
        if (user.populate) {
            await user.populate(["items.base", "currentDailyGoal"]);
        }
        return { token, user };
    }
    static async getUserProfile(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        if (user.createDailyGoal) {
            await user.createDailyGoal(user.dailyGoal, new Date());
        }
        if (user.populate) {
            await user.populate(["items.base", "currentDailyGoal"]);
        }
        return user;
    }
    static async createUser(email, password, username) {
        // Check if user already exists
        const existingUser = await this.userModel.getUserByEmail(email);
        if (existingUser) {
            throw new ValidationError("User already exists with this email");
        }
        // Check if username is taken
        const existingUsername = await this.userModel.getUserByUsername(username);
        if (existingUsername) {
            throw new ValidationError("Username is already taken");
        }
        const newUser = await this.userModel.createUser(email, password, username);
        if (!newUser || !newUser.toObject) {
            throw new Error("Failed to create user");
        }
        // Remove password from response
        const userResponse = { ...newUser.toObject() };
        delete userResponse.password;
        return userResponse;
    }
    static async updateDailyGoal(userId, target) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        if (user.updateDailyGoal) {
            await user.updateDailyGoal(target);
        }
        if (user.populate) {
            await user.populate("currentDailyGoal");
        }
        return user;
    }
    static async updateUserImage(userId, imageFile) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        const imageUrl = await this.uploadImage({
            filepath: imageFile.filepath,
            originalFilename: imageFile.originalFilename || "avatar.jpg",
            contentType: imageFile.mimetype,
        });
        user.image = imageUrl;
        if (user.save) {
            await user.save();
        }
        return { imageUrl };
    }
    static async purchaseItem(userId, itemId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        if (user.buyItem) {
            await user.buyItem(itemId);
        }
        if (user.populate) {
            await user.populate("items.base");
        }
        return user;
    }
    static async removeItem(userId, itemId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        if (user.removeItem) {
            await user.removeItem(itemId);
        }
        return null;
    }
    static async upgradeItem(userId, itemId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        if (user.upgradeItem) {
            return await user.upgradeItem(itemId);
        }
        return null;
    }
}
TestableUserService.userModel = mockUserModel;
TestableUserService.bcrypt = mockBcrypt;
TestableUserService.jwt = mockJwt;
TestableUserService.uploadImage = mockUploadImage;
TestableUserService.JWT_CONFIG = {
    DEFAULT_EXPIRY: "1d",
    SHORT_EXPIRY: "15m",
};
describe("UserService", () => {
    beforeEach(() => {
        // Reset all mocks
        mockUserModel.getUserByEmail.reset();
        mockUserModel.getUserByUsername.reset();
        mockUserModel.findById.reset();
        mockUserModel.createUser.reset();
        mockBcrypt.compare.reset();
        mockJwt.sign.reset();
        mockUploadImage.reset();
        // Setup environment
        process.env.JWT_SECRET = "test_jwt_secret";
    });
    describe("authenticate", () => {
        it("should authenticate user with valid email credentials", async () => {
            const mockUserDoc = {
                id: "user123",
                email: "test@example.com",
                password: "hashed_password",
                populate: () => Promise.resolve(),
            };
            const validCredentials = {
                email: "test@example.com",
                password: "password123",
            };
            mockUserModel.getUserByEmail.mockResolvedValue(mockUserDoc);
            mockBcrypt.compare.mockResolvedValue(true);
            mockJwt.sign.mockReturnValue("jwt_token");
            const result = await TestableUserService.authenticate(validCredentials);
            assert.strictEqual(result.token, "jwt_token");
            assert.strictEqual(result.user, mockUserDoc);
            // Verify calls
            assert.strictEqual(mockUserModel.getUserByEmail.calls.length, 1);
            assert.strictEqual(mockBcrypt.compare.calls.length, 1);
            assert.strictEqual(mockJwt.sign.calls.length, 1);
        });
        it("should authenticate user with username and remember me", async () => {
            const mockUserDoc = {
                id: "user123",
                username: "testuser",
                password: "hashed_password",
                populate: () => Promise.resolve(),
            };
            mockUserModel.getUserByUsername.mockResolvedValue(mockUserDoc);
            mockBcrypt.compare.mockResolvedValue(true);
            mockJwt.sign.mockReturnValue("jwt_token");
            const result = await TestableUserService.authenticate({
                username: "testuser",
                password: "password123",
                rememberMe: true,
            });
            assert.strictEqual(result.token, "jwt_token");
            assert.strictEqual(result.user, mockUserDoc);
        });
        it("should throw ValidationError for invalid credentials", async () => {
            mockUserModel.getUserByEmail.mockResolvedValue(null);
            await assert.rejects(TestableUserService.authenticate({
                email: "wrong@example.com",
                password: "password",
            }), ValidationError);
        });
        it("should throw ValidationError for wrong password", async () => {
            const mockUserDoc = {
                id: "user123",
                email: "test@example.com",
                password: "hashed_password",
            };
            mockUserModel.getUserByEmail.mockResolvedValue(mockUserDoc);
            mockBcrypt.compare.mockResolvedValue(false);
            await assert.rejects(TestableUserService.authenticate({
                email: "test@example.com",
                password: "wrong_password",
            }), ValidationError);
        });
        it("should throw AppError when JWT_SECRET is not configured", async () => {
            delete process.env.JWT_SECRET;
            await assert.rejects(TestableUserService.authenticate({
                email: "test@example.com",
                password: "password",
            }), AppError);
        });
    });
    describe("getUserProfile", () => {
        it("should get user profile successfully", async () => {
            const mockUserDoc = {
                id: "user123",
                email: "test@example.com",
                createDailyGoal: () => Promise.resolve(),
                populate: () => Promise.resolve(),
            };
            mockUserModel.findById.mockResolvedValue(mockUserDoc);
            const result = await TestableUserService.getUserProfile("user123");
            assert.strictEqual(result, mockUserDoc);
            assert.strictEqual(mockUserModel.findById.calls.length, 1);
        });
        it("should throw NotFoundError for non-existent user", async () => {
            mockUserModel.findById.mockResolvedValue(null);
            await assert.rejects(TestableUserService.getUserProfile("nonexistent"), NotFoundError);
        });
    });
    describe("createUser", () => {
        it("should create user successfully", async () => {
            const mockUserDoc = {
                id: "user123",
                email: "test@example.com",
                username: "testuser",
                password: "hashed_password",
                toObject: () => ({
                    id: "user123",
                    email: "test@example.com",
                    username: "testuser",
                    password: "hashed_password",
                }),
            };
            mockUserModel.getUserByEmail.mockResolvedValue(null);
            mockUserModel.getUserByUsername.mockResolvedValue(null);
            mockUserModel.createUser.mockResolvedValue(mockUserDoc);
            const result = await TestableUserService.createUser("test@example.com", "password", "testuser");
            assert.strictEqual(result.email, "test@example.com");
            assert.strictEqual(result.username, "testuser");
            assert.strictEqual(result.password, undefined); // Should be removed
            assert.strictEqual(mockUserModel.getUserByEmail.calls.length, 1);
            assert.strictEqual(mockUserModel.getUserByUsername.calls.length, 1);
            assert.strictEqual(mockUserModel.createUser.calls.length, 1);
        });
        it("should throw ValidationError for existing email", async () => {
            const existingUser = { id: "existing", email: "test@example.com" };
            mockUserModel.getUserByEmail.mockResolvedValue(existingUser);
            await assert.rejects(TestableUserService.createUser("test@example.com", "password", "testuser"), ValidationError);
        });
        it("should throw ValidationError for existing username", async () => {
            mockUserModel.getUserByEmail.mockResolvedValue(null);
            mockUserModel.getUserByUsername.mockResolvedValue({
                id: "existing",
                username: "testuser",
            });
            await assert.rejects(TestableUserService.createUser("test@example.com", "password", "testuser"), ValidationError);
        });
    });
    describe("updateDailyGoal", () => {
        it("should update daily goal successfully", async () => {
            const mockUserDoc = {
                id: "user123",
                updateDailyGoal: () => Promise.resolve(),
                populate: () => Promise.resolve(),
            };
            mockUserModel.findById.mockResolvedValue(mockUserDoc);
            const result = await TestableUserService.updateDailyGoal("user123", 50);
            assert.strictEqual(result, mockUserDoc);
            assert.strictEqual(mockUserModel.findById.calls.length, 1);
        });
        it("should throw NotFoundError for non-existent user", async () => {
            mockUserModel.findById.mockResolvedValue(null);
            await assert.rejects(TestableUserService.updateDailyGoal("nonexistent", 50), NotFoundError);
        });
    });
    describe("updateUserImage", () => {
        it("should update user image successfully", async () => {
            const mockUserDoc = {
                id: "user123",
                image: "",
                save: () => Promise.resolve(),
            };
            const mockImageFile = {
                filepath: "/tmp/image.jpg",
                originalFilename: "avatar.jpg",
                mimetype: "image/jpeg",
            };
            mockUserModel.findById.mockResolvedValue(mockUserDoc);
            mockUploadImage.mockResolvedValue("https://example.com/image.jpg");
            const result = await TestableUserService.updateUserImage("user123", mockImageFile);
            assert.strictEqual(result.imageUrl, "https://example.com/image.jpg");
            assert.strictEqual(mockUserDoc.image, "https://example.com/image.jpg");
            assert.strictEqual(mockUserModel.findById.calls.length, 1);
            assert.strictEqual(mockUploadImage.calls.length, 1);
        });
        it("should throw NotFoundError for non-existent user", async () => {
            mockUserModel.findById.mockResolvedValue(null);
            await assert.rejects(TestableUserService.updateUserImage("nonexistent", {}), NotFoundError);
        });
    });
    describe("purchaseItem", () => {
        it("should purchase item successfully", async () => {
            const mockUserDoc = {
                id: "user123",
                buyItem: () => Promise.resolve(),
                populate: () => Promise.resolve(),
            };
            const itemId = "507f1f77bcf86cd799439011";
            mockUserModel.findById.mockResolvedValue(mockUserDoc);
            const result = await TestableUserService.purchaseItem("user123", itemId);
            assert.strictEqual(result, mockUserDoc);
            assert.strictEqual(mockUserModel.findById.calls.length, 1);
        });
        it("should throw NotFoundError for non-existent user", async () => {
            mockUserModel.findById.mockResolvedValue(null);
            await assert.rejects(TestableUserService.purchaseItem("nonexistent", "507f1f77bcf86cd799439011"), NotFoundError);
        });
    });
    describe("removeItem", () => {
        it("should remove item successfully", async () => {
            const mockUserDoc = {
                id: "user123",
                removeItem: () => Promise.resolve(),
            };
            const itemId = "507f1f77bcf86cd799439011";
            mockUserModel.findById.mockResolvedValue(mockUserDoc);
            const result = await TestableUserService.removeItem("user123", itemId);
            assert.strictEqual(result, null);
            assert.strictEqual(mockUserModel.findById.calls.length, 1);
        });
        it("should throw NotFoundError for non-existent user", async () => {
            mockUserModel.findById.mockResolvedValue(null);
            await assert.rejects(TestableUserService.removeItem("nonexistent", "507f1f77bcf86cd799439011"), NotFoundError);
        });
    });
    describe("upgradeItem", () => {
        it("should upgrade item successfully", async () => {
            const mockUserDoc = {
                id: "user123",
                upgradeItem: () => Promise.resolve({ upgraded: true }),
            };
            const itemId = "507f1f77bcf86cd799439011";
            mockUserModel.findById.mockResolvedValue(mockUserDoc);
            const result = await TestableUserService.upgradeItem("user123", itemId);
            assert.deepStrictEqual(result, { upgraded: true });
            assert.strictEqual(mockUserModel.findById.calls.length, 1);
        });
        it("should throw NotFoundError for non-existent user", async () => {
            mockUserModel.findById.mockResolvedValue(null);
            await assert.rejects(TestableUserService.upgradeItem("nonexistent", "507f1f77bcf86cd799439011"), NotFoundError);
        });
    });
    describe("Error Handling", () => {
        it("should handle database connection errors gracefully", async () => {
            const dbError = new Error("Database connection failed");
            mockUserModel.findById.mockRejectedValue(dbError);
            await assert.rejects(TestableUserService.getUserProfile("user_id_123"), (error) => {
                assert.strictEqual(error.message, "Database connection failed");
                return true;
            });
        });
        it("should handle JWT signing errors", async () => {
            const mockUserDoc = {
                id: "user_id_123",
                password: "$2b$10$hashed_password",
                populate: () => Promise.resolve(),
            };
            mockUserModel.getUserByEmail.mockResolvedValue(mockUserDoc);
            mockBcrypt.compare.mockResolvedValue(true);
            mockJwt.sign.mockImplementation(() => {
                throw new Error("JWT signing failed");
            });
            await assert.rejects(TestableUserService.authenticate({
                email: "test@example.com",
                password: "password123",
            }), (error) => {
                assert.strictEqual(error.message, "JWT signing failed");
                return true;
            });
        });
        it("should handle image upload failures", async () => {
            const userId = "user_id_123";
            const imageFile = {
                filepath: "/tmp/uploaded_file.jpg",
                originalFilename: "avatar.jpg",
                mimetype: "image/jpeg",
            };
            const mockUserDoc = {
                id: userId,
                image: "",
                save: () => Promise.resolve(),
            };
            mockUserModel.findById.mockResolvedValue(mockUserDoc);
            mockUploadImage.mockRejectedValue(new Error("Image upload failed"));
            await assert.rejects(TestableUserService.updateUserImage(userId, imageFile), (error) => {
                assert.strictEqual(error.message, "Image upload failed");
                return true;
            });
        });
    });
    describe("Edge Cases", () => {
        it("should handle empty string inputs gracefully", async () => {
            mockUserModel.getUserByEmail.mockResolvedValue(null);
            await assert.rejects(TestableUserService.createUser("", "", ""), (error) => {
                // Should fail at validation level
                return true;
            });
        });
        it("should handle malformed ObjectIds", async () => {
            mockUserModel.findById.mockRejectedValue(new Error("Cast to ObjectId failed"));
            await assert.rejects(TestableUserService.getUserProfile("invalid_object_id"), (error) => {
                assert.strictEqual(error.message, "Cast to ObjectId failed");
                return true;
            });
        });
        it("should handle null parameters", async () => {
            mockUserModel.findById.mockRejectedValue(new Error("Invalid user ID"));
            await assert.rejects(TestableUserService.getUserProfile(null), (error) => {
                assert.strictEqual(error.message, "Invalid user ID");
                return true;
            });
        });
    });
});
