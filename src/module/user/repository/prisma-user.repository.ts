import { CreateUserParams } from "../types";
import UserRepository from "./user.repository";
import prisma from "@/config/prisma";

export default function makePrismaUserRepository(): UserRepository {
  return {
    async create({ password, ...data }: CreateUserParams) {
      await prisma.user.create({ data: { ...data, passwordHash: password } });
    },

    async findById(id: string) {
      const user = await prisma.user.findUnique({ where: { id } });

      return user;
    },

    async findByEmail(email: string) {
      const user = await prisma.user.findFirst({ where: { email } });

      return user;
    },
  };
}
