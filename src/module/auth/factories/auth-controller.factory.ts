import makePrismaUserRepository from "@/module/user/repository/prisma-user.repository";
import authController from "../auth.controller";

export default function makeAuthController() {
  const userPrismaRepository = makePrismaUserRepository();

  return authController(userPrismaRepository);
}
