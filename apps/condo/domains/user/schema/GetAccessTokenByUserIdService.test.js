/**
 * Generated by `createservice organization.GetAccessTokenByUserIdService --type queries`
 */

const faker = require('faker')

const { makeLoggedInAdminClient, makeClient, expectToThrowAuthenticationErrorToResult, expectToThrowAccessDeniedErrorToResult } = require('@open-condo/keystone/test.utils')

const { getSbbolSecretStorage } = require('@condo/domains/organization/integrations/sbbol/utils/getSbbolSecretStorage')
const { SBBOL_IDENTITY_TYPE } = require('@condo/domains/user/constants')
const { getAccessTokenByUserIdByTestClient, createTestExternalTokenAccessRight } = require('@condo/domains/user/utils/testSchema')
const { makeClientWithServiceUser } = require('@condo/domains/user/utils/testSchema')



describe('GetAccessTokenByUserIdService', () => {
    let admin, service, storage
    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        service = await makeClientWithServiceUser()
        await createTestExternalTokenAccessRight(admin, service.user, SBBOL_IDENTITY_TYPE)
        storage = await getSbbolSecretStorage()
    })

    test('service: execute', async () => {
        const value = faker.datatype.uuid()
        const userId = faker.datatype.uuid()

        await storage.setRefreshToken(value, userId)
        await storage.setAccessToken(value, userId)

        const payload = {
            userId,
            type: SBBOL_IDENTITY_TYPE,
        }
        const [data, attrs] = await getAccessTokenByUserIdByTestClient(service, payload)

        expect(data.accessToken).toEqual(value)
        expect(data.ttl).toBeTruthy()
    })

    test('service: execute if no ExternalTokenAccessRight instance', async () => {
        const service = await makeClientWithServiceUser()
        const value = faker.datatype.uuid()
        const userId = faker.datatype.uuid()

        await storage.setRefreshToken(value, userId)
        await storage.setAccessToken(value, userId)

        const payload = {
            userId,
            type: SBBOL_IDENTITY_TYPE,
        }
        await expectToThrowAccessDeniedErrorToResult(async () => {
            await getAccessTokenByUserIdByTestClient(service, payload)
        })
    })

    test('anonymous: execute', async () => {
        const client = await makeClient()
        const userId = faker.datatype.uuid()
        const payload = {
            userId,
            type: SBBOL_IDENTITY_TYPE,
        }

        await expectToThrowAuthenticationErrorToResult(async () => {
            await getAccessTokenByUserIdByTestClient(client, payload)
        })
    })

    test('admin: execute', async () => {
        const value = faker.datatype.uuid()
        const userId = faker.datatype.uuid()

        await storage.setRefreshToken(value, userId)
        await storage.setAccessToken(value, userId)

        const payload = {
            userId,
            type: SBBOL_IDENTITY_TYPE,
        }
        const [data, attrs] = await getAccessTokenByUserIdByTestClient(admin, payload)

        expect(data.accessToken).toEqual(value)
        expect(data.ttl).toBeTruthy()
    })
})