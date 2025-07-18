import { FastifyInstance } from "fastify";
import { hash } from "bcrypt";

import prisma from "@/config/prisma";

export default async function testsRoutes(app: FastifyInstance) {
  app.post("/reset", async (request, reply) => {
    if (process.env.NODE_ENV !== "dev") {
      return reply.status(403).send("Forbidden");
    }

    const testUsers = await prisma.user.findMany({
      where: { email: { endsWith: "@test.local" } },
    });

    await prisma.user.deleteMany({
      where: { id: { in: testUsers.map(({ id }) => id) } },
    });

    const passwordHash = await hash("123456Test!", 10);

    await prisma.user.create({
      data: {
        name: "Test User",
        email: "user@test.local",
        passwordHash,
      },
    });

    return reply.status(200).send("Test DB resetado com sucesso");
  });
}
