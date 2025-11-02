import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError, ValidationError } from "../errors/index.js";
import { UserService } from "../services/UserService.js";

// Mock les dépendances externes
vi.mock("../models/User.js", () => ({
  default: {
    getUserByEmail: vi.fn(),
    getUserByUsername: vi.fn(),
    findById: vi.fn(),
    createUser: vi.fn(),
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock JWT_SECRET pour les tests
    process.env.JWT_SECRET = "test-secret";
  });

  describe("authenticate", () => {
    it("should throw ValidationError when email/username is missing", async () => {
      await expect(
        UserService.authenticate({ password: "test123" })
      ).rejects.toThrow(ValidationError);

      await expect(
        UserService.authenticate({ password: "test123" })
      ).rejects.toThrow("Email/Username and password are required");
    });

    it("should throw ValidationError when password is missing", async () => {
      await expect(
        UserService.authenticate({ email: "test@example.com" } as any)
      ).rejects.toThrow(ValidationError);

      await expect(
        UserService.authenticate({ email: "test@example.com" } as any)
      ).rejects.toThrow("Email/Username and password are required");
    });

    it("should throw error when JWT_SECRET is not configured", async () => {
      const User = await import("../models/User.js");
      const bcrypt = await import("bcrypt");

      // Mock un utilisateur valide et un mot de passe correct
      vi.mocked(User.default.getUserByEmail).mockResolvedValue({
        id: "user-id",
        password: "hashed-password",
        populate: vi.fn().mockResolvedValue({}),
        toObject: vi
          .fn()
          .mockReturnValue({ id: "user-id", email: "test@example.com" }),
      } as any);
      vi.mocked(bcrypt.default.compare).mockResolvedValue(true as any);

      delete process.env.JWT_SECRET;

      await expect(
        UserService.authenticate({
          email: "test@example.com",
          password: "test123",
        })
      ).rejects.toThrow("JWT_SECRET is not configured");
    });
  });

  describe("getUserProfile", () => {
    it("should throw NotFoundError when user does not exist", async () => {
      const User = await import("../models/User.js");
      vi.mocked(User.default.findById).mockResolvedValue(null);

      await expect(
        UserService.getUserProfile("nonexistent-id")
      ).rejects.toThrow(NotFoundError);

      await expect(
        UserService.getUserProfile("nonexistent-id")
      ).rejects.toThrow("User not found");
    });
  });

  describe("createUser", () => {
    it("should throw ValidationError when user already exists with email", async () => {
      const User = await import("../models/User.js");
      vi.mocked(User.default.getUserByEmail).mockResolvedValue({
        id: "existing-user",
      } as any);

      await expect(
        UserService.createUser(
          "existing@example.com",
          "password123",
          "username"
        )
      ).rejects.toThrow(ValidationError);

      await expect(
        UserService.createUser(
          "existing@example.com",
          "password123",
          "username"
        )
      ).rejects.toThrow("User already exists with this email");
    });

    it("should throw ValidationError when username is already taken", async () => {
      const User = await import("../models/User.js");
      vi.mocked(User.default.getUserByEmail).mockResolvedValue(null);
      vi.mocked(User.default.getUserByUsername).mockResolvedValue({
        id: "existing-user",
      } as any);

      await expect(
        UserService.createUser("new@example.com", "password123", "existinguser")
      ).rejects.toThrow(ValidationError);

      await expect(
        UserService.createUser("new@example.com", "password123", "existinguser")
      ).rejects.toThrow("Username is already taken");
    });
  });
});
