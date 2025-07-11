import recordController from "../record.controller";
import makePrismaRecordRepository from "../repository/prisma-record.repository";

export function makeRecordController() {
  const prismaRecordRepository = makePrismaRecordRepository();

  return recordController(prismaRecordRepository);
}
