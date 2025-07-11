import RecordRepository, {
  FindAllRecordsParams,
} from "../repository/record.repository";

export default async function listRecords(
  recordRepository: RecordRepository,
  params?: FindAllRecordsParams
) {
  return recordRepository.findAll(params);
}
