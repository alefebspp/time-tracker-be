import { describe, it, expect, vi, beforeEach } from "vitest";
import { bindRepositoryToUserService } from "@/module/user/services/user.service";
import { UserService } from "@/module/user/types";
import { RoleService } from "../types";
import { bindRepositoryToRoleService } from "./roles.service";
import { BadRequestError } from "@/errors";

const mockUserRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findByEmail: vi.fn(),
};

const mockRepo = {
  assignToUser: vi.fn(),
  findByName: vi.fn(),
};

let userService: UserService;
let sut: RoleService;

describe("Roles service", () => {
  beforeEach(() => {
    userService = bindRepositoryToUserService(mockUserRepo);
    sut = bindRepositoryToRoleService(mockRepo);
  });

  it("should throw if role does not exists", async () => {
    mockRepo.findByName.mockResolvedValue(null);

    await expect(
      sut.assignToUser({ roleName: "ADMIN", userId: "1", userService })
    ).rejects.toBeInstanceOf(BadRequestError);
  });
  it("should throw if user does not exists", async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    await expect(
      sut.assignToUser({ roleName: "ADMIN", userId: "1", userService })
    ).rejects.toBeInstanceOf(BadRequestError);
  });
});
