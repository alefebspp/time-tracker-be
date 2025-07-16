import RecordRepository, {
  FindAllRecordsParams,
} from "../repository/record.repository";

export function listRecords(recordRepository: RecordRepository) {
  return async function (params?: FindAllRecordsParams) {
    return recordRepository.findAll(params);
  };
}
