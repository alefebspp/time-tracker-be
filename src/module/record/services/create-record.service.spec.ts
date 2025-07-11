import { describe, it, beforeEach, expect } from "vitest";

import RecordRepository, {
  CreateRecordDTO,
} from "../repository/record.repository";
import User from "@/module/user/user.model";
import makeInMemoryRecordRepository from "../repository/in-memory-record.repository";
import { makeCreateRecordService } from "../factories/record-services.factory";
import makeInMemoryUserRepository from "@/module/user/repository/in-memory-user.repository";
import AppError from "@/errors/AppError";

let recordRepository: RecordRepository;
let sut: {
  createRecordService: (data: CreateRecordDTO) => Promise<void>;
  recordRepository: RecordRepository;
  user: User;
};

describe("Create record repository", () => {
  beforeEach(async () => {
    const userRository = makeInMemoryUserRepository();
    userRository.create({
      email: "johndoe@hotmail.com",
      password: "123",
      name: "John Doe",
    });
    recordRepository = makeInMemoryRecordRepository();
    const createRecordService = makeCreateRecordService(recordRepository);

    sut = {
      recordRepository,
      createRecordService,
      user: userRository.users[0],
    };
  });

  it("should be able to create a record", async () => {
    const { createRecordService, recordRepository, user } = sut;

    await createRecordService({
      userId: user.id,
      type: "start",
      createdAt: new Date(),
    });

    const records = await recordRepository.findAll();

    expect(records.data.length).toEqual(1);
  });

  it("should not allow creating a 'start' record twice in the same day", async () => {
    const { createRecordService, user } = sut;

    await createRecordService({
      userId: user.id,
      type: "start",
      createdAt: new Date(),
    });

    expect(
      async () =>
        await createRecordService({
          userId: user.id,
          type: "start",
          createdAt: new Date(),
        })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not allow creating a 'start' record if a 'end' record exists", async () => {
    const { createRecordService, user } = sut;

    await createRecordService({
      userId: user.id,
      type: "start",
      createdAt: new Date(),
    });

    await createRecordService({
      userId: user.id,
      type: "end",
      createdAt: new Date(),
    });

    expect(
      async () =>
        await createRecordService({
          userId: user.id,
          type: "start",
          createdAt: new Date(),
        })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should not allow creating a 'end' record if a 'start' record does not exists", async () => {
    const { createRecordService, user } = sut;

    expect(
      async () =>
        await createRecordService({
          userId: user.id,
          type: "end",
          createdAt: new Date(),
        })
    ).rejects.toBeInstanceOf(AppError);
  });
});
