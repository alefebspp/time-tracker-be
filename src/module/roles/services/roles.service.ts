import { BadRequestError } from "@/errors";
import { RoleRepository } from "../repository/role.repository";
import { AssignRoleToUserServiceParams, RoleService } from "../types";

export function assignToUser(roleRepository: RoleRepository) {
  return async ({
    roleName,
    userId,
    userService,
  }: AssignRoleToUserServiceParams) => {
    const role = await roleRepository.findByName(roleName);

    if (!role) {
      throw new BadRequestError("Role does not exists");
    }

    const user = await userService.findById(userId);

    await roleRepository.assignToUser({ userId: user.id, roleId: role.id });
  };
}

export function bindRepositoryToRoleService(
  roleRepository: RoleRepository
): RoleService {
  return {
    assignToUser: assignToUser(roleRepository),
  };
}
