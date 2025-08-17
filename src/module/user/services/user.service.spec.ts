import { describe, expect, it, vi, beforeEach } from "vitest";
import * as bcrypt from "bcrypt";

import { bindRepositoryToUserService } from "./user.service";
import { BadRequestError } from "@/errors";
import { UserService } from "../types";

const mockRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findByEmail: vi.fn(),
};

vi.mock("bcrypt", () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

let sut: UserService;

describe("User Service", () => {
  beforeEach(() => {
    sut = bindRepositoryToUserService(mockRepo);
  });

  it("should throw if a user with received email already exists", async () => {
    mockRepo.findByEmail.mockResolvedValue({ email: "user@email.com" });

    await expect(
      sut.create({
        email: "user@email.com",
        password: "123",
        name: "User",
        companyId: "1",
      })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("should hash user password properly", async () => {
    mockRepo.findByEmail.mockResolvedValue(null);

    const mockHashedPassword = "hashed-password";

    (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockHashedPassword
    );

    const userData = {
      name: "Alice",
      email: "alice@example.com",
      password: "plaintext-password",
      companyId: "1",
    };

    await sut.create(userData);

    expect(bcrypt.hash).toHaveBeenCalledWith("plaintext-password", 10);
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Alice",
        email: "alice@example.com",
        password: mockHashedPassword,
      })
    );
  });
});
