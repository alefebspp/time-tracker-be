import { toZonedTime, fromZonedTime, format } from "date-fns-tz";
import RecordRepository from "../repository/record.repository";
import { CreateRecordParams, FindAllRecordsParams } from "../types";
import { BadRequestError } from "@/errors";
import { ERROR_MESSAGES, TIMEZONE, RECORD_TYPES } from "@/constants";

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

  const hasStart = typesToday.includes(RECORD_TYPES.START);
  const hasEnd = typesToday.includes(RECORD_TYPES.END);

  if (data.type === RECORD_TYPES.START) {
    if (hasEnd) {
      throw new BadRequestError(ERROR_MESSAGES.ALREADY_FINISHED);
    }

    if (hasStart && !hasEnd) {
      throw new BadRequestError(ERROR_MESSAGES.ALREADY_STARTED);
    }
  }

  if (data.type === RECORD_TYPES.END) {
    if (!hasStart) {
      throw new BadRequestError(ERROR_MESSAGES.NEED_TO_START_FIRST);
    }
    if (hasEnd) {
      throw new BadRequestError(ERROR_MESSAGES.ALREADY_ENDED);
    }
  }

  await recordRepository.create({ ...data, createdAt });
}
