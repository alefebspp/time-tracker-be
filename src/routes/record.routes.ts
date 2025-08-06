import z from "zod";

import { FastifyTypedInstance } from "@/types";
import { createSchema, findAllSchema } from "@/module/record/record.schemas";
import { verifyJWT } from "@/middleware/verify-jwt";
import makePrismaRecordRepository from "@/module/record/repository/prisma-record.repository";
import * as recordsController from "@/module/record/record.controller";

export default async function recordRoutes(app: FastifyTypedInstance) {
  const prismaRecordRepository = makePrismaRecordRepository();

  app.post(
    "/",
    {
      onRequest: verifyJWT,
      schema: {
        operationId: "create",
        description: "Create a new record",
        tags: ["Record"],
        body: createSchema,
        response: {
          201: z.object({ message: z.string() }),
        },
      },
    },
    (request, reply) =>
      recordsController.create(request, reply, prismaRecordRepository)
  );

  app.get(
    "/",
    {
      onRequest: verifyJWT,
      schema: {
        operationId: "findAll",
        description: "List records with optional filters",
        tags: ["Record"],
        querystring: findAllSchema,
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string().uuid(),
                type: z.enum(["start", "end"]),
                userId: z.string().uuid(),
                createdAt: z.date(),
                updatedAt: z.date().nullable(),
              })
            ),
            total: z.number(),
            nextOffset: z.number().nullable(),
            hasMore: z.boolean(),
          }),
        },
      },
    },
    (request, reply) =>
      recordsController.findAll(request, reply, prismaRecordRepository)
  );
}
