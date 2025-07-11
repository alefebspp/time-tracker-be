import { FastifyReply, FastifyRequest } from "fastify";

import RecordRepository from "./repository/record.repository";
import { createSchema, findAllSchema } from "./record.schemas";
import {
  makeCreateRecordService,
  makeListRecordsService,
} from "./factories/record-services.factory";

export default function recordController(recordRepository: RecordRepository) {
  return {
    async create(request: FastifyRequest, reply: FastifyReply) {
      const userId = request.user.sign.sub;

      const body = createSchema.parse(request.body);

      const createRecordService = makeCreateRecordService(recordRepository);

      await createRecordService({ ...body, userId });

      return reply
        .status(201)
        .send({ message: "Ponto registrado com sucesso." });
    },
    async findAll(request: FastifyRequest, reply: FastifyReply) {
      const userId = request.user.sign.sub;

      const params = findAllSchema.parse(request.query);

      const listRecordsService = makeListRecordsService(recordRepository);

      const data = await listRecordsService({ ...params, userId });

      return reply.status(200).send(data);
    },
  };
}
