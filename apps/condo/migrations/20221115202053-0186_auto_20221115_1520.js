// auto generated by kmigrator
// KMIGRATOR:0186_auto_20221115_1520:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi43IG9uIDIwMjItMTEtMTUgMTU6MjAKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAxODVfd2ViaG9va3N1YnNjcmlwdGlvbl9mYWlsdXJlc2NvdW50X2FuZF9tb3JlJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdyZW1vdGVjbGllbnQnLAogICAgICAgICAgICBuYW1lPSdwdXNoVHlwZScsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5DaGFyRmllbGQoYmxhbms9VHJ1ZSwgY2hvaWNlcz1bKCdkZWZhdWx0JywgJ2RlZmF1bHQnKSwgKCdzaWxlbnRfZGF0YScsICdzaWxlbnRfZGF0YScpXSwgbWF4X2xlbmd0aD01MCksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdyZW1vdGVjbGllbnRoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0ncHVzaFR5cGUnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;

SET statement_timeout = '1500s'; 

--
-- Add field pushType to remoteclient
--
ALTER TABLE "RemoteClient" ADD COLUMN "pushType" varchar(50) DEFAULT 'default' NOT NULL;
ALTER TABLE "RemoteClient" ALTER COLUMN "pushType" DROP DEFAULT;
--
-- Add field pushType to remoteclienthistoryrecord
--
ALTER TABLE "RemoteClientHistoryRecord" ADD COLUMN "pushType" text NULL;

SET statement_timeout = '10s'; 

COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field pushType to remoteclienthistoryrecord
--
ALTER TABLE "RemoteClientHistoryRecord" DROP COLUMN "pushType" CASCADE;
--
-- Add field pushType to remoteclient
--
ALTER TABLE "RemoteClient" DROP COLUMN "pushType" CASCADE;
COMMIT;

    `)
}
