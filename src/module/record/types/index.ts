import Record from "../record.model";

export type CreateRecordParams = Omit<Record, "id" | "updatedAt">;

export type FindAllRecordsParams = {
  userId?: string;
  type?: "start" | "end";
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
};
