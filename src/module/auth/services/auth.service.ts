import { compare } from "bcrypt";

import {
  AuthService,
  AuthServiceDeps,
  LoginRequestParams,
  RegisterUserParams,
} from "@/module/auth/types/services";
import { BadRequestError, UnauthorizedError } from "@/errors";
import { ERROR_MESSAGES, ROLES_NAMES } from "@/constants";
import { RegisterUserServices } from "@/module/auth/types";
import { UserService } from "@/module/user/types";

export function login(userService: UserService) {
  return async ({ email, password }: LoginRequestParams) => {
    const user = await userService.findByEmail(email);

    if (!user) {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const passwordsMatch = await compare(password, user.passwordHash);

    if (!passwordsMatch) {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    return {
      user,
    };
  };
}

export function registerUser(services: RegisterUserServices) {
  return async (params: RegisterUserParams) => {
    const { userService, companyService, roleService } = services;
    const { password, companyName, ...data } = params;

    const emailAlreadyExists = await userService.findByEmail(data.email);

    if (emailAlreadyExists) {
      throw new BadRequestError(ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED);
    }

    const companyNameAlreadyRegistered = await companyService.findByName(
      companyName
    );

    if (companyNameAlreadyRegistered) {
      throw new BadRequestError(ERROR_MESSAGES.COMPANY_NAME_ALREADY_REGISTERED);
    }

    const { id: companyId } = await companyService.create({
      name: companyName,
    });

    const user = await userService.create({
      ...data,
      password,
      companyId,
    });

    await roleService.assignToUser({
      roleName: ROLES_NAMES.MANAGER,
      userId: user.id,
      userService,
    });
  };
}

export function getProfile(userService: UserService) {
  return async (id: string) => {
    if (!id) {
      throw new UnauthorizedError();
    }

    const user = await userService.findById(id);

    return {
      user,
    };
  };
}

export function bindServices({
  userService,
  companyService,
  roleService,
}: AuthServiceDeps): AuthService {
  return {
    login: login(userService),
    getProfile: getProfile(userService),
    registerUser: registerUser({ userService, companyService, roleService }),
  };
}
