import { CompanyService } from "@/module/company/types";
import { RoleService } from "@/module/roles/types";
import { UserService } from "@/module/user/types";

export type RegisterUserServices = {
  userService: UserService;
  companyService: CompanyService;
  roleService: RoleService;
};

export type AuthControllerServices = {
  userService: UserService;
  companyService: CompanyService;
  roleService: RoleService;
};
