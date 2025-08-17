import { describe, expect, it, vi, beforeEach } from "vitest";
import { bindRepositoryToCompanyService } from "./company.service";
import { BadRequestError } from "@/errors";
import { CompanyService } from "../types";

const mockRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findByName: vi.fn(),
};

let sut: CompanyService;

describe("Company Service", () => {
  beforeEach(() => {
    sut = bindRepositoryToCompanyService(mockRepo);
  });

  it("should throw if already exists a company with received name", async () => {
    mockRepo.findByName.mockResolvedValue({
      id: "1",
      name: "already-registered",
    });

    await expect(
      sut.create({
        name: "already-registered",
      })
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});
