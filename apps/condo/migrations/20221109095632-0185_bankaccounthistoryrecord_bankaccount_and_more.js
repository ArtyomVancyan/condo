// auto generated by kmigrator
// KMIGRATOR:0185_bankaccounthistoryrecord_bankaccount_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMC4zIG9uIDIwMjItMTEtMDkgMDQ6NTYKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKaW1wb3J0IGRqYW5nby5kYi5tb2RlbHMuZGVsZXRpb24KCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAxODRfYXV0b18yMDIyMTEwMl8xNDAyJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkNyZWF0ZU1vZGVsKAogICAgICAgICAgICBuYW1lPSdiYW5rYWNjb3VudGhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBmaWVsZHM9WwogICAgICAgICAgICAgICAgKCdvcmdhbml6YXRpb24nLCBtb2RlbHMuVVVJREZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCd0aW4nLCBtb2RlbHMuVGV4dEZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCdjb3VudHJ5JywgbW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgncm91dGluZ051bWJlcicsIG1vZGVscy5UZXh0RmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ251bWJlcicsIG1vZGVscy5UZXh0RmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ2N1cnJlbmN5Q29kZScsIG1vZGVscy5UZXh0RmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ2FwcHJvdmVkQXQnLCBtb2RlbHMuRGF0ZVRpbWVGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnYXBwcm92ZWRCeScsIG1vZGVscy5VVUlERmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ2ltcG9ydElkJywgbW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgndGVycml0b3J5Q29kZScsIG1vZGVscy5UZXh0RmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ2JhbmtOYW1lJywgbW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnbWV0YScsIG1vZGVscy5KU09ORmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ3Rpbk1ldGEnLCBtb2RlbHMuSlNPTkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCdyb3V0aW5nTnVtYmVyTWV0YScsIG1vZGVscy5KU09ORmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ2lkJywgbW9kZWxzLlVVSURGaWVsZChwcmltYXJ5X2tleT1UcnVlLCBzZXJpYWxpemU9RmFsc2UpKSwKICAgICAgICAgICAgICAgICgndicsIG1vZGVscy5JbnRlZ2VyRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ2NyZWF0ZWRBdCcsIG1vZGVscy5EYXRlVGltZUZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCd1cGRhdGVkQXQnLCBtb2RlbHMuRGF0ZVRpbWVGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnY3JlYXRlZEJ5JywgbW9kZWxzLlVVSURGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgndXBkYXRlZEJ5JywgbW9kZWxzLlVVSURGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnZGVsZXRlZEF0JywgbW9kZWxzLkRhdGVUaW1lRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ25ld0lkJywgbW9kZWxzLkpTT05GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnZHYnLCBtb2RlbHMuSW50ZWdlckZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCdzZW5kZXInLCBtb2RlbHMuSlNPTkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCdoaXN0b3J5X2RhdGUnLCBtb2RlbHMuRGF0ZVRpbWVGaWVsZCgpKSwKICAgICAgICAgICAgICAgICgnaGlzdG9yeV9hY3Rpb24nLCBtb2RlbHMuQ2hhckZpZWxkKGNob2ljZXM9WygnYycsICdjJyksICgndScsICd1JyksICgnZCcsICdkJyldLCBtYXhfbGVuZ3RoPTUwKSksCiAgICAgICAgICAgICAgICAoJ2hpc3RvcnlfaWQnLCBtb2RlbHMuVVVJREZpZWxkKGRiX2luZGV4PVRydWUpKSwKICAgICAgICAgICAgXSwKICAgICAgICAgICAgb3B0aW9ucz17CiAgICAgICAgICAgICAgICAnZGJfdGFibGUnOiAnQmFua0FjY291bnRIaXN0b3J5UmVjb3JkJywKICAgICAgICAgICAgfSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQ3JlYXRlTW9kZWwoCiAgICAgICAgICAgIG5hbWU9J2JhbmthY2NvdW50JywKICAgICAgICAgICAgZmllbGRzPVsKICAgICAgICAgICAgICAgICgndGluJywgbW9kZWxzLlRleHRGaWVsZCgpKSwKICAgICAgICAgICAgICAgICgnY291bnRyeScsIG1vZGVscy5DaGFyRmllbGQoY2hvaWNlcz1bKCdlbicsICdlbicpLCAoJ3J1JywgJ3J1JyldLCBtYXhfbGVuZ3RoPTUwKSksCiAgICAgICAgICAgICAgICAoJ3JvdXRpbmdOdW1iZXInLCBtb2RlbHMuVGV4dEZpZWxkKCkpLAogICAgICAgICAgICAgICAgKCdudW1iZXInLCBtb2RlbHMuVGV4dEZpZWxkKCkpLAogICAgICAgICAgICAgICAgKCdjdXJyZW5jeUNvZGUnLCBtb2RlbHMuVGV4dEZpZWxkKCkpLAogICAgICAgICAgICAgICAgKCdhcHByb3ZlZEF0JywgbW9kZWxzLkRhdGVUaW1lRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ2ltcG9ydElkJywgbW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgndGVycml0b3J5Q29kZScsIG1vZGVscy5UZXh0RmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ2JhbmtOYW1lJywgbW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnbWV0YScsIG1vZGVscy5KU09ORmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ3Rpbk1ldGEnLCBtb2RlbHMuSlNPTkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCdyb3V0aW5nTnVtYmVyTWV0YScsIG1vZGVscy5KU09ORmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ2lkJywgbW9kZWxzLlVVSURGaWVsZChwcmltYXJ5X2tleT1UcnVlLCBzZXJpYWxpemU9RmFsc2UpKSwKICAgICAgICAgICAgICAgICgndicsIG1vZGVscy5JbnRlZ2VyRmllbGQoZGVmYXVsdD0xKSksCiAgICAgICAgICAgICAgICAoJ2NyZWF0ZWRBdCcsIG1vZGVscy5EYXRlVGltZUZpZWxkKGJsYW5rPVRydWUsIGRiX2luZGV4PVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCd1cGRhdGVkQXQnLCBtb2RlbHMuRGF0ZVRpbWVGaWVsZChibGFuaz1UcnVlLCBkYl9pbmRleD1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnZGVsZXRlZEF0JywgbW9kZWxzLkRhdGVUaW1lRmllbGQoYmxhbms9VHJ1ZSwgZGJfaW5kZXg9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ25ld0lkJywgbW9kZWxzLlVVSURGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnZHYnLCBtb2RlbHMuSW50ZWdlckZpZWxkKCkpLAogICAgICAgICAgICAgICAgKCdzZW5kZXInLCBtb2RlbHMuSlNPTkZpZWxkKCkpLAogICAgICAgICAgICAgICAgKCdhcHByb3ZlZEJ5JywgbW9kZWxzLkZvcmVpZ25LZXkoYmxhbms9VHJ1ZSwgZGJfY29sdW1uPSdhcHByb3ZlZEJ5JywgbnVsbD1UcnVlLCBvbl9kZWxldGU9ZGphbmdvLmRiLm1vZGVscy5kZWxldGlvbi5TRVRfTlVMTCwgcmVsYXRlZF9uYW1lPScrJywgdG89J19kamFuZ29fc2NoZW1hLnVzZXInKSksCiAgICAgICAgICAgICAgICAoJ2NyZWF0ZWRCeScsIG1vZGVscy5Gb3JlaWduS2V5KGJsYW5rPVRydWUsIGRiX2NvbHVtbj0nY3JlYXRlZEJ5JywgbnVsbD1UcnVlLCBvbl9kZWxldGU9ZGphbmdvLmRiLm1vZGVscy5kZWxldGlvbi5TRVRfTlVMTCwgcmVsYXRlZF9uYW1lPScrJywgdG89J19kamFuZ29fc2NoZW1hLnVzZXInKSksCiAgICAgICAgICAgICAgICAoJ29yZ2FuaXphdGlvbicsIG1vZGVscy5Gb3JlaWduS2V5KGRiX2NvbHVtbj0nb3JnYW5pemF0aW9uJywgb25fZGVsZXRlPWRqYW5nby5kYi5tb2RlbHMuZGVsZXRpb24uQ0FTQ0FERSwgcmVsYXRlZF9uYW1lPScrJywgdG89J19kamFuZ29fc2NoZW1hLm9yZ2FuaXphdGlvbicpKSwKICAgICAgICAgICAgICAgICgndXBkYXRlZEJ5JywgbW9kZWxzLkZvcmVpZ25LZXkoYmxhbms9VHJ1ZSwgZGJfY29sdW1uPSd1cGRhdGVkQnknLCBudWxsPVRydWUsIG9uX2RlbGV0ZT1kamFuZ28uZGIubW9kZWxzLmRlbGV0aW9uLlNFVF9OVUxMLCByZWxhdGVkX25hbWU9JysnLCB0bz0nX2RqYW5nb19zY2hlbWEudXNlcicpKSwKICAgICAgICAgICAgXSwKICAgICAgICAgICAgb3B0aW9ucz17CiAgICAgICAgICAgICAgICAnZGJfdGFibGUnOiAnQmFua0FjY291bnQnLAogICAgICAgICAgICB9LAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRDb25zdHJhaW50KAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiYW5rYWNjb3VudCcsCiAgICAgICAgICAgIGNvbnN0cmFpbnQ9bW9kZWxzLlVuaXF1ZUNvbnN0cmFpbnQoY29uZGl0aW9uPW1vZGVscy5RKCgnZGVsZXRlZEF0X19pc251bGwnLCBUcnVlKSksIGZpZWxkcz0oJ3RpbicsICdyb3V0aW5nTnVtYmVyJywgJ251bWJlcicpLCBuYW1lPSdCYW5rX2FjY291bnRfdW5pcXVlX3Rpbl9yb3V0aW5nTnVtYmVyX251bWJlcicpLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Create model bankaccounthistoryrecord
--
CREATE TABLE "BankAccountHistoryRecord" ("organization" uuid NULL, "tin" text NULL, "country" text NULL, "routingNumber" text NULL, "number" text NULL, "currencyCode" text NULL, "approvedAt" timestamp with time zone NULL, "approvedBy" uuid NULL, "importId" text NULL, "territoryCode" text NULL, "bankName" text NULL, "meta" jsonb NULL, "tinMeta" jsonb NULL, "routingNumberMeta" jsonb NULL, "id" uuid NOT NULL PRIMARY KEY, "v" integer NULL, "createdAt" timestamp with time zone NULL, "updatedAt" timestamp with time zone NULL, "createdBy" uuid NULL, "updatedBy" uuid NULL, "deletedAt" timestamp with time zone NULL, "newId" jsonb NULL, "dv" integer NULL, "sender" jsonb NULL, "history_date" timestamp with time zone NOT NULL, "history_action" varchar(50) NOT NULL, "history_id" uuid NOT NULL);
--
-- Create model bankaccount
--
CREATE TABLE "BankAccount" ("tin" text NOT NULL, "country" varchar(50) NOT NULL, "routingNumber" text NOT NULL, "number" text NOT NULL, "currencyCode" text NOT NULL, "approvedAt" timestamp with time zone NULL, "importId" text NULL, "territoryCode" text NULL, "bankName" text NULL, "meta" jsonb NULL, "tinMeta" jsonb NULL, "routingNumberMeta" jsonb NULL, "id" uuid NOT NULL PRIMARY KEY, "v" integer NOT NULL, "createdAt" timestamp with time zone NULL, "updatedAt" timestamp with time zone NULL, "deletedAt" timestamp with time zone NULL, "newId" uuid NULL, "dv" integer NOT NULL, "sender" jsonb NOT NULL, "approvedBy" uuid NULL, "createdBy" uuid NULL, "organization" uuid NOT NULL, "updatedBy" uuid NULL);
--
-- Create constraint Bank_account_unique_tin_routingNumber_number on model bankaccount
--
CREATE UNIQUE INDEX "Bank_account_unique_tin_routingNumber_number" ON "BankAccount" ("tin", "routingNumber", "number") WHERE "deletedAt" IS NULL;
CREATE INDEX "BankAccountHistoryRecord_history_id_87eb6a7f" ON "BankAccountHistoryRecord" ("history_id");
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_approvedBy_e0216065_fk_User_id" FOREIGN KEY ("approvedBy") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_createdBy_65711eb1_fk_User_id" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_organization_32a731d7_fk_Organization_id" FOREIGN KEY ("organization") REFERENCES "Organization" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_updatedBy_b4d2cb78_fk_User_id" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "BankAccount_createdAt_a84feae1" ON "BankAccount" ("createdAt");
CREATE INDEX "BankAccount_updatedAt_f9436c1d" ON "BankAccount" ("updatedAt");
CREATE INDEX "BankAccount_deletedAt_b77401f0" ON "BankAccount" ("deletedAt");
CREATE INDEX "BankAccount_approvedBy_e0216065" ON "BankAccount" ("approvedBy");
CREATE INDEX "BankAccount_createdBy_65711eb1" ON "BankAccount" ("createdBy");
CREATE INDEX "BankAccount_organization_32a731d7" ON "BankAccount" ("organization");
CREATE INDEX "BankAccount_updatedBy_b4d2cb78" ON "BankAccount" ("updatedBy");
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Create constraint Bank_account_unique_tin_routingNumber_number on model bankaccount
--
DROP INDEX IF EXISTS "Bank_account_unique_tin_routingNumber_number";
--
-- Create model bankaccount
--
DROP TABLE "BankAccount" CASCADE;
--
-- Create model bankaccounthistoryrecord
--
DROP TABLE "BankAccountHistoryRecord" CASCADE;
COMMIT;

    `)
}
