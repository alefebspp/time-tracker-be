import { FastifyReply, FastifyRequest } from "fastify";
import { addHours, sub } from "date-fns";

import UserRepository from "@/module/user/repository/user.repository";
import {
  makeGetProfileService,
  makeLoginService,
  makeRegisterService,
} from "./factories/auth-services.factory";
import { registerSchema, loginSchema } from "./auth.schemas";

export default function authController(userRepository: UserRepository) {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    async logout(request: FastifyRequest, reply: FastifyReply) {
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
    },
    async getProfile(request: FastifyRequest, reply: FastifyReply) {
      const userId = request.user.sign.sub;

      const getProfileService = makeGetProfileService(userRepository);

      const { user } = await getProfileService(userId);

      return reply.status(200).send({ user });
    },
    async register(request: FastifyRequest, reply: FastifyReply) {
      const body = registerSchema.parse(request.body);

      const registerUserService = makeRegisterService(userRepository);

      await registerUserService(body);

      return reply
        .status(200)
        .send({ message: "Usuário cadastrado com sucesso." });
    },
    async login(request: FastifyRequest, reply: FastifyReply) {
      const body = loginSchema.parse(request.body);

      const loginService = makeLoginService(userRepository);

      const { user } = await loginService(body);

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
    },
  };
}
