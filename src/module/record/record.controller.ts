import { FastifyReply, FastifyRequest } from "fastify";
import RecordRepository from "./repository/record.repository";
import { createSchema, findAllSchema } from "./record.schemas";
import * as recordsService from "./services/records.service";
import { HTTP_STATUS, MESSAGES } from "@/constants";

export async function create(
  request: FastifyRequest,
  reply: FastifyReply,
  recordRepository: RecordRepository
) {
  const userId = request.user.sign.sub;
  const body = createSchema.parse(request.body);

  await recordsService.createRecord(recordRepository, { ...body, userId });

  return reply
    .status(HTTP_STATUS.CREATED)
    .send({ message: MESSAGES.RECORD_CREATED });
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

  return reply.status(HTTP_STATUS.OK).send(data);
}
