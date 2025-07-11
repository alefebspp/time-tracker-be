import { hash } from "bcrypt";

import AppError from "@/errors/AppError";
import UserRepository, {
  CreateUserDTO,
} from "@/module/user/repository/user.repository";

export async function registerUser(
  userRepository: UserRepository,
  { password, ...data }: CreateUserDTO
) {
  const emailAlreadyExists = await userRepository.findByEmail(data.email);

  if (emailAlreadyExists) {
    throw new AppError(400, "Email já registrado");
  }

  const passwordHash = await hash(password, 10);

  await userRepository.create({ ...data, password: passwordHash });
}
