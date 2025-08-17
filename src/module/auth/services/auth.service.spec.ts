import { describe, it, expect, vi, beforeEach } from "vitest";
import * as bcrypt from "bcrypt";

import AppError from "@/errors/AppError";

import { bindServices } from "./auth.service";
import { bindRepositoryToUserService } from "@/module/user/services/user.service";
import { UserService } from "@/module/user/types";
import { CompanyService } from "@/module/company/types";
import { bindRepositoryToCompanyService } from "@/module/company/services/company.service";
import { AuthService } from "../types/services";
import { bindRepositoryToRoleService } from "@/module/roles/services/roles.service";
import { RoleService } from "@/module/roles/types";

const mockRepo = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  create: vi.fn(),
};

const mockRoleRepo = {
  assignToUser: vi.fn(),
  findByName: vi.fn(),
};

vi.mock("bcrypt", () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

let userService: UserService;
let companyService: CompanyService;
let roleService: RoleService;
let sut: AuthService;

describe("Auth service", () => {
  beforeEach(() => {
    userService = bindRepositoryToUserService(mockRepo);

    companyService = bindRepositoryToCompanyService({
      ...mockRepo,
      findByName: vi.fn(),
    });

    roleService = bindRepositoryToRoleService(mockRoleRepo);

    sut = bindServices({ userService, companyService, roleService });
  });

  describe("getProfile", () => {
    it("should throw error if user does not exists", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(sut.getProfile("wrong-id")).rejects.toBeInstanceOf(AppError);
    });
  });

  describe("login", () => {
    it("should be able to login", async () => {
      (bcrypt.compare as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        true
      );

      mockRepo.findByEmail.mockResolvedValue({
        email: "johndoe@hotmail.com",
        passwordHash: await bcrypt.hash("123456789", 10),
      });

      const { user } = await sut.login({
        email: "johndoe@hotmail.com",
        password: "123456789",
      });

      expect(user).toEqual(
        expect.objectContaining({ email: "johndoe@hotmail.com" })
      );
    });

    it("should throw if user does not exists or if password does not match", async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      await expect(
        sut.login({
          email: "johndoe@hotmail.com",
          password: "wrong-password",
        })
      ).rejects.toBeInstanceOf(AppError);

      await expect(
        sut.login({
          email: "wrong-user@hotmail.com",
          password: "wrong-password",
        })
      ).rejects.toBeInstanceOf(AppError);
    });
  });
});
