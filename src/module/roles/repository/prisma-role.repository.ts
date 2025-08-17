import prisma from "@/config/prisma";
import { AssignRoleToUserParams } from "../types";

export async function findByName(name: string) {
  const role = await prisma.role.findUnique({ where: { name } });

  return role;
}

export async function assignToUser(data: AssignRoleToUserParams) {
  await prisma.userRole.create({
    data: {
      roleId: data.roleId,
      userId: data.userId,
    },
  });
}
