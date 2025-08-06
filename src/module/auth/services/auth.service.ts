import { compare, hash } from "bcrypt";

import UserRepository from "@/module/user/repository/user.repository";
import {
  LoginRequestParams,
  RegisterUserParams,
} from "@/module/auth/types/services";
import { BadRequestError, UnauthorizedError } from "@/errors";

export async function login(
  userRepository: UserRepository,
  { email, password }: LoginRequestParams
) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new BadRequestError("Email ou senha incorretos.");
  }

  const passwordsMatch = await compare(password, user.passwordHash);

  if (!passwordsMatch) {
    throw new BadRequestError("Email ou senha incorretos.");
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
    throw new BadRequestError("Email já registrado");
  }

  const passwordHash = await hash(password, 10);

  await userRepository.create({ ...data, password: passwordHash });
}

export async function getProfile(userRepository: UserRepository, id: string) {
  if (!id) {
    throw new UnauthorizedError();
  }

  const user = await userRepository.findById(id);

  if (!user || !id) {
    throw new BadRequestError("Usuário não encontrado");
  }

  const { passwordHash, ...data } = user;

  return {
    user: data,
  };
}
