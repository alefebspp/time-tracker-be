import User from "@/module/user/user.model";
import { Role } from "../role.model";
import { UserService } from "@/module/user/types";

export interface AssignRoleToUserServiceParams {
  userId: User["id"];
  roleName: Role["name"];
  userService: UserService;
}

export interface AssignRoleToUserParams {
  userId: User["id"];
  roleId: Role["id"];
}

export interface RoleService {
  assignToUser: (data: AssignRoleToUserServiceParams) => Promise<void>;
}
