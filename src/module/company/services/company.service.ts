import { BadRequestError } from "@/errors";
import { Company } from "../company.model";
import { CompanyRepository } from "../repository/company.repository";
import { ERROR_MESSAGES } from "@/constants";
import { CompanyService } from "../types";

export function findByName(repo: CompanyRepository) {
  return async (name: string) => {
    const company = await repo.findByName(name);

    return company;
  };
}

export function create(repo: CompanyRepository) {
  return async (data: Pick<Company, "name">) => {
    const nameAlreadyExists = await repo.findByName(data.name);

    if (nameAlreadyExists) {
      throw new BadRequestError(ERROR_MESSAGES.COMPANY_NAME_ALREADY_REGISTERED);
    }

    const company = await repo.create(data);

    return company;
  };
}

export const bindRepositoryToCompanyService = (
  repo: CompanyRepository
): CompanyService => ({
  findByName: findByName(repo),
  create: create(repo),
});
