import { describe, it, expect, vi } from "vitest";
import * as bcrypt from "bcrypt";

import AppError from "@/errors/AppError";

import * as authService from "./auth.service";
import { RegisterUserParams } from "../types/services";

const mockRepo = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  create: vi.fn(),
};

vi.mock("bcrypt", () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

describe("Auth service", () => {
  describe("getProfile", () => {
    it("should throw error if user does not exists", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        authService.getProfile(mockRepo, "wrong-id")
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe("login", () => {
    it("should be able to login", async () => {
      (bcrypt.compare as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        true
      );

      mockRepo.findByEmail.mockResolvedValue({
        email: "johndoe@hotmail.com",
        passwordHash: await bcrypt.hash("123456789", 10),
      });

      const { user } = await authService.login(mockRepo, {
        email: "johndoe@hotmail.com",
        password: "123456789",
      });

      expect(user).toEqual(
        expect.objectContaining({ email: "johndoe@hotmail.com" })
      );
    });

    it("should throw if user does not exists or if password does not match", async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login(mockRepo, {
          email: "johndoe@hotmail.com",
          password: "wrong-password",
        })
      ).rejects.toBeInstanceOf(AppError);

      await expect(
        authService.login(mockRepo, {
          email: "wrong-user@hotmail.com",
          password: "wrong-password",
        })
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe("registerUser", () => {
    it("should hash user password properly", async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      const mockHashedPassword = "hashed-password";

      (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockHashedPassword
      );

      const userData: RegisterUserParams = {
        name: "Alice",
        email: "alice@example.com",
        password: "plaintext-password",
      };

      await authService.registerUser(mockRepo, userData);

      expect(bcrypt.hash).toHaveBeenCalledWith("plaintext-password", 10);
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Alice",
          email: "alice@example.com",
          password: mockHashedPassword,
        })
      );
    });

    it("should throw error if email is already registered", async () => {
      mockRepo.findByEmail.mockResolvedValue({
        id: "1",
        name: "John Doe",
        email: "johndoe@hotmail.com",
      });

      await expect(
        authService.registerUser(mockRepo, {
          name: "John Doe",
          email: "johndoe@hotmail.com",
          password: "123456789",
        })
      ).rejects.toBeInstanceOf(AppError);
    });
  });
});
