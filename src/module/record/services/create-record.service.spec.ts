import { describe, it, beforeEach, expect, vi } from "vitest";

import RecordRepository, {
  CreateRecordDTO,
} from "../repository/record.repository";

import { makeService } from "@/utils";
import { createRecord } from "./create-record.service";
import Record from "../record.model";

let sut: (data: CreateRecordDTO) => Promise<void>;

const mockRepo = {
  create: vi.fn(),
  getTodayRecords: vi.fn(),
};

const mockRecords: Record[] = [
  {
    id: "start-record",
    type: "start",
    userId: "user-id",
    createdAt: new Date(),
  },
  {
    id: "start-record",
    type: "end",
    userId: "user-id",
    createdAt: new Date(),
  },
];

describe("Create record repository", () => {
  beforeEach(async () => {
    const createRecordService = makeService(
      mockRepo as unknown as RecordRepository,
      createRecord
    );

    sut = createRecordService;
  });

  it("should not allow creating a 'start' record twice in the same day", async () => {
    mockRepo.getTodayRecords.mockResolvedValue(
      mockRecords.filter(({ type }) => type !== "end")
    );

    await expect(
      sut({
        userId: "user-id",
        type: "start",
        createdAt: new Date(),
      })
    ).rejects.toThrowError(
      "Você já iniciou o expediente e ainda não finalizou."
    );
  });

  it("should not allow creating a 'start' record if a 'end' record exists", async () => {
    mockRepo.getTodayRecords.mockResolvedValue(mockRecords);

    await expect(
      sut({
        userId: "user-id",
        type: "start",
        createdAt: new Date(),
      })
    ).rejects.toThrowError(
      "Expediente já finalizado, não é possível iniciar novamente."
    );
  });

  it("should not allow creating a 'end' record if a 'start' record does not exists", async () => {
    mockRepo.getTodayRecords.mockResolvedValue([]);

    await expect(
      sut({
        userId: "user-id",
        type: "end",
        createdAt: new Date(),
      })
    ).rejects.toThrowError(
      "Você precisa iniciar o expediente antes de finalizá-lo."
    );
  });
});
