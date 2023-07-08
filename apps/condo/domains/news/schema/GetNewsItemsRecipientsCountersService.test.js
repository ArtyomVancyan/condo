/**
 * Generated by `createservice news.GetNewsItemsRecipientsCountersService --type mutations`
 */
const { pick } = require('lodash')

const {
    makeLoggedInAdminClient,
    makeClient,
    expectToThrowAuthenticationError, expectToThrowAccessDeniedErrorToResult,
} = require('@open-condo/keystone/test.utils')

const { getNewsItemsRecipientsCountersByTestClient, propertyMap1x9x4 } = require('@condo/domains/news/utils/testSchema')
const {
    createTestOrganization,
    createTestOrganizationEmployeeRole,
} = require('@condo/domains/organization/utils/testSchema')
const { createTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { FLAT_UNIT_TYPE } = require('@condo/domains/property/constants/common')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { createTestResident } = require('@condo/domains/resident/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, createTestUser } = require('@condo/domains/user/utils/testSchema')

let adminClient, staffClientYes
let dummyO10n
describe('GetNewsItemsRecipientsCountersService', () => {
    beforeAll(async () => {
        adminClient = await makeLoggedInAdminClient()
        const [o10n] = await createTestOrganization(adminClient)
        dummyO10n = o10n

        staffClientYes = await makeClientWithNewRegisteredAndLoggedInUser()
        const [roleYes] = await createTestOrganizationEmployeeRole(adminClient, o10n, { canManageNewsItems: true })
        await createTestOrganizationEmployee(adminClient, o10n, staffClientYes.user, roleYes)
    })

    test('The data for counters calculated correctly', async () => {
        const [property1] = await createTestProperty(adminClient, dummyO10n, { map: propertyMap1x9x4 })
        const [property2] = await createTestProperty(adminClient, dummyO10n, { map: propertyMap1x9x4 })
        const [property3] = await createTestProperty(adminClient, dummyO10n, { map: propertyMap1x9x4 })
        const [user11] = await createTestUser(adminClient)
        const [user12] = await createTestUser(adminClient)
        const [user13] = await createTestUser(adminClient)
        const [user14] = await createTestUser(adminClient)
        const [user15] = await createTestUser(adminClient)
        const [user16] = await createTestUser(adminClient)
        const [user21] = await createTestUser(adminClient)

        await createTestResident(adminClient, user11, property1, { unitType: 'flat', unitName: '1' })
        await createTestResident(adminClient, user12, property1, { unitType: 'flat', unitName: '1' })

        await createTestResident(adminClient, user12, property1, { unitType: 'flat', unitName: '2' })
        await createTestResident(adminClient, user12, property1, { unitType: 'flat', unitName: '3' })

        await createTestResident(adminClient, user13, property1, { unitType: 'flat', unitName: '4' })
        await createTestResident(adminClient, user14, property1, { unitType: 'flat', unitName: '4' })
        await createTestResident(adminClient, user15, property1, { unitType: 'flat', unitName: '4' })

        // 10050* - unitName not from map
        await createTestResident(adminClient, user16, property1, { unitType: 'flat', unitName: '100500' })

        await createTestResident(adminClient, user21, property2, { unitType: 'flat', unitName: '1' })

        await createTestResident(adminClient, user11, property3, { unitType: 'flat', unitName: '100501' })

        const payload1 = {
            organization: pick(dummyO10n, 'id'),
            newsItemScopes: [
                { property: { id: property1.id }, unitType: FLAT_UNIT_TYPE, unitName: '1' },
                { property: { id: property1.id }, unitType: FLAT_UNIT_TYPE, unitName: '36' },
            ],
        }
        const [data1] = await getNewsItemsRecipientsCountersByTestClient(staffClientYes, payload1)

        const payload2 = {
            organization: pick(dummyO10n, 'id'),
            newsItemScopes: [
                { property: { id: property1.id }, unitType: null, unitName: null },
            ],
        }
        const [data2] = await getNewsItemsRecipientsCountersByTestClient(staffClientYes, payload2)

        const payload3 = {
            organization: pick(dummyO10n, 'id'),
            newsItemScopes: [
                { property: null, unitType: null, unitName: null },
            ],
        }
        const [data3] = await getNewsItemsRecipientsCountersByTestClient(staffClientYes, payload3)

        const payload4 = {
            organization: pick(dummyO10n, 'id'),
            newsItemScopes: [
                { property: { id: property1.id }, unitType: FLAT_UNIT_TYPE, unitName: '1' },
                { property: { id: property2.id }, unitType: FLAT_UNIT_TYPE, unitName: '36' },
            ],
        }
        const [data4] = await getNewsItemsRecipientsCountersByTestClient(staffClientYes, payload4)

        const payload5 = {
            organization: pick(dummyO10n, 'id'),
            newsItemScopes: [
                { property: { id: property3.id }, unitType: null, unitName: null },
            ],
        }
        const [data5] = await getNewsItemsRecipientsCountersByTestClient(staffClientYes, payload5)

        const payload6 = {
            organization: pick(dummyO10n, 'id'),
            newsItemScopes: [
                { property: { id: property2.id }, unitType: null, unitName: null },
                { property: { id: property3.id }, unitType: null, unitName: null },
            ],
        }
        const [data6] = await getNewsItemsRecipientsCountersByTestClient(staffClientYes, payload6)

        expect(data1).toEqual({ propertiesCount: 1, unitsCount: 2, receiversCount: 1 })
        expect(data2).toEqual({ propertiesCount: 1, unitsCount: 36, receiversCount: 4 })
        expect(data3).toEqual({ propertiesCount: 3, unitsCount: 108, receiversCount: 5 })
        expect(data4).toEqual({ propertiesCount: 2, unitsCount: 2, receiversCount: 1 })
        expect(data5).toEqual({ propertiesCount: 1, unitsCount: 36, receiversCount: 0 })
        expect(data6).toEqual({ propertiesCount: 2, unitsCount: 72, receiversCount: 1 })
    })

    test('anonymous can\'t execute', async () => {
        const anonymousClient = await makeClient()
        await expectToThrowAuthenticationError(async () => {
            await getNewsItemsRecipientsCountersByTestClient(anonymousClient, {
                organization: pick(dummyO10n, 'id'),
                newsItemScopes: [{ property: null, unitType: null, unitName: null }],
            })
        }, 'result')
    })

    test('staff without permission can\'t execute', async () => {
        const staffClientNo = await makeClientWithNewRegisteredAndLoggedInUser()
        const [roleNo] = await createTestOrganizationEmployeeRole(adminClient, dummyO10n, { canManageNewsItems: false })
        await createTestOrganizationEmployee(adminClient, dummyO10n, staffClientNo.user, roleNo)

        await expectToThrowAccessDeniedErrorToResult(async () => {
            await getNewsItemsRecipientsCountersByTestClient(staffClientNo, {
                organization: pick(dummyO10n, 'id'),
                newsItemScopes: [{ property: null, unitType: null, unitName: null }],
            })
        })
    })
})