// auto generated by kmigrator
// KMIGRATOR:0232_alter_banksynctask_account_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMS43IG9uIDIwMjMtMDMtMTAgMTE6MTkKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKaW1wb3J0IGRqYW5nby5kYi5tb2RlbHMuZGVsZXRpb24KCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAyMzFfcmVuYW1lX2JhbmtpbnRlZ3JhdGlvbmNvbnRleHRfYmFua2ludGVncmF0aW9uYWNjb3VudGNvbnRleHRfYW5kX21vcmUnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgICAgIG1pZ3JhdGlvbnMuQWx0ZXJGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nYmFua3N5bmN0YXNrJywKICAgICAgICAgICAgbmFtZT0nYWNjb3VudCcsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5Gb3JlaWduS2V5KGJsYW5rPVRydWUsIGRiX2NvbHVtbj0nYWNjb3VudCcsIG51bGw9VHJ1ZSwgb25fZGVsZXRlPWRqYW5nby5kYi5tb2RlbHMuZGVsZXRpb24uQ0FTQ0FERSwgcmVsYXRlZF9uYW1lPScrJywgdG89J19kamFuZ29fc2NoZW1hLmJhbmthY2NvdW50JyksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFsdGVyRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J2JhbmtzeW5jdGFzaycsCiAgICAgICAgICAgIG5hbWU9J2ludGVncmF0aW9uQ29udGV4dCcsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5Gb3JlaWduS2V5KGJsYW5rPVRydWUsIGRiX2NvbHVtbj0naW50ZWdyYXRpb25Db250ZXh0JywgbnVsbD1UcnVlLCBvbl9kZWxldGU9ZGphbmdvLmRiLm1vZGVscy5kZWxldGlvbi5DQVNDQURFLCByZWxhdGVkX25hbWU9JysnLCB0bz0nX2RqYW5nb19zY2hlbWEuYmFua2ludGVncmF0aW9uYWNjb3VudGNvbnRleHQnKSwKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Alter field account on banksynctask
--
ALTER TABLE "BankSyncTask" ALTER COLUMN "account" DROP NOT NULL;
--
-- Alter field integrationContext on banksynctask
--
ALTER TABLE "BankSyncTask" ALTER COLUMN "integrationContext" DROP NOT NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Alter field integrationContext on banksynctask
--
ALTER TABLE "BankSyncTask" ALTER COLUMN "integrationContext" SET NOT NULL;
--
-- Alter field account on banksynctask
--
ALTER TABLE "BankSyncTask" ALTER COLUMN "account" SET NOT NULL;
COMMIT;

    `)
}