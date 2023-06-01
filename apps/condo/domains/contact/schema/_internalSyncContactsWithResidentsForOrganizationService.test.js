/**
 * Generated by `createservice contact._internalSyncContactsWithResidentsForOrganizationService --type mutations`
 */

const {
    makeLoggedInAdminClient,
    makeClient,
    expectToThrowAccessDeniedErrorToResult,
    expectToThrowAuthenticationErrorToResult,
} = require('@open-condo/keystone/test.utils')

const {
    _internalSyncContactsWithResidentsForOrganizationByTestClient,
    createTestContact,
} = require('@condo/domains/contact/utils/testSchema')
const {
    makeClientWithProperty,
    createTestProperty,
} = require('@condo/domains/property/utils/testSchema')
const { createTestResident } = require('@condo/domains/resident/utils/testSchema')
const {
    makeClientWithNewRegisteredAndLoggedInUser,
    makeClientWithSupportUser,
} = require('@condo/domains/user/utils/testSchema')

 
describe('_internalSyncContactsWithResidentsForOrganizationService', () => {
    describe('Logic', () => {
        test('sync single contact', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [resident] = await createTestResident(adminClient, userClient.user, userClient.property)
            const [contacts] = await _internalSyncContactsWithResidentsForOrganizationByTestClient(adminClient, { organization: { id: resident.organization.id } })
            expect(contacts).toHaveLength(1)
            const contact = contacts[0]
            const userData = userClient.userAttrs
            expect(contact.phone).toEqual(userData.phone)
            expect(contact.name).toEqual(userData.name)
            expect(contact.email).toEqual(userData.email)
            expect(contact.organization.id).toEqual(resident.organization.id)
            expect(contact.property.id).toEqual(resident.property.id)
        })
        test('sync multiple contact', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const total = 10
            const initialUserClient = await makeClientWithProperty()
            const userClients = [initialUserClient]
            const [initialResident] = await createTestResident(adminClient, initialUserClient.user, initialUserClient.property)
            const residents = [initialResident]
            for (let i = 1; i < total; i++) {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                userClient.organization = initialUserClient.organization
                const [property] = await createTestProperty(adminClient, userClient.organization)
                userClient.property = property
                userClients.push(userClient)
                const [resident] = await createTestResident(adminClient, userClient.user, userClient.property)
                residents.push(resident)
            }
            const [contacts] = await _internalSyncContactsWithResidentsForOrganizationByTestClient(adminClient, { organization: { id: initialUserClient.organization.id } })
            expect(contacts).toHaveLength(total)
            for (const contact of contacts) {
                const userClient = userClients.find(user => user.userAttrs.phone === contact.phone)
                const resident = residents.find(resident => resident.user.id === userClient.user.id)
                const userData = userClient.userAttrs
                expect(contact.name).toEqual(userData.name)
                expect(contact.email).toEqual(userData.email)
                expect(contact.organization.id).toEqual(resident.organization.id)
                expect(contact.property.id).toEqual(resident.property.id)
            }
        })
        test('sync single contact if already exist', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [resident] = await createTestResident(adminClient, userClient.user, userClient.property)
            const duplicatedFields = {
                phone: userClient.userAttrs.phone,
            }
            await createTestContact(adminClient, resident.organization, resident.property, duplicatedFields)
            const [contacts] = await _internalSyncContactsWithResidentsForOrganizationByTestClient(adminClient, { organization: { id: resident.organization.id } })
            expect(contacts).toHaveLength(0)
        })
        test('sync single contact if few contacts already exist', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [resident] = await createTestResident(adminClient, userClient.user, userClient.property)
            const duplicatedFields = {
                phone: userClient.userAttrs.phone,
            }
            await createTestContact(adminClient, resident.organization, resident.property, duplicatedFields)
            await createTestContact(adminClient, resident.organization, resident.property, duplicatedFields)
            const [contacts] = await _internalSyncContactsWithResidentsForOrganizationByTestClient(adminClient, { organization: { id: resident.organization.id } })
            expect(contacts).toHaveLength(0)
        })

    })
    describe('Access', () => {
        test('admin: can execute', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [resident] = await createTestResident(adminClient, userClient.user, userClient.property)
            const [contacts] = await _internalSyncContactsWithResidentsForOrganizationByTestClient(adminClient, { organization: { id: resident.organization.id } })
            expect(contacts).toHaveLength(1)
        })
        test('support: can execute', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const supportClient = await makeClientWithSupportUser()
            const [resident] = await createTestResident(adminClient, userClient.user, userClient.property)
            const [contacts] = await _internalSyncContactsWithResidentsForOrganizationByTestClient(supportClient, { organization: { id: resident.organization.id } })
            expect(contacts).toHaveLength(1)
        })
        test('user: cannot execute', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [resident] = await createTestResident(adminClient, userClient.user, userClient.property)
            await expectToThrowAccessDeniedErrorToResult(async () => {
                await _internalSyncContactsWithResidentsForOrganizationByTestClient(userClient, { organization: { id: resident.organization.id } })
            })
        })
        test('anonymous: cannot execute', async () => {
            const client = await makeClient()
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [resident] = await createTestResident(adminClient, userClient.user, userClient.property)
            await expectToThrowAuthenticationErrorToResult(async () => {
                await _internalSyncContactsWithResidentsForOrganizationByTestClient(client, { organization: { id: resident.organization.id } })
            })

        })
    })
})