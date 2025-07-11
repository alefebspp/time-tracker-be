import { describe, it, beforeEach, expect, vi } from "vitest";

import { login, LoginDTO } from "./login.service";
import User from "@/module/user/user.model";

import AppError from "@/errors/AppError";
import { makeService } from "@/utils";
import UserRepository from "@/module/user/repository/user.repository";
import { hash } from "bcrypt";

let sut: (data: LoginDTO) => Promise<{ user: User }>;

const mockRepo = {
  findByEmail: vi.fn(),
};

describe("Login service", () => {
  beforeEach(async () => {
    sut = makeService(mockRepo as unknown as UserRepository, login);
  });

  it("should be able to login", async () => {
    mockRepo.findByEmail.mockResolvedValue({
      email: "johndoe@hotmail.com",
      passwordHash: await hash("123456789", 10),
    });

    const { user } = await sut({
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
      sut({ email: "johndoe@hotmail.com", password: "wrong-password" })
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      sut({ email: "wrong-user@hotmail.com", password: "wrong-password" })
    ).rejects.toBeInstanceOf(AppError);
  });
});
