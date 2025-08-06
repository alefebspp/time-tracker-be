import { describe, it, expect, vi, beforeEach } from "vitest";
import { endOfDay, parseISO, startOfDay } from "date-fns";

import * as recordsService from "./records.service";
import Record from "../record.model";
import { FindAllRecordsParams } from "../types";

const mockRepo = {
  create: vi.fn(),
  getTodayRecords: vi.fn(),
  findAll: vi.fn(async (params?: FindAllRecordsParams) => {
    let filtered = [...mockRecords];

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
  }),
};

const mockRecords: Record[] = [
  {
    id: "start-record",
    type: "start",
    userId: "user-id",
    createdAt: new Date(),
  },
  {
    id: "end-record",
    type: "end",
    userId: "user-id",
    createdAt: new Date(),
  },
  {
    id: "1",
    userId: "user-1",
    type: "start",
    createdAt: new Date("2025-07-04T08:00:00Z"),
  },
  {
    id: "2",
    userId: "user-1",
    type: "end",
    createdAt: new Date("2025-07-04T17:00:00Z"),
  },
  {
    id: "3",
    userId: "user-1",
    type: "start",
    createdAt: new Date("2025-07-05T09:00:00Z"),
  },
  {
    id: "4",
    userId: "user-1",
    type: "end",
    createdAt: new Date("2025-07-05T17:00:00Z"),
  },
  {
    id: "5",
    userId: "user-2",
    type: "start",
    createdAt: new Date("2025-07-06T10:00:00Z"),
  },
  {
    id: "6",
    userId: "user-2",
    type: "end",
    createdAt: new Date("2025-07-06T18:00:00Z"),
  },
];

describe("Records service", () => {
  describe("Create record", () => {
    it("should not allow creating a 'start' record twice in the same day", async () => {
      mockRepo.getTodayRecords.mockResolvedValue(
        mockRecords.filter(({ type }) => type !== "end")
      );

      await expect(
        recordsService.createRecord(mockRepo, {
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
        recordsService.createRecord(mockRepo, {
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
        recordsService.createRecord(mockRepo, {
          userId: "user-id",
          type: "end",
          createdAt: new Date(),
        })
      ).rejects.toThrowError(
        "Você precisa iniciar o expediente antes de finalizá-lo."
      );
    });
  });

  describe("List records", () => {
    it("should list all records for a specific user", async () => {
      const records = await recordsService.listRecords(mockRepo, {
        userId: "user-1",
      });

      expect(records.data).toHaveLength(4);
      expect(records.data.every((r) => r.userId === "user-1")).toBe(true);
    });

    it("should filter records by type 'start'", async () => {
      const records = await recordsService.listRecords(mockRepo, {
        type: "start",
      });

      expect(records.data).toHaveLength(4); // 4 registros do tipo 'start' no mockRecords
      expect(records.data.every((r) => r.type === "start")).toBe(true);
    });

    it("should filter records by type 'end'", async () => {
      const records = await recordsService.listRecords(mockRepo, {
        type: "end",
      });

      expect(records.data).toHaveLength(4); // 4 registros do tipo 'end' no mockRecords
      expect(records.data.every((r) => r.type === "end")).toBe(true);
    });

    it("should limit the number of returned records", async () => {
      const records = await recordsService.listRecords(mockRepo, { limit: 2 });

      expect(records.data).toHaveLength(2);
    });

    it("should apply offset correctly", async () => {
      const firstPage = await recordsService.listRecords(mockRepo, {
        limit: 2,
      });
      const secondPage = await recordsService.listRecords(mockRepo, {
        limit: 2,
        offset: 2,
      });

      expect(secondPage.data[0].id).not.toBe(firstPage.data[0].id);
    });

    it("should filter records by startDate and endDate", async () => {
      const records = await recordsService.listRecords(mockRepo, {
        startDate: "2025-07-05",
        endDate: "2025-07-05",
      });

      expect(records.data).toHaveLength(2);

      records.data.forEach((r) => {
        const createdAt = new Date(r.createdAt);
        const start = new Date("2025-07-05T00:00:00.000Z");
        const end = new Date("2025-07-05T23:59:59.999Z");

        expect(createdAt >= start && createdAt <= end).toBe(true);
      });
    });

    it("should return an empty array if no records match the date range", async () => {
      const records = await recordsService.listRecords(mockRepo, {
        startDate: "2025-07-01",
        endDate: "2025-07-02",
      });

      expect(records.data).toHaveLength(0);
    });

    it("should combine filters: userId, type, and date", async () => {
      const records = await recordsService.listRecords(mockRepo, {
        userId: "user-1",
        type: "start",
        startDate: "2025-07-04",
        endDate: "2025-07-04",
      });

      expect(records.data).toHaveLength(1);
      expect(records.data[0].type).toBe("start");
      expect(records.data[0].userId).toBe("user-1");
    });
  });
});
