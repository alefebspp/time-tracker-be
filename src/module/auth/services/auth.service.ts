import { compare, hash } from "bcrypt";

import AppError from "@/errors/AppError";
import UserRepository from "@/module/user/repository/user.repository";
import {
  LoginRequestParams,
  RegisterUserParams,
} from "@/module/auth/types/services";

export async function login(
  userRepository: UserRepository,
  { email, password }: LoginRequestParams
) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new AppError(400, "Email ou senha incorretos.");
  }

  const passwordsMatch = await compare(password, user.passwordHash);

  if (!passwordsMatch) {
    throw new AppError(400, "Email ou senha incorretos.");
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
    throw new AppError(400, "Email já registrado");
  }

  const passwordHash = await hash(password, 10);

  await userRepository.create({ ...data, password: passwordHash });
}

export async function getProfile(userRepository: UserRepository, id: string) {
  if (!id) {
    throw new AppError(401, "Unauthorized");
  }

  const user = await userRepository.findById(id);

  if (!user || !id) {
    throw new AppError(400, "Usuário não encontrado");
  }

  const { passwordHash, ...data } = user;

  return {
    user: data,
  };
}
