import { describe, it, beforeEach, expect } from "vitest";

import Record from "../record.model";
import RecordRepository, {
  FindAllRecordsParams,
} from "../repository/record.repository";
import User from "@/module/user/user.model";
import makeInMemoryUserRepository, {
  InMemoryUserRepository,
} from "@/module/user/repository/in-memory-user.repository";
import makeInMemoryRecordRepository from "../repository/in-memory-record.repository";

import { makeService } from "@/utils";
import { registerUser } from "@/module/auth/services/register.service";
import { createRecord } from "./create-record.service";
import { listRecords } from "./list-records.service";

let recordRepository: RecordRepository;
let userRepository: InMemoryUserRepository;
let sut: {
  listRecordsService: (
    params?: FindAllRecordsParams
  ) => Promise<{ data: Record[] }>;
  users: User[];
};

describe("List all records service", () => {
  beforeEach(async () => {
    userRepository = makeInMemoryUserRepository();
    recordRepository = makeInMemoryRecordRepository();
    const createRecordService = makeService(recordRepository, createRecord);
    const registerService = makeService(userRepository, registerUser);
    const listRecordsService = makeService(recordRepository, listRecords);

    await registerService({
      email: "joerogan@hotmail.com",
      password: "123",
      name: "Joe Rogan",
    });
    await registerService({
      email: "johndoe@hotmail.com",
      password: "123",
      name: "John Doe",
    });

    const [user1, user2] = userRepository.users;

    const today = new Date("2025-07-06T10:00:00Z");
    const yesterday = new Date("2025-07-05T09:00:00Z");
    const twoDaysAgo = new Date("2025-07-04T08:00:00Z");

    await createRecordService({
      type: "start",
      userId: user1.id,
      createdAt: twoDaysAgo,
    });

    await createRecordService({
      type: "end",
      userId: user1.id,
      createdAt: new Date("2025-07-04T17:00:00Z"),
    });

    await createRecordService({
      type: "start",
      userId: user1.id,
      createdAt: yesterday,
    });

    await createRecordService({
      type: "end",
      userId: user1.id,
      createdAt: new Date("2025-07-05T17:00:00Z"),
    });

    await createRecordService({
      type: "start",
      userId: user2.id,
      createdAt: today,
    });

    await createRecordService({
      type: "end",
      userId: user2.id,
      createdAt: new Date("2025-07-06T18:00:00Z"),
    });

    sut = { listRecordsService, users: userRepository.users };
  });

  it("should list all records for a specific user", async () => {
    const user = sut.users[0];
    const records = await sut.listRecordsService({ userId: user.id });

    expect(records.data).toHaveLength(4);
    expect(records.data.every((r) => r.userId === user.id)).toBe(true);
  });

  it("should filter records by type 'start'", async () => {
    const records = await sut.listRecordsService({ type: "start" });

    expect(records.data).toHaveLength(3);
    expect(records.data.every((r) => r.type === "start")).toBe(true);
  });

  it("should filter records by type 'end'", async () => {
    const records = await sut.listRecordsService({ type: "end" });

    expect(records.data).toHaveLength(3);
    expect(records.data.every((r) => r.type === "end")).toBe(true);
  });

  it("should limit the number of returned records", async () => {
    const records = await sut.listRecordsService({ limit: 2 });

    expect(records.data).toHaveLength(2);
  });

  it("should apply offset correctly", async () => {
    const firstPage = await sut.listRecordsService({ limit: 2 });
    const secondPage = await sut.listRecordsService({ limit: 2, offset: 2 });

    expect(secondPage.data[0].id).not.toBe(firstPage.data[0].id);
  });

  it("should filter records by startDate and endDate", async () => {
    const records = await sut.listRecordsService({
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
    const records = await sut.listRecordsService({
      startDate: "2025-07-01",
      endDate: "2025-07-02",
    });

    expect(records.data).toHaveLength(0);
  });

  it("should combine filters: userId, type, and date", async () => {
    const user = sut.users[0];

    const records = await sut.listRecordsService({
      userId: user.id,
      type: "start",
      startDate: "2025-07-04",
      endDate: "2025-07-04",
    });

    expect(records.data).toHaveLength(1);
    expect(records.data[0].type).toBe("start");
    expect(records.data[0].userId).toBe(user.id);
  });
});
