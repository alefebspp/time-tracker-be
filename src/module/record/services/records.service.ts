import { toZonedTime, fromZonedTime, format } from "date-fns-tz";

import AppError from "@/errors/AppError";
import RecordRepository from "../repository/record.repository";
import { CreateRecordParams, FindAllRecordsParams } from "../types";

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
  const timeZone = "America/Sao_Paulo";

  const zonedCreatedAt = toZonedTime(data.createdAt, timeZone);

  const formatted = format(zonedCreatedAt, "yyyy-MM-dd HH:mm:ss", {
    timeZone,
  });

  const createdAt = fromZonedTime(formatted, "UTC");

  const todayRecords = await recordRepository.getTodayRecords({
    userId: data.userId,
    referenceDate: createdAt,
  });
  const typesToday = todayRecords.map((r) => r.type);

  const hasStart = typesToday.includes("start");
  const hasEnd = typesToday.includes("end");

  if (data.type === "start") {
    if (hasEnd) {
      throw new AppError(
        400,
        "Expediente já finalizado, não é possível iniciar novamente."
      );
    }

    if (hasStart && !hasEnd) {
      throw new AppError(
        400,
        "Você já iniciou o expediente e ainda não finalizou."
      );
    }
  }

  if (data.type === "end") {
    if (!hasStart) {
      throw new AppError(
        400,
        "Você precisa iniciar o expediente antes de finalizá-lo."
      );
    }
    if (hasEnd) {
      throw new AppError(400, "Você já finalizou o expediente hoje.");
    }
  }

  await recordRepository.create({ ...data, createdAt });
}
