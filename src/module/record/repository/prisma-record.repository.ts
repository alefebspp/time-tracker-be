import { format } from "date-fns";
import { Prisma } from "@prisma/client";

import prisma from "@/config/prisma";
import RecordRepository, {
  CreateRecordDTO,
  FindAllRecordsParams,
} from "./record.repository";

export default function makePrismaRecordRepository(): RecordRepository {
  return {
    async create(data: CreateRecordDTO) {
      await prisma.record.create({ data });
    },
    async getTodayRecords({
      userId,
      referenceDate = new Date(),
    }: {
      userId: string;
      referenceDate?: Date;
    }) {
      const data = await prisma.record.findMany({
        where: {
          userId,
          createdAt: {
            gte: `${format(referenceDate, "yyyy-MM-dd")}T00:00:00.000Z`,
            lte: `${format(referenceDate, "yyyy-MM-dd")}T23:59:59.999Z`,
          },
        },
      });

      return data;
    },
    async findAll(params?: FindAllRecordsParams) {
      const andWhere: Prisma.RecordWhereInput[] = [];
      const limit = params?.limit || 10;
      const offset = params?.offset || 0;

      if (params?.userId) {
        andWhere.push({ userId: params.userId });
      }

      if (params?.type) {
        andWhere.push({ type: params.type });
      }

      if (params?.startDate && params?.endDate) {
        const startOfDayLocal = `${params.startDate}T00:00:00.000Z`;
        const endOfDayLocal = `${params.endDate}T23:59:59.999Z`;

        andWhere.push({
          createdAt: {
            gte: startOfDayLocal,
            lte: endOfDayLocal,
          },
        });
      }

      const data = await prisma.record.findMany({
        take: limit,
        skip: offset,
        where: { AND: andWhere },
        orderBy: { createdAt: "asc" },
      });

      const total = await prisma.record.count({ where: { AND: andWhere } });

      const nextOffset = offset + data.length;

      const hasMore = nextOffset < total;

      return {
        data,
        total,
        nextOffset: hasMore ? nextOffset : null,
        hasMore,
      };
    },
  };
}
