import { hash } from "bcrypt";
import { BadRequestError } from "@/errors";
import { ERROR_MESSAGES, SALT_ROUNDS } from "@/constants";
import { CreateUserParams, UserService } from "../types";
import UserRepository from "../repository/user.repository";

export function findByEmail(repo: UserRepository) {
  return async (email: string) => {
    return repo.findByEmail(email);
  };
}

export function findById(repo: UserRepository) {
  return async (id: string) => {
    const user = await repo.findById(id);

    if (!user) {
      throw new BadRequestError(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  };
}

export function createUser(repo: UserRepository) {
  return async (params: CreateUserParams) => {
    const { password, ...data } = params;

    const existingUser = await repo.findByEmail(data.email);

    if (existingUser) {
      throw new BadRequestError(ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED);
    }

    const passwordHash = await hash(password, SALT_ROUNDS);

    const user = await repo.create({
      ...data,
      password: passwordHash,
    });

    return user;
  };
}

export const bindRepositoryToUserService = (
  repo: UserRepository
): UserService => ({
  findByEmail: findByEmail(repo),
  findById: findById(repo),
  create: createUser(repo),
});
