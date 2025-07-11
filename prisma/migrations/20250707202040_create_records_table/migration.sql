/*
  Warnings:

  - The values [break,other] on the enum `RecordType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RecordType_new" AS ENUM ('start', 'end');
ALTER TABLE "Record" ALTER COLUMN "type" TYPE "RecordType_new" USING ("type"::text::"RecordType_new");
ALTER TYPE "RecordType" RENAME TO "RecordType_old";
ALTER TYPE "RecordType_new" RENAME TO "RecordType";
DROP TYPE "RecordType_old";
COMMIT;
