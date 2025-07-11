import Record from "../record.model";

export type CreateRecordDTO = Omit<Record, "id" | "updatedAt">;

export type FindAllRecordsParams = {
  userId?: string;
  type?: "start" | "end";
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
};

export default interface RecordRepository {
  create: (data: CreateRecordDTO) => Promise<void>;
  getTodayRecords: (params: {
    userId: string;
    referenceDate?: Date;
  }) => Promise<Record[]>;
  findAll: (
    params?: FindAllRecordsParams
  ) => Promise<{
    data: Record[];
    total: number;
    nextOffset: number | null;
    hasMore: boolean;
  }>;
}
