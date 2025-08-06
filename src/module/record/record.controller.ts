import { FastifyReply, FastifyRequest } from "fastify";

import RecordRepository from "./repository/record.repository";
import { createSchema, findAllSchema } from "./record.schemas";
import * as recordsService from "./services/records.service";

export async function create(
  request: FastifyRequest,
  reply: FastifyReply,
  recordRepository: RecordRepository
) {
  const userId = request.user.sign.sub;

  const body = createSchema.parse(request.body);

  await recordsService.createRecord(recordRepository, { ...body, userId });

  return reply.status(201).send({ message: "Ponto registrado com sucesso." });
}

export async function findAll(
  request: FastifyRequest,
  reply: FastifyReply,
  recordRepository: RecordRepository
) {
  const userId = request.user.sign.sub;

  const params = findAllSchema.parse(request.query);

  const data = await recordsService.listRecords(recordRepository, {
    ...params,
    userId,
  });

  return reply.status(200).send(data);
}
