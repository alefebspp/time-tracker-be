import { FastifyReply, FastifyRequest } from "fastify";
import { addHours, sub } from "date-fns";

import UserRepository from "@/module/user/repository/user.repository";
import { registerSchema, loginSchema } from "./auth.schemas";
import * as authService from "./services/auth.service";
import {
  COOKIE,
  HTTP_STATUS,
  MESSAGES,
  TOKEN_EXPIRATION,
  ENV,
} from "@/constants";

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  return reply
    .setCookie(COOKIE.NAME, "", {
      path: COOKIE.PATH,
      secure: ENV.isProduction,
      sameSite: ENV.isProduction ? "none" : true,
      httpOnly: true,
      expires: sub(new Date(), { days: COOKIE.MAX_AGE_DAYS }),
    })
    .status(HTTP_STATUS.OK)
    .send({ message: MESSAGES.LOGOUT_SUCCESS });
}

export async function getProfile(
  request: FastifyRequest,
  reply: FastifyReply,
  userRepository: UserRepository
) {
  const userId = request.user.sign.sub;
  const { user } = await authService.getProfile(userRepository, userId);
  const { passwordHash: _, ...safeUser } = user;

  return reply.status(HTTP_STATUS.OK).send({ user: safeUser });
}

export async function register(
  request: FastifyRequest,
  reply: FastifyReply,
  userRepository: UserRepository
) {
  const body = registerSchema.parse(request.body);
  await authService.registerUser(userRepository, body);

  return reply.status(HTTP_STATUS.OK).send({ message: MESSAGES.USER_CREATED });
}

export async function login(
  request: FastifyRequest,
  reply: FastifyReply,
  userRepository: UserRepository
) {
  const body = loginSchema.parse(request.body);
  const { user } = await authService.login(userRepository, body);
  const { passwordHash, ...normalizedUser } = user;

  const token = await reply.jwtSign({ sign: { sub: user.id } });
  const refreshToken = await reply.jwtSign({
    sign: { sub: user.id, expiresIn: TOKEN_EXPIRATION.REFRESH },
  });

  return reply
    .setCookie(COOKIE.NAME, refreshToken, {
      path: COOKIE.PATH,
      secure: ENV.isProduction,
      sameSite: ENV.isProduction ? "none" : true,
      httpOnly: true,
      expires: addHours(new Date(), 1),
    })
    .status(HTTP_STATUS.OK)
    .send({ token, user: normalizedUser });
}
