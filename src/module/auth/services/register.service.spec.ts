import { describe, it, beforeEach, expect, vi } from "vitest";
import * as bcrypt from "bcrypt";

import UserRepository, {
  CreateUserDTO,
} from "@/module/user/repository/user.repository";

import AppError from "@/errors/AppError";
import { makeService } from "@/utils";
import { registerUser } from "./register.service";

let sut: (data: CreateUserDTO) => Promise<void>;

vi.mock("bcrypt");

const mockRepo = {
  findByEmail: vi.fn(),
  create: vi.fn(),
};

describe("Register service", () => {
  beforeEach(() => {
    sut = makeService(mockRepo as unknown as UserRepository, registerUser);
  });

  it("should hash user password properly", async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    const mockHashedPassword = "hashed-password";
    (bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockHashedPassword
    );

    const userData: CreateUserDTO = {
      name: "Alice",
      email: "alice@example.com",
      password: "plaintext-password",
    };

    await sut(userData);

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
      sut({
        name: "John Doe",
        email: "johndoe@hotmail.com",
        password: "123456789",
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
