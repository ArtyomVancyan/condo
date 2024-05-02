// auto generated by kmigrator
// KMIGRATOR:0387_alter_message_type_alter_messageappblacklist_type_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMS41IG9uIDIwMjQtMDQtMTggMDg6NDUKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAzODZfYXV0b18yMDI0MDQxN18xMjE4JyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFsdGVyRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J21lc3NhZ2UnLAogICAgICAgICAgICBuYW1lPSd0eXBlJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLlRleHRGaWVsZCgpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BbHRlckZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdtZXNzYWdlYXBwYmxhY2tsaXN0JywKICAgICAgICAgICAgbmFtZT0ndHlwZScsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5UZXh0RmllbGQoKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWx0ZXJGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nbWVzc2FnZW9yZ2FuaXphdGlvbmJsYWNrbGlzdCcsCiAgICAgICAgICAgIG5hbWU9J3R5cGUnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKCksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFsdGVyRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J21lc3NhZ2V1c2VyYmxhY2tsaXN0JywKICAgICAgICAgICAgbmFtZT0ndHlwZScsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5UZXh0RmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWx0ZXJGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nbm90aWZpY2F0aW9uYW5vbnltb3Vzc2V0dGluZycsCiAgICAgICAgICAgIG5hbWU9J21lc3NhZ2VUeXBlJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BbHRlckZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdub3RpZmljYXRpb251c2Vyc2V0dGluZycsCiAgICAgICAgICAgIG5hbWU9J21lc3NhZ2VUeXBlJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Alter field type on message
--
--
-- NOTE: This is not needed because on prod it is already of type Text
--
-- ALTER TABLE "Message" ALTER COLUMN "type" TYPE text USING "type"::text;
--
-- Alter field type on messageappblacklist
--
ALTER TABLE "MessageAppBlackList" ALTER COLUMN "type" TYPE text USING "type"::text;
--
-- Alter field type on messageorganizationblacklist
--
ALTER TABLE "MessageOrganizationBlackList" ALTER COLUMN "type" TYPE text USING "type"::text;
--
-- Alter field type on messageuserblacklist
--
ALTER TABLE "MessageUserBlackList" ALTER COLUMN "type" TYPE text USING "type"::text;
--
-- Alter field messageType on notificationanonymoussetting
--
ALTER TABLE "NotificationAnonymousSetting" ALTER COLUMN "messageType" TYPE text USING "messageType"::text;
--
-- Alter field messageType on notificationusersetting
--
ALTER TABLE "NotificationUserSetting" ALTER COLUMN "messageType" TYPE text USING "messageType"::text;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Alter field messageType on notificationusersetting
--
ALTER TABLE "NotificationUserSetting" ALTER COLUMN "messageType" TYPE varchar(128) USING "messageType"::varchar(128);
--
-- Alter field messageType on notificationanonymoussetting
--
ALTER TABLE "NotificationAnonymousSetting" ALTER COLUMN "messageType" TYPE varchar(128) USING "messageType"::varchar(128);
--
-- Alter field type on messageuserblacklist
--
ALTER TABLE "MessageUserBlackList" ALTER COLUMN "type" TYPE varchar(128) USING "type"::varchar(128);
--
-- Alter field type on messageorganizationblacklist
--
ALTER TABLE "MessageOrganizationBlackList" ALTER COLUMN "type" TYPE varchar(128) USING "type"::varchar(128);
--
-- Alter field type on messageappblacklist
--
ALTER TABLE "MessageAppBlackList" ALTER COLUMN "type" TYPE varchar(128) USING "type"::varchar(128);
--
-- Alter field type on message
--
ALTER TABLE "Message" ALTER COLUMN "type" TYPE varchar(128) USING "type"::varchar(128);
COMMIT;

    `)
}