import { Company } from "../company.model";

export interface CompanyRepository {
  create: (params: Pick<Company, "name">) => Promise<Company>;
  findById: (id: string) => Promise<Company | null>;
  findByName: (name: string) => Promise<Company | null>;
}
