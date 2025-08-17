import { Company } from "@prisma/client";

export type CompanyService = {
  findByName(name: string): Promise<Company | null>;
  create(data: Pick<Company, "name">): Promise<Company>;
};
