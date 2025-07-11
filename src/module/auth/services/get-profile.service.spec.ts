import makeInMemoryUserRepository from "@/module/user/repository/in-memory-user.repository";
import User from "@/module/user/user.model";
import { describe, it, beforeEach, expect } from "vitest";
import {
  makeGetProfileService,
  makeRegisterService,
} from "../factories/auth-services.factory";
import AppError from "@/errors/AppError";

let sut: {
  getProfile: (id: string) => Promise<{ user: Omit<User, "passwordHash"> }>;
  users: User[];
};

describe("Get profile service", () => {
  beforeEach(async () => {
    const userRepository = makeInMemoryUserRepository();
    const registrationService = makeRegisterService(userRepository);
    await registrationService({
      email: "johndoe@hotmail.com",
      name: "John Doe",
      password: "123",
    });
    sut = {
      getProfile: makeGetProfileService(userRepository),
      users: userRepository.users,
    };
  });

  it("should throw error if user does not exists", async () => {
    expect(async () => await sut.getProfile("wrong-id")).rejects.toBeInstanceOf(
      AppError
    );
  });

  it("should return a user", async () => {
    const { getProfile, users } = sut;

    const user = await getProfile(users[0].id);

    expect(user).toBeTruthy();
  });
});
