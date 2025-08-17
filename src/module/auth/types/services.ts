import { CompanyService } from "@/module/company/types";
import { RoleService } from "@/module/roles/types";
import { UserService } from "@/module/user/types";
import User from "@/module/user/user.model";

export type LoginRequestParams = {
  email: string;
  password: string;
};

export type RegisterUserParams = Pick<User, "email" | "name"> & {
  password: string;
  companyName: string;
};

export type AuthServiceDeps = {
  userService: UserService;
  companyService: CompanyService;
  roleService: RoleService;
};

export interface AuthService {
  login: (params: LoginRequestParams) => Promise<{ user: User }>;
  registerUser: (params: RegisterUserParams) => Promise<void>;
  getProfile: (id: string) => Promise<{ user: User }>;
}
