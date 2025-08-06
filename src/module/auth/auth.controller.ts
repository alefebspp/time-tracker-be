import { FastifyReply, FastifyRequest } from "fastify";
import { addHours, sub } from "date-fns";

import UserRepository from "@/module/user/repository/user.repository";

import { registerSchema, loginSchema } from "./auth.schemas";

import * as authService from "./services/auth.service";

const isProduction = process.env.NODE_ENV === "production";

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  return reply
    .setCookie("refreshToken", "", {
      path: "/",
      secure: isProduction,
      sameSite: isProduction ? "none" : true,
      httpOnly: true,
      expires: sub(new Date(), {
        days: 7,
      }),
    })
    .status(200)
    .send({ message: "Sucesso" });
}

export async function getProfile(
  request: FastifyRequest,
  reply: FastifyReply,
  userRepository: UserRepository
) {
  const userId = request.user.sign.sub;

  const { user } = await authService.getProfile(userRepository, userId);

  return reply.status(200).send({ user });
}

export async function register(
  request: FastifyRequest,
  reply: FastifyReply,
  userRepository: UserRepository
) {
  const body = registerSchema.parse(request.body);

  await authService.registerUser(userRepository, body);

  return reply.status(200).send({ message: "Usuário cadastrado com sucesso." });
}

export async function login(
  request: FastifyRequest,
  reply: FastifyReply,
  userRepository: UserRepository
) {
  const body = loginSchema.parse(request.body);

  const { user } = await authService.login(userRepository, body);

  const { passwordHash, ...data } = user;

  const normalizedUser = data;

  const token = await reply.jwtSign({
    sign: {
      sub: user.id,
    },
  });

  const refreshToken = await reply.jwtSign({
    sign: {
      sub: user.id,
      expiresIn: "7d",
    },
  });

  return reply
    .setCookie("refreshToken", refreshToken, {
      path: "/",
      secure: isProduction,
      sameSite: isProduction ? "none" : true,
      httpOnly: true,
      expires: addHours(new Date(), 1),
    })
    .status(200)
    .send({ token, user: normalizedUser });
}
