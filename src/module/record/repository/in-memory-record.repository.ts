import { randomUUID } from "crypto";
import Record from "../record.model";
import RecordRepository, {
  CreateRecordDTO,
  FindAllRecordsParams,
} from "./record.repository";
import { parseISO, isSameDay, startOfDay, endOfDay } from "date-fns";

export default function makeInMemoryRecordRepository(): RecordRepository {
  const records: Record[] = [];

  return {
    async create(data: CreateRecordDTO) {
      records.push({ ...data, id: randomUUID() });
    },
    async getTodayRecords({
      userId,
      referenceDate = new Date(),
    }: {
      userId: string;
      referenceDate?: Date;
    }) {
      const data =
        records.filter(
          (record) =>
            record.userId === userId &&
            isSameDay(record.createdAt, referenceDate)
        ) || null;

      return data;
    },
    async findAll(params?: FindAllRecordsParams) {
      let filtered = [...records];

      if (params?.userId) {
        filtered = filtered.filter((r) => r.userId === params.userId);
      }

      if (params?.type) {
        filtered = filtered.filter((r) => r.type === params.type);
      }

      if (params?.startDate && params?.endDate) {
        const start = startOfDay(parseISO(params.startDate));
        const end = endOfDay(parseISO(params.endDate));

        filtered = filtered.filter((r) => {
          const createdAt = new Date(r.createdAt);
          return createdAt >= start && createdAt <= end;
        });
      }

      const offset = params?.offset ?? 0;
      const limit = params?.limit ?? filtered.length;

      const paginated = filtered.slice(offset, offset + limit);
      const total = filtered.length;

      const nextOffset = offset + paginated.length;

      const hasMore = nextOffset < total;

      return {
        data: paginated,
        total,
        nextOffset: hasMore ? nextOffset : null,
        hasMore,
      };
    },
  };
}
