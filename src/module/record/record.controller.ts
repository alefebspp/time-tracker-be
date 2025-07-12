import { FastifyReply, FastifyRequest } from "fastify";

import RecordRepository from "./repository/record.repository";
import { createSchema, findAllSchema } from "./record.schemas";
import { makeService } from "@/utils";
import { createRecord } from "./services/create-record.service";
import { listRecords } from "./services/list-records.service";

export default function recordController(recordRepository: RecordRepository) {
  return {
    async create(request: FastifyRequest, reply: FastifyReply) {
      const userId = request.user.sign.sub;

      const body = createSchema.parse(request.body);

      const createRecordService = makeService(recordRepository, createRecord);

      await createRecordService({ ...body, userId });

      return reply
        .status(201)
        .send({ message: "Ponto registrado com sucesso." });
    },
    async findAll(request: FastifyRequest, reply: FastifyReply) {
      const userId = request.user.sign.sub;

      const params = findAllSchema.parse(request.query);

      const listRecordsService = makeService(recordRepository, listRecords);

      const data = await listRecordsService({ ...params, userId });

      return reply.status(200).send(data);
    },
  };
}
