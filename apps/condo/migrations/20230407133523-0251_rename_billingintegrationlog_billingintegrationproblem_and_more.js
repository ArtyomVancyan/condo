// auto generated by kmigrator
// KMIGRATOR:0251_rename_billingintegrationlog_billingintegrationproblem_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMS41IG9uIDIwMjMtMDQtMDcgMDg6MzUKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKaW1wb3J0IGRqYW5nby5kYi5tb2RlbHMuZGVsZXRpb24KCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAyNTBfYmFua2FjY291bnRyZXBvcnRoaXN0b3J5cmVjb3JkX2FuZF9tb3JlJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLlJlbmFtZU1vZGVsKAogICAgICAgICAgICBvbGRfbmFtZT0nYmlsbGluZ2ludGVncmF0aW9ubG9nJywKICAgICAgICAgICAgbmV3X25hbWU9J2JpbGxpbmdpbnRlZ3JhdGlvbnByb2JsZW0nLAogICAgICAgICksCiMgICAgICAgIG1pZ3JhdGlvbnMuUmVtb3ZlRmllbGQoCiMgICAgICAgICAgICBtb2RlbF9uYW1lPSdiaWxsaW5nYWNjb3VudG1ldGVyJywKIyAgICAgICAgICAgIG5hbWU9J2FjY291bnQnLAojICAgICAgICApLAojICAgICAgICBtaWdyYXRpb25zLlJlbW92ZUZpZWxkKAojICAgICAgICAgICAgbW9kZWxfbmFtZT0nYmlsbGluZ2FjY291bnRtZXRlcicsCiMgICAgICAgICAgICBuYW1lPSdjb250ZXh0JywKIyAgICAgICAgKSwKIyAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKIyAgICAgICAgICAgIG1vZGVsX25hbWU9J2JpbGxpbmdhY2NvdW50bWV0ZXInLAojICAgICAgICAgICAgbmFtZT0nY3JlYXRlZEJ5JywKIyAgICAgICAgKSwKIyAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKIyAgICAgICAgICAgIG1vZGVsX25hbWU9J2JpbGxpbmdhY2NvdW50bWV0ZXInLAojICAgICAgICAgICAgbmFtZT0ncHJvcGVydHknLAojICAgICAgICApLAojICAgICAgICBtaWdyYXRpb25zLlJlbW92ZUZpZWxkKAojICAgICAgICAgICAgbW9kZWxfbmFtZT0nYmlsbGluZ2FjY291bnRtZXRlcicsCiMgICAgICAgICAgICBuYW1lPSdyZXNvdXJjZScsCiMgICAgICAgICksCiMgICAgICAgIG1pZ3JhdGlvbnMuUmVtb3ZlRmllbGQoCiMgICAgICAgICAgICBtb2RlbF9uYW1lPSdiaWxsaW5nYWNjb3VudG1ldGVyJywKIyAgICAgICAgICAgIG5hbWU9J3VwZGF0ZWRCeScsCiMgICAgICAgICksCiMgICAgICAgIG1pZ3JhdGlvbnMuUmVtb3ZlRmllbGQoCiMgICAgICAgICAgICBtb2RlbF9uYW1lPSdiaWxsaW5nYWNjb3VudG1ldGVycmVhZGluZycsCiMgICAgICAgICAgICBuYW1lPSdhY2NvdW50JywKIyAgICAgICAgKSwKIyAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKIyAgICAgICAgICAgIG1vZGVsX25hbWU9J2JpbGxpbmdhY2NvdW50bWV0ZXJyZWFkaW5nJywKIyAgICAgICAgICAgIG5hbWU9J2NvbnRleHQnLAojICAgICAgICApLAojICAgICAgICBtaWdyYXRpb25zLlJlbW92ZUZpZWxkKAojICAgICAgICAgICAgbW9kZWxfbmFtZT0nYmlsbGluZ2FjY291bnRtZXRlcnJlYWRpbmcnLAojICAgICAgICAgICAgbmFtZT0nY3JlYXRlZEJ5JywKIyAgICAgICAgKSwKIyAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKIyAgICAgICAgICAgIG1vZGVsX25hbWU9J2JpbGxpbmdhY2NvdW50bWV0ZXJyZWFkaW5nJywKIyAgICAgICAgICAgIG5hbWU9J21ldGVyJywKIyAgICAgICAgKSwKIyAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKIyAgICAgICAgICAgIG1vZGVsX25hbWU9J2JpbGxpbmdhY2NvdW50bWV0ZXJyZWFkaW5nJywKIyAgICAgICAgICAgIG5hbWU9J3Byb3BlcnR5JywKIyAgICAgICAgKSwKIyAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKIyAgICAgICAgICAgIG1vZGVsX25hbWU9J2JpbGxpbmdhY2NvdW50bWV0ZXJyZWFkaW5nJywKIyAgICAgICAgICAgIG5hbWU9J3VwZGF0ZWRCeScsCiMgICAgICAgICksCiMgICAgICAgIG1pZ3JhdGlvbnMuUmVtb3ZlRmllbGQoCiMgICAgICAgICAgICBtb2RlbF9uYW1lPSdiaWxsaW5nbWV0ZXJyZXNvdXJjZScsCiMgICAgICAgICAgICBuYW1lPSdjcmVhdGVkQnknLAojICAgICAgICApLAojICAgICAgICBtaWdyYXRpb25zLlJlbW92ZUZpZWxkKAojICAgICAgICAgICAgbW9kZWxfbmFtZT0nYmlsbGluZ21ldGVycmVzb3VyY2UnLAojICAgICAgICAgICAgbmFtZT0ndXBkYXRlZEJ5JywKIyAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLlJlbW92ZUZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiaWxsaW5naW50ZWdyYXRpb25wcm9ibGVtJywKICAgICAgICAgICAgbmFtZT0ndHlwZScsCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiaWxsaW5naW50ZWdyYXRpb25vcmdhbml6YXRpb25jb250ZXh0JywKICAgICAgICAgICAgbmFtZT0nY3VycmVudFByb2JsZW0nLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuRm9yZWlnbktleShibGFuaz1UcnVlLCBkYl9jb2x1bW49J2N1cnJlbnRQcm9ibGVtJywgbnVsbD1UcnVlLCBvbl9kZWxldGU9ZGphbmdvLmRiLm1vZGVscy5kZWxldGlvbi5TRVRfTlVMTCwgcmVsYXRlZF9uYW1lPScrJywgdG89J19kamFuZ29fc2NoZW1hLmJpbGxpbmdpbnRlZ3JhdGlvbnByb2JsZW0nKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J2JpbGxpbmdpbnRlZ3JhdGlvbm9yZ2FuaXphdGlvbmNvbnRleHRoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0nY3VycmVudFByb2JsZW0nLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVVVJREZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiaWxsaW5naW50ZWdyYXRpb25wcm9ibGVtJywKICAgICAgICAgICAgbmFtZT0ndGl0bGUnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGRlZmF1bHQ9J0Vycm9yIG9jY3VycmVkJyksCiAgICAgICAgICAgIHByZXNlcnZlX2RlZmF1bHQ9RmFsc2UsCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFsdGVyTW9kZWxUYWJsZSgKICAgICAgICAgICAgbmFtZT0nYmlsbGluZ2ludGVncmF0aW9ucHJvYmxlbScsCiAgICAgICAgICAgIHRhYmxlPSdCaWxsaW5nSW50ZWdyYXRpb25Qcm9ibGVtJywKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuRGVsZXRlTW9kZWwoCiAgICAgICAgICAgIG5hbWU9J2JpbGxpbmdtZXRlcnJlc291cmNlJywKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuRGVsZXRlTW9kZWwoCiAgICAgICAgICAgIG5hbWU9J2JpbGxpbmdhY2NvdW50bWV0ZXJyZWFkaW5nJywKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuRGVsZXRlTW9kZWwoCiAgICAgICAgICAgIG5hbWU9J2JpbGxpbmdhY2NvdW50bWV0ZXInLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5EZWxldGVNb2RlbCgKICAgICAgICAgICAgbmFtZT0nYmlsbGluZ21ldGVycmVzb3VyY2VoaXN0b3J5cmVjb3JkJywKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuRGVsZXRlTW9kZWwoCiAgICAgICAgICAgIG5hbWU9J2JpbGxpbmdhY2NvdW50bWV0ZXJyZWFkaW5naGlzdG9yeXJlY29yZCcsCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkRlbGV0ZU1vZGVsKAogICAgICAgICAgICBuYW1lPSdiaWxsaW5nYWNjb3VudG1ldGVyaGlzdG9yeXJlY29yZCcsCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Rename model billingintegrationlog to billingintegrationproblem
--
-- (no-op)
--
-- Remove field type from billingintegrationproblem
--
ALTER TABLE "BillingIntegrationLog" DROP COLUMN "type" CASCADE;
--
-- Add field currentProblem to billingintegrationorganizationcontext
--
ALTER TABLE "BillingIntegrationOrganizationContext" ADD COLUMN "currentProblem" uuid NULL CONSTRAINT "BillingIntegrationOr_currentProblem_a7576e44_fk_BillingIn" REFERENCES "BillingIntegrationLog"("id") DEFERRABLE INITIALLY DEFERRED; SET CONSTRAINTS "BillingIntegrationOr_currentProblem_a7576e44_fk_BillingIn" IMMEDIATE;
--
-- Add field currentProblem to billingintegrationorganizationcontexthistoryrecord
--
ALTER TABLE "BillingIntegrationOrganizationContextHistoryRecord" ADD COLUMN "currentProblem" uuid NULL;
--
-- Add field title to billingintegrationproblem
--
ALTER TABLE "BillingIntegrationLog" ADD COLUMN "title" text DEFAULT 'Error occurred' NOT NULL;
ALTER TABLE "BillingIntegrationLog" ALTER COLUMN "title" DROP DEFAULT;
--
-- Rename table for billingintegrationproblem to BillingIntegrationProblem
--
ALTER TABLE "BillingIntegrationLog" RENAME TO "BillingIntegrationProblem";
--
-- Delete model billingmeterresource
--
DROP TABLE "BillingMeterResource" CASCADE;
--
-- Delete model billingaccountmeterreading
--
DROP TABLE "BillingAccountMeterReading" CASCADE;
--
-- Delete model billingaccountmeter
--
DROP TABLE "BillingAccountMeter" CASCADE;
--
-- Delete model billingmeterresourcehistoryrecord
--
DROP TABLE "BillingMeterResourceHistoryRecord" CASCADE;
--
-- Delete model billingaccountmeterreadinghistoryrecord
--
DROP TABLE "BillingAccountMeterReadingHistoryRecord" CASCADE;
--
-- Delete model billingaccountmeterhistoryrecord
--
DROP TABLE "BillingAccountMeterHistoryRecord" CASCADE;
CREATE INDEX "BillingIntegrationOrganizationContext_currentProblem_a7576e44" ON "BillingIntegrationOrganizationContext" ("currentProblem");
COMMIT;

    `)
}

exports.down = async (knex) => {
    throw new Error('no auto backward migration')
}
