import { CreateUserParams } from "../types";
import prisma from "@/config/prisma";
import User from "../user.model";

export async function create({ password, ...data }: CreateUserParams) {
  const user = await prisma.user.create({
    data: { ...data, passwordHash: password },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  return user;
}

export async function findById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  return user;
}

export async function findByEmail(email: string) {
  const user = await prisma.user.findFirst({
    where: { email },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  return user;
}
