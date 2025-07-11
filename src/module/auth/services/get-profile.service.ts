import AppError from "@/errors/AppError";
import UserRepository from "@/module/user/repository/user.repository";

export function getProfile(userRepository: UserRepository) {
  return async function (id: string) {
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
  };
}
