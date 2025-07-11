import { describe, it, beforeEach, expect } from "vitest";

import { LoginDTO } from "./login.service";
import {
  makeLoginService,
  makeRegisterService,
} from "../factories/auth-services.factory";
import User from "@/module/user/user.model";
import makeInMemoryUserRepository, {
  InMemoryUserRepository,
} from "@/module/user/repository/in-memory-user.repository";

import AppError from "@/errors/AppError";

let userRepository: InMemoryUserRepository;
let sut: (data: LoginDTO) => Promise<{ user: User }>;

describe("Login service", () => {
  beforeEach(async () => {
    userRepository = makeInMemoryUserRepository();
    const registerUser = makeRegisterService(userRepository);

    sut = makeLoginService(userRepository);
    await registerUser({
      name: "John Doe",
      email: "johndoe@hotmail.com",
      password: "123456789",
    });
  });

  it("should be able to login", async () => {
    const { user } = await sut({
      email: "johndoe@hotmail.com",
      password: "123456789",
    });

    expect(user).toEqual(
      expect.objectContaining({ email: "johndoe@hotmail.com" })
    );
  });

  it("should throw if user does not exists or if password does not match", async () => {
    expect(async () =>
      sut({ email: "johndoe@hotmail.com", password: "wrong-password" })
    ).rejects.toBeInstanceOf(AppError);
    expect(async () =>
      sut({ email: "wrong-user@hotmail.com", password: "wrong-password" })
    ).rejects.toBeInstanceOf(AppError);
  });
});
