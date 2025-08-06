import { compare, hash } from "bcrypt";

import UserRepository from "@/module/user/repository/user.repository";
import {
  LoginRequestParams,
  RegisterUserParams,
} from "@/module/auth/types/services";
import { BadRequestError, UnauthorizedError } from "@/errors";
import { ErrorMessages, SALT_ROUNDS } from "@/constants";

export async function login(
  userRepository: UserRepository,
  { email, password }: LoginRequestParams
) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new BadRequestError(ErrorMessages.INVALID_CREDENTIALS);
  }

  const passwordsMatch = await compare(password, user.passwordHash);

  if (!passwordsMatch) {
    throw new BadRequestError(ErrorMessages.INVALID_CREDENTIALS);
  }

  return {
    user,
  };
}

export async function registerUser(
  userRepository: UserRepository,
  { password, ...data }: RegisterUserParams
) {
  const emailAlreadyExists = await userRepository.findByEmail(data.email);

  if (emailAlreadyExists) {
    throw new BadRequestError(ErrorMessages.EMAIL_ALREADY_REGISTERED);
  }

  const passwordHash = await hash(password, SALT_ROUNDS);

  await userRepository.create({ ...data, password: passwordHash });
}

export async function getProfile(userRepository: UserRepository, id: string) {
  if (!id) {
    throw new UnauthorizedError();
  }

  const user = await userRepository.findById(id);

  if (!user || !id) {
    throw new BadRequestError(ErrorMessages.USER_NOT_FOUND);
  }

  return {
    user,
  };
}
