import { toZonedTime, fromZonedTime, format } from "date-fns-tz";
import RecordRepository from "../repository/record.repository";
import { CreateRecordParams, FindAllRecordsParams } from "../types";
import { BadRequestError } from "@/errors";
import { ErrorMessages, TIMEZONE, RecordTypes } from "@/constants";

export function listRecords(
  recordRepository: RecordRepository,
  params?: FindAllRecordsParams
) {
  return recordRepository.findAll(params);
}

export async function createRecord(
  recordRepository: RecordRepository,
  data: CreateRecordParams
) {
  const zonedCreatedAt = toZonedTime(data.createdAt, TIMEZONE);

  const formatted = format(zonedCreatedAt, "yyyy-MM-dd HH:mm:ss", {
    timeZone: TIMEZONE,
  });

  const createdAt = fromZonedTime(formatted, "UTC");

  const todayRecords = await recordRepository.getTodayRecords({
    userId: data.userId,
    referenceDate: createdAt,
  });

  const typesToday = todayRecords.map((r) => r.type);

  const hasStart = typesToday.includes(RecordTypes.START);
  const hasEnd = typesToday.includes(RecordTypes.END);

  if (data.type === RecordTypes.START) {
    if (hasEnd) {
      throw new BadRequestError(ErrorMessages.ALREADY_FINISHED);
    }

    if (hasStart && !hasEnd) {
      throw new BadRequestError(ErrorMessages.ALREADY_STARTED);
    }
  }

  if (data.type === RecordTypes.END) {
    if (!hasStart) {
      throw new BadRequestError(ErrorMessages.NEED_TO_START_FIRST);
    }
    if (hasEnd) {
      throw new BadRequestError(ErrorMessages.ALREADY_ENDED);
    }
  }

  await recordRepository.create({ ...data, createdAt });
}
