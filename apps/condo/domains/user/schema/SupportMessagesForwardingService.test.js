/**
 * Generated by `createservice user.SupportMessagesForwardingService`
 */

const { supportMessagesForwardingByTestClient } = require('@condo/domains/user/utils/testSchema')
const { MESSAGE_SENDING_STATUS } = require('@condo/domains/notification/constants/constants')
const { RU_LOCALE } = require('@condo/domains/common/constants/locale')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const conf = require('@core/config')
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { makeLoggedInAdminClient, UploadingFile } = require('@core/keystone/test.utils')
const { createTestResident } = require('@condo/domains/resident/utils/testSchema')
const { addResidentAccess } = require('@condo/domains/user/utils/testSchema')
const { registerNewOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { Message } = require('@condo/domains/notification/utils/testSchema')
const path = require('path')

const EMAIL_API_CONFIG = (conf.EMAIL_API_CONFIG) ? JSON.parse(conf.EMAIL_API_CONFIG) : null
const FORWARDING_EMAILS_FROM = 'doma-test-messages-forwarding@mailforspam.com'

describe('SupportMessagesForwardingService', async () => {
    test('Forward message to support: with attachments, with emailFrom', async () => {
        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()
        await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)

        const os = 'android'

        const payload = {
            os,
            attachments: [
                new UploadingFile(path.resolve(conf.PROJECT_ROOT, 'apps/condo/domains/user/test-assets/simple-text-file.txt')),
                new UploadingFile(path.resolve(conf.PROJECT_ROOT, 'apps/condo/domains/user/test-assets/dino.png')),
            ],
            text: `Test message from resident to support. This message should be sent from ${FORWARDING_EMAILS_FROM} and contains an attachment.`,
            email: FORWARDING_EMAILS_FROM, // email passed from mobile application
            appVersion: '0.0.1a',
            lang: RU_LOCALE,
            meta: {},
        }

        const [result] = await supportMessagesForwardingByTestClient(userClient, payload)
        expect(result.status).toEqual(MESSAGE_SENDING_STATUS)

        const messages = await Message.getAll(adminClient, { id: result.id })
        expect(messages).toHaveLength(1)
        expect(messages[0].meta.attachments).toHaveLength(2)
        expect(messages[0].meta.os).toEqual(os)
    })

    test('Forward message to support: no attachments', async () => {
        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()
        await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)

        const payload = {
            text: `Test message from resident to support. This message should be sent from ${FORWARDING_EMAILS_FROM}`,
            email: FORWARDING_EMAILS_FROM, // email passed from mobile application
            os: 'android',
            appVersion: '0.0.1a',
            lang: RU_LOCALE,
            meta: {},
        }

        const [result] = await supportMessagesForwardingByTestClient(userClient, payload)
        expect(result.status).toEqual(MESSAGE_SENDING_STATUS)
        const messages = await Message.getAll(adminClient, { id: result.id })
        expect(messages).toHaveLength(1)
    })

    test('Forward message to support: synthetic test with two organizations', async () => {
        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()
        const [organization] = await registerNewOrganization(userClient)
        const [property] = await createTestProperty(adminClient, organization)

        await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property)
        await createTestResident(adminClient, userClient.user, organization, property)
        await addResidentAccess(userClient.user)

        const payload = {
            text: `Test message from resident to support. This message should be sent from ${FORWARDING_EMAILS_FROM}. Resident must be attached to two organizations.`,
            email: FORWARDING_EMAILS_FROM, // email passed from mobile application
            os: 'ios',
            appVersion: '0.0.1a',
            lang: RU_LOCALE,
            meta: {},
        }

        const [result] = await supportMessagesForwardingByTestClient(userClient, payload)
        expect(result.status).toEqual(MESSAGE_SENDING_STATUS)

        const messages = await Message.getAll(adminClient, { id: result.id })
        expect(messages).toHaveLength(1)
        expect(messages[0].meta.organizationsData).toHaveLength(2)
    })

    test('Forward message to support: no attachments, no email', async () => {
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        const { from: defaultFrom } = EMAIL_API_CONFIG
        const payload = {
            text: `Test message from resident to support. In this message resident has not passed the email address, so the sender's email is default: ${defaultFrom}`,
            os: 'android',
            appVersion: '0.0.1a',
            lang: RU_LOCALE,
            meta: {},
        }

        const [result] = await supportMessagesForwardingByTestClient(userClient, payload)
        expect(result.status).toEqual(MESSAGE_SENDING_STATUS)
    })
})