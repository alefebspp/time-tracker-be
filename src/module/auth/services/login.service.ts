import { compare } from "bcrypt";

import AppError from "@/errors/AppError";
import UserRepository from "@/module/user/repository/user.repository";

export type LoginDTO = {
  email: string;
  password: string;
};

export async function login(
  userRepository: UserRepository,
  { email, password }: LoginDTO
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
