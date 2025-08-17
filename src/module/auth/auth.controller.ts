import { FastifyReply, FastifyRequest } from "fastify";
import { addHours, sub } from "date-fns";

import User from "@/module/user/user.model";
import { registerSchema, loginSchema } from "./auth.schemas";
import {
  COOKIE,
  HTTP_STATUS,
  MESSAGES,
  TOKEN_EXPIRATION,
  ENV,
} from "@/constants";
import { AuthService } from "./types/services";

function normalizeUser(user: User) {
  const { passwordHash, ...safeData } = user;

  const roles = user.roles.map(({ role }) => role.name);

  return {
    ...safeData,
    roles,
  };
}

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
  authService: AuthService
) {
  const userId = request.user.sign.sub;
  const { user } = await authService.getProfile(userId);

  return reply.status(HTTP_STATUS.OK).send({ user: normalizeUser(user) });
}

export async function register(
  request: FastifyRequest,
  reply: FastifyReply,
  authService: AuthService
) {
  const body = registerSchema.parse(request.body);
  await authService.registerUser(body);

  return reply.status(HTTP_STATUS.OK).send({ message: MESSAGES.USER_CREATED });
}

export async function login(
  request: FastifyRequest,
  reply: FastifyReply,
  authService: AuthService
) {
  const body = loginSchema.parse(request.body);
  const { user } = await authService.login(body);

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
    .send({ token, user: normalizeUser(user) });
}
