/**
 * Generated by `createschema organization.Organization 'country:Select:ru,en; name:Text; description?:Text; avatar?:File; meta:Json; employees:Relationship:OrganizationEmployee:CASCADE; statusTransitions:Json; defaultEmployeeRoleStatusTransitions:Json'`
 */
const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@core/keystone/test.utils')

const { RUSSIA_COUNTRY } = require('@condo/domains/common/constants/countries')
const {
    catchErrorFrom,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAuthenticationErrorToObj,
} = require('@condo/domains/common/utils/testSchema')
const {
    VALID_RU_INN_10,
    VALID_RU_INN_12,
    INVALID_RU_INN_10,
    INVALID_RU_INN_12,
    SOME_RANDOM_LETTERS,
} = require('@condo/domains/common/utils/tin.utils.spec')

const { createTestOrganizationLink } = require('@condo/domains/organization/utils/testSchema')
const { createTestOrganizationWithAccessToAnotherOrganization } = require('@condo/domains/organization/utils/testSchema')
const { DEFAULT_STATUS_TRANSITIONS, STATUS_IDS } = require('@condo/domains/ticket/constants/statusTransitions')
const { makeClientWithRegisteredOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const {
    Organization,
    createTestOrganization,
    updateTestOrganization,
    OrganizationEmployee,
    updateTestOrganizationEmployee,
} = require('@condo/domains/organization/utils/testSchema')

const { createTestOrganizationEmployeeRole } = require('../utils/testSchema')
const { createTestOrganizationEmployee } = require('../utils/testSchema')

describe('Organization', () => {
    // Despite just registered user can create Organization from UI, calling `Organization.create`
    // should be forbidden for it. User can create organization using UI, because it executes
    // `registerNewOrganization` GraphQL mutation, that creates all the stuff without
    // access check, using `execGqlWithoutAccess` under the hood.
    test('user: create Organization', async () => {
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestOrganization(userClient)
        })
    })

    test('anonymous: create Organization', async () => {
        const client = await makeClient()

        await expectToThrowAuthenticationErrorToObj(async () => {
            await createTestOrganization(client)
        })
    })

    test('user: read Organization — only those, it employed in', async () => {
        const admin = await makeLoggedInAdminClient()

        await createTestOrganization(admin)

        const client = await makeClientWithRegisteredOrganization()
        const objs = await Organization.getAll(client, {})

        expect(objs).toHaveLength(1)
        expect(objs[0].id).toEqual(client.organization.id)
    })

    test('anonymous: read Organization', async () => {
        const client = await makeClient()

        await expectToThrowAuthenticationErrorToObjects(async () => {
            await Organization.getAll(client)
        })
    })

    describe('user: update Organization',  () => {
        describe('not employed into organization', () => {
            it('cannot regardless of granted "canManageOrganization"', async () => {
                [true, false].map(async (canManageOrganization) => {
                    const admin = await makeLoggedInAdminClient()
                    const [organization] = await createTestOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                        canManageOrganization,
                    })
                    const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()

                    await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

                    const [anotherOrganization] = await createTestOrganization(admin)

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await updateTestOrganization(managerUserClient, anotherOrganization.id)
                    })
                })
            })

        })

        describe('employed into organization', () => {
            it('cannot without granted "canManageOrganization"', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageOrganization: false,
                })
                const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()

                await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestOrganization(managerUserClient, organization.id)
                })
            })

            it('can with granted "canManageOrganization"', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageOrganization: true,
                })
                const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()

                await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

                const [objUpdated, attrs] = await updateTestOrganization(managerUserClient, organization.id)

                expect(objUpdated.id).toEqual(organization.id)
                expect(objUpdated.dv).toEqual(1)
                expect(objUpdated.sender).toEqual(attrs.sender)
                expect(objUpdated.v).toEqual(2)
                expect(objUpdated.newId).toEqual(null)
                expect(objUpdated.name).toEqual(attrs.name)
                expect(objUpdated.description).toEqual(attrs.description)
                expect(objUpdated.county).toEqual(attrs.county)
                expect(objUpdated.meta).toEqual(attrs.meta)
                expect(objUpdated.deletedAt).toEqual(null)
                expect(objUpdated.createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
                expect(objUpdated.updatedBy).toEqual(expect.objectContaining({ id: managerUserClient.user.id }))
                expect(objUpdated.createdAt).toMatch(DATETIME_RE)
                expect(objUpdated.updatedAt).toMatch(DATETIME_RE)
                expect(objUpdated.updatedAt).not.toEqual(objUpdated.createdAt)
            })

            it.skip('cannot update "statusTransitions"', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageOrganization: true,
                })
                const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()

                await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

                await catchErrorFrom(async () => {
                    await updateTestOrganization(managerUserClient, organization.id, {
                        statusTransitions: {
                            ...DEFAULT_STATUS_TRANSITIONS,
                            [STATUS_IDS.DECLINED]: [STATUS_IDS.OPEN],
                        },
                    })
                }, ({ errors, data }) => {
                    expect(errors[0]).toMatchObject({
                        'message': 'You do not have access to this resource',
                        'name': 'AccessDeniedError',
                        'path': ['obj'],
                        'data': {
                            'type': 'mutation',
                            'target': 'updateOrganization',
                            'restrictedFields': [ 'statusTransitions' ],
                        },
                    })
                    expect(data).toEqual({ 'obj': null })
                })
            })

            it.skip('cannot update "defaultEmployeeRoleStatusTransitions"', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageOrganization: true,
                })
                const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()

                await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

                await catchErrorFrom(async () => {
                    await updateTestOrganization(managerUserClient, organization.id, {
                        defaultEmployeeRoleStatusTransitions: {
                            ...DEFAULT_STATUS_TRANSITIONS,
                            [STATUS_IDS.DECLINED]: [STATUS_IDS.OPEN],
                        },
                    })
                }, ({ errors, data }) => {
                    expect(errors[0]).toMatchObject({
                        'message': 'You do not have access to this resource',
                        'name': 'AccessDeniedError',
                        'path': ['obj'],
                        'data': {
                            'type': 'mutation',
                            'target': 'updateOrganization',
                            'restrictedFields': [ 'defaultEmployeeRoleStatusTransitions' ],
                        },
                    })
                    expect(data).toEqual({ 'obj': null })
                })
            })
        })
    })

    test('anonymous: update Organization', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestOrganization(admin)
        const client = await makeClient()

        await expectToThrowAuthenticationErrorToObj(async () => {
            await updateTestOrganization(client, objCreated.id)
        })
    })

    test('user: delete Organization', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestOrganization(admin)
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await Organization.delete(userClient, objCreated.id)
        })
    })

    test('anonymous: delete Organization', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestOrganization(admin)
        const client = await makeClient()

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await Organization.delete(client, objCreated.id)
        })
    })

    test('default status transitions is defined', async () => {
        const { organization } = await makeClientWithRegisteredOrganization()

        expect(organization.statusTransitions).toBeDefined()
        expect(organization.defaultEmployeeRoleStatusTransitions).toMatchObject(DEFAULT_STATUS_TRANSITIONS)
    })

    test('admin: can create Organization', async () => {
        const admin = await makeLoggedInAdminClient()
        const [obj, attrs] = await createTestOrganization(admin)

        expect(obj.id).toMatch(UUID_RE)
        expect(obj.dv).toEqual(1)
        expect(obj.sender).toEqual(attrs.sender)
        expect(obj.v).toEqual(1)
        expect(obj.newId).toEqual(null)
        expect(obj.deletedAt).toEqual(null)
        expect(obj.createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
        expect(obj.updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
        expect(obj.createdAt).toMatch(DATETIME_RE)
        expect(obj.updatedAt).toMatch(DATETIME_RE)
    })

    test('user: deleted user dont have access to update organization', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageEmployees: true,
            canManageOrganization: true,
        })
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        const [obj] = await createTestOrganizationEmployee(admin, organization, userClient.user, role)

        await updateTestOrganization(userClient, organization.id, { name: 'name2' })
        await updateTestOrganizationEmployee(userClient, obj.id, { deletedAt: 'true' })

        const objs = await OrganizationEmployee.getAll(userClient)

        expect(objs).toHaveLength(0)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestOrganization(userClient, organization.id, { name: 'name3' })
        })
    })

    test('employee from "from" related organization: can read organization', async () => {
        const { clientFrom, organizationTo } = await createTestOrganizationWithAccessToAnotherOrganization()
        const organizations = await Organization.getAll(clientFrom, { id: organizationTo.id })

        expect(organizations).toHaveLength(1)
    })

    test('employee from "to" related organization: cannot read organization from "from"', async () => {
        const { organizationFrom, clientTo } = await createTestOrganizationWithAccessToAnotherOrganization()
        const organizations = await Organization.getAll(clientTo, { id: organizationFrom.id })

        expect(organizations).toHaveLength(0)
    })

    test('user: cannot read not his own organizations', async () => {
        await createTestOrganizationWithAccessToAnotherOrganization()

        const user = await makeClientWithNewRegisteredAndLoggedInUser()
        const organizations = await Organization.getAll(user)

        expect(organizations).toHaveLength(0)
    })
})

describe('organization INN: various cases',  () => {
    test('admin: create Organization with valid 10 digits RU INN and RU country code ', async () => {
        const admin = await makeLoggedInAdminClient()
        const [createdOrganization] = await createTestOrganization(admin, { meta: { inn: VALID_RU_INN_10 }, country: RUSSIA_COUNTRY })

        const organizationData = await Organization.getAll(admin, { id: createdOrganization.id })

        expect(organizationData).toHaveLength(1)
        expect(organizationData[0].tin).toEqual(VALID_RU_INN_10)
    })

    test('admin: create Organization with valid 12 digits RU INN and RU country code ', async () => {
        const admin = await makeLoggedInAdminClient()
        const [createdOrganization] = await createTestOrganization(admin, { meta: { inn: VALID_RU_INN_12 }, country: RUSSIA_COUNTRY })

        const organizationData = await Organization.getAll(admin, { id: createdOrganization.id })

        expect(organizationData).toHaveLength(1)
        expect(organizationData[0].tin).toEqual(null)
    })

    test('admin: create Organization with invalid 10 digits RU INN and RU country code ', async () => {
        const admin = await makeLoggedInAdminClient()
        const [createdOrganization] = await createTestOrganization(admin, { meta: { inn: INVALID_RU_INN_10 }, country: RUSSIA_COUNTRY })

        const organizationData = await Organization.getAll(admin, { id: createdOrganization.id })

        expect(organizationData).toHaveLength(1)
        expect(organizationData[0].tin).toEqual(null)
    })

    test('admin: create Organization with invalid 12 digits RU INN and RU country code ', async () => {
        const admin = await makeLoggedInAdminClient()
        const [createdOrganization] = await createTestOrganization(admin, { meta: { inn: INVALID_RU_INN_12 }, country: RUSSIA_COUNTRY })

        const organizationData = await Organization.getAll(admin, { id: createdOrganization.id })

        expect(organizationData).toHaveLength(1)
        expect(organizationData[0].tin).toEqual(null)
    })

    test('admin: create Organization with random letters 10 chars RU INN and RU country code ', async () => {
        const admin = await makeLoggedInAdminClient()
        const [createdOrganization] = await createTestOrganization(admin, { meta: { inn: SOME_RANDOM_LETTERS }, country: RUSSIA_COUNTRY })

        const organizationData = await Organization.getAll(admin, { id: createdOrganization.id })

        expect(organizationData).toHaveLength(1)
        expect(organizationData[0].tin).toEqual(null)
    })
})
