import RecordRepository, {
  CreateRecordDTO,
  FindAllRecordsParams,
} from "../repository/record.repository";
import createRecord from "../services/create-record.service";
import listRecords from "../services/list-records.service";

export function makeCreateRecordService(recordRepository: RecordRepository) {
  return async function createRecordWithRepo(data: CreateRecordDTO) {
    return createRecord(recordRepository, data);
  };
}

export function makeListRecordsService(recordRepository: RecordRepository) {
  return async function listRecordsWithRepo(params?: FindAllRecordsParams) {
    return listRecords(recordRepository, params);
  };
}
