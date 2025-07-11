import { hash } from "bcrypt";

import AppError from "@/errors/AppError";
import UserRepository, {
  CreateUserDTO,
} from "@/module/user/repository/user.repository";

export function registerUser(userRepository: UserRepository) {
  return async function ({ password, ...data }: CreateUserDTO) {
    const emailAlreadyExists = await userRepository.findByEmail(data.email);

    if (emailAlreadyExists) {
      throw new AppError(400, "Email já registrado");
    }

    const passwordHash = await hash(password, 10);

    await userRepository.create({ ...data, password: passwordHash });
  };
}
