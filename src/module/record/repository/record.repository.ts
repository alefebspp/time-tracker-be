import Record from "../record.model";
import { CreateRecordParams, FindAllRecordsParams } from "../types";

export default interface RecordRepository {
  create: (data: CreateRecordParams) => Promise<void>;
  getTodayRecords: (params: {
    userId: string;
    referenceDate?: Date;
  }) => Promise<Record[]>;
  findAll: (params?: FindAllRecordsParams) => Promise<{
    data: Record[];
    total: number;
    nextOffset: number | null;
    hasMore: boolean;
  }>;
}
