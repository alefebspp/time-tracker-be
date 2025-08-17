import z from "zod";

import { FastifyTypedInstance } from "@/types";
import { loginSchema, registerSchema } from "@/module/auth/auth.schemas";
import { verifyJWT } from "@/middleware/verify-jwt";
import * as userRepository from "@/module/user/repository/prisma-user.repository";
import * as companyRepository from "@/module/company/repository/prisma-company.repository";
import * as roleRepository from "@/module/roles/repository/prisma-role.repository";
import { bindRepositoryToUserService } from "@/module/user/services/user.service";
import { bindRepositoryToCompanyService } from "@/module/company/services/company.service";
import { bindServices } from "@/module/auth/services/auth.service";
import { bindRepositoryToRoleService } from "@/module/roles/services/roles.service";
import * as authController from "@/module/auth/auth.controller";

export default async function authRoutes(app: FastifyTypedInstance) {
  const userService = bindRepositoryToUserService(userRepository);
  const companyService = bindRepositoryToCompanyService(companyRepository);
  const roleService = bindRepositoryToRoleService(roleRepository);

  const services = {
    userService,
    companyService,
    roleService,
  };

  const authService = bindServices(services);

  app.post(
    "/register",
    {
      schema: {
        operationId: "register",
        description: "Register a new user",
        tags: ["Auth"],
        body: registerSchema,
        response: {
          201: z.object({ message: z.string() }),
        },
      },
    },
    (...args) => authController.register(...args, authService)
  );

  app.post(
    "/logout",
    {
      schema: {
        operationId: "logout",
        description: "Logoff user",
        tags: ["Auth"],
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    authController.logout
  );

  app.get(
    "/me",
    {
      onRequest: verifyJWT,
      schema: {
        operationId: "profile",
        description: "Get user profile",
        tags: ["Auth"],
        response: {
          200: z.object({
            user: z.object({
              id: z.string().uuid(),
              name: z.string(),
              email: z.string().email(),
              createdAt: z.date(),
              updatedAt: z.date(),
              roles: z.array(z.string()),
            }),
          }),
        },
      },
    },
    (...args) => authController.getProfile(...args, authService)
  );

  app.post(
    "/sign-in",
    {
      schema: {
        operationId: "login",
        description: "Login",
        tags: ["Auth"],
        body: loginSchema,
        response: {
          200: z.object({
            token: z.string(),
            user: z.object({
              id: z.string(),
              email: z.string(),
              name: z.string(),
              createdAt: z.date(),
              updatedAt: z.date().nullable(),
              roles: z.array(z.string()),
            }),
          }),
        },
      },
    },
    (...args) => authController.login(...args, authService)
  );
}
