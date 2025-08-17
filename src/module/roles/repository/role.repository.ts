import { Role } from "../role.model";
import { AssignRoleToUserParams } from "../types";

export interface RoleRepository {
  findByName: (name: string) => Promise<Role | null>;
  assignToUser: (data: AssignRoleToUserParams) => Promise<void>;
}
