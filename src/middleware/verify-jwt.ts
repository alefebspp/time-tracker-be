import { FastifyReply, FastifyRequest } from "fastify";

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (error) {
    const routePath = request.url;

    if (routePath === "/auth/me") {
      return reply.status(419).send({ message: "Login necessário" });
    }

    return reply.status(401).send({ message: "Unauthorized" });
  }
}
