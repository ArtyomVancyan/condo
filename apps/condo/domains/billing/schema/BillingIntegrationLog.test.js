/**
 * Generated by `createschema billing.BillingIntegrationLog 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; type:Text; message:Text; meta:Json'`
 */

const faker = require('faker')
const { registerNewOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const { makeOrganizationIntegrationManager } = require('@condo/domains/billing/utils/testSchema')
const { makeContextWithOrganizationAndIntegrationAsAdmin } = require('@condo/domains/billing/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithServiceUser } = require('@condo/domains/user/utils/testSchema')
const { getRandomString, makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { BillingIntegrationLog, createTestBillingIntegrationLog, updateTestBillingIntegrationLog, createTestBillingIntegrationOrganizationContext, createTestBillingIntegrationAccessRight, createTestBillingIntegration } = require('@condo/domains/billing/utils/testSchema')
const { expectToThrowAuthenticationErrorToObjects, expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObj } = require('@condo/domains/common/utils/testSchema')
const { expectToThrowGraphQLRequestError } = require('../../common/utils/testSchema')

describe('BillingIntegrationLog', () => {
    test('admin: create BillingIntegrationLog', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [obj] = await createTestBillingIntegrationLog(admin, context)

        expect(obj.context.id).toEqual(context.id)
    })

    test('organization integration manager: create BillingIntegrationLog', async () => {
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestBillingIntegrationLog(managerUserClient, context)
        })
    })

    test('user: create BillingIntegrationLog', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestBillingIntegrationLog(client, context)
        })
    })

    test('anonymous: create BillingIntegrationLog', async () => {
        const client = await makeClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

        await expectToThrowAuthenticationErrorToObj(async () => {
            await createTestBillingIntegrationLog(client, context)
        })
    })

    test('admin: read BillingIntegrationLog', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [obj] = await createTestBillingIntegrationLog(admin, context)
        const logs = await BillingIntegrationLog.getAll(admin, { id: obj.id })

        expect(logs).toHaveLength(1)
    })

    test('organization integration manager: read BillingIntegrationLog', async () => {
        const admin = await makeLoggedInAdminClient()
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
        const [obj] = await createTestBillingIntegrationLog(admin, context)
        const logs = await BillingIntegrationLog.getAll(managerUserClient, { id: obj.id })

        expect(logs).toHaveLength(1)
    })

    test('user: read BillingIntegrationLog', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [obj] = await createTestBillingIntegrationLog(admin, context)
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const logs = await BillingIntegrationLog.getAll(client, { id: obj.id })

        expect(logs).toHaveLength(0)
    })

    test('anonymous: read BillingIntegrationLog', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        await createTestBillingIntegrationLog(admin, context)
        const client = await makeClient()

        await expectToThrowAuthenticationErrorToObjects(async () => {
            await BillingIntegrationLog.getAll(client)
        })
    })

    test('admin: update BillingIntegrationLog', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [obj] = await createTestBillingIntegrationLog(admin, context)
        const message = faker.lorem.words()
        const payload = {
            message,
        }
        const [objUpdated] = await updateTestBillingIntegrationLog(admin, obj.id, payload)

        expect(obj.id).toEqual(objUpdated.id)
        expect(objUpdated.message).toEqual(message)
    })

    test('organization integration manager: update BillingIntegrationLog', async () => {
        const admin = await makeLoggedInAdminClient()
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
        const [obj] = await createTestBillingIntegrationLog(admin, context)
        const message = faker.lorem.words()
        const payload = {
            message,
        }
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestBillingIntegrationLog(managerUserClient, obj.id, payload)
        })
    })

    test('user: update BillingIntegrationLog', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [obj] = await createTestBillingIntegrationLog(admin, context)
        const message = faker.lorem.words()
        const payload = {
            message,
        }

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestBillingIntegrationLog(client, obj.id, payload)
        })
    })

    test('anonymous: update BillingIntegrationLog', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [obj] = await createTestBillingIntegrationLog(admin, context)
        const message = faker.lorem.words()
        const payload = {
            message,
        }

        await expectToThrowAuthenticationErrorToObj(async () => {
            await updateTestBillingIntegrationLog(client, obj.id, payload)
        })
    })

    test('user: delete BillingIntegrationLog', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [obj] = await createTestBillingIntegrationLog(admin, context)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await BillingIntegrationLog.delete(client, obj.id)
        })
    })

    test('anonymous: delete BillingIntegrationLog', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [obj] = await createTestBillingIntegrationLog(admin, context)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await BillingIntegrationLog.delete(client, obj.id)
        })
    })

    test('user: can see the logs', async () => {
        const integrationClient = await makeClientWithServiceUser()
        // const hackerClient = await makeClientWithNewRegisteredAndLoggedInUser()
        const adminClient = await makeLoggedInAdminClient()
        const [integration] = await createTestBillingIntegration(adminClient)
        await createTestBillingIntegrationAccessRight(adminClient, integration, integrationClient.user)

        // user setup the Integration for his organization
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        const [organization] = await registerNewOrganization(userClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(userClient, organization, integration)

        // integration account create log record
        const message = getRandomString()
        const [logMessage] = await createTestBillingIntegrationLog(integrationClient, context, { message })
        expect(logMessage.id).toBeTruthy()

        // user can see the log record
        const logs = await BillingIntegrationLog.getAll(userClient, { id: logMessage.id })
        expect(logs).toEqual([expect.objectContaining({ message })])

        // user doesn't have access to change log record
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await BillingIntegrationLog.update(userClient, logMessage.id, { message: 'no message' })
        })

        // hacker client doesn't have access to the integration log record
        // TODO(pahaz): wait https://github.com/keystonejs/keystone/issues/4829
        // const hackerResult = await BillingIntegrationLog.getAll(hackerClient, { context: { id: context.id } })
        // expect(hackerResult).toEqual([])
    })
    describe('Validation tests', () => {
        test('Context field cannot be changed', async () => {
            const { context, admin } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const { context: anotherContext } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [integrationLog] = await createTestBillingIntegrationLog(admin, context)
            await expectToThrowGraphQLRequestError(async () => {
                await updateTestBillingIntegrationLog(admin, integrationLog.id, {
                    context: { connect: { id: anotherContext.id } },
                })
            }, 'Field "context" is not defined')
        })
    })
})

