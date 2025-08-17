import prisma from "@/config/prisma";
import { Company } from "../company.model";

export async function create({ name }: Pick<Company, "name">) {
  const company = await prisma.company.create({ data: { name } });

  return company;
}

export async function findById(id: string) {
  const company = await prisma.company.findUnique({ where: { id } });

  return company;
}

export async function findByName(name: string) {
  const company = await prisma.company.findFirst({ where: { name } });

  return company;
}
