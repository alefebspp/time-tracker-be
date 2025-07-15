import { describe, it, beforeEach, expect, vi } from "vitest";

import User from "@/module/user/user.model";
import AppError from "@/errors/AppError";
import { makeService } from "@/utils";
import { getProfile } from "./get-profile.service";
import UserRepository from "@/module/user/repository/user.repository";

let sut: (id: string) => Promise<{ user: Omit<User, "passwordHash"> }>;

const mockRepo = {
  findById: vi.fn(),
};

describe("Get profile service", () => {
  beforeEach(async () => {
    sut = makeService(mockRepo as unknown as UserRepository, getProfile);
  });

  it("should throw error if user does not exists", async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(sut("wrong-id")).rejects.toBeInstanceOf(AppError);
  });

  it("should return a user without passwordHash", async () => {
    mockRepo.findById.mockResolvedValue({
      id: "valid-id",
      name: "John Doe",
      email: "john@example.com",
      passwordHash: "hashed",
    });

    const user = await sut("valid-id");

    expect(user).toEqual({
      user: {
        id: "valid-id",
        name: "John Doe",
        email: "john@example.com",
      },
    });
  });
});
