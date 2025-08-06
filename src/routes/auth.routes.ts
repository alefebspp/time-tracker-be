import z from "zod";

import { FastifyTypedInstance } from "@/types";
import { loginSchema, registerSchema } from "@/module/auth/auth.schemas";
import { verifyJWT } from "@/middleware/verify-jwt";
import makePrismaUserRepository from "@/module/user/repository/prisma-user.repository";
import * as authController from "@/module/auth/auth.controller";

export default async function authRoutes(app: FastifyTypedInstance) {
  const userPrismaRepository = makePrismaUserRepository();

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
    (request, reply) =>
      authController.register(request, reply, userPrismaRepository)
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
            }),
          }),
        },
      },
    },
    (request, reply) =>
      authController.getProfile(request, reply, userPrismaRepository)
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
            }),
          }),
        },
      },
    },
    (request, reply) =>
      authController.login(request, reply, userPrismaRepository)
  );
}
