import { describe, it, beforeEach, expect } from "vitest";

import { CreateUserDTO } from "@/module/user/repository/user.repository";
import { makeRegisterService } from "../factories/auth-services.factory";
import makeInMemoryUserRepository, {
  InMemoryUserRepository,
} from "@/module/user/repository/in-memory-user.repository";

import AppError from "@/errors/AppError";

let userRepository: InMemoryUserRepository;
let registerUser: (data: CreateUserDTO) => Promise<void>;

describe("Register service", () => {
  beforeEach(() => {
    userRepository = makeInMemoryUserRepository();
    registerUser = makeRegisterService(userRepository);
  });

  it("should be able to create a new user", async () => {
    await registerUser({
      name: "John Doe",
      email: "johndoe@hotmail.com",
      password: "123456789",
    });

    await registerUser({
      name: "Joe Rogan",
      email: "joerogan@hotmail.com",
      password: "123456789",
    });

    expect(userRepository.users.length).toEqual(2);
  });

  it("should throw error if email is already registered", async () => {
    await registerUser({
      name: "John Doe",
      email: "johndoe@hotmail.com",
      password: "123456789",
    });

    await expect(() =>
      registerUser({
        name: "John Doe",
        email: "johndoe@hotmail.com",
        password: "123456789",
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
