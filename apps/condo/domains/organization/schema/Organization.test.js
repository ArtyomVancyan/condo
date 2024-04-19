/**
 * Generated by `createschema organization.Organization 'country:Select:ru,en; name:Text; description?:Text; avatar?:File; meta:Json; employees:Relationship:OrganizationEmployee:CASCADE; statusTransitions:Json; defaultEmployeeRoleStatusTransitions:Json'`
 */
const { faker } = require('@faker-js/faker')
const dayjs = require('dayjs')


const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE, makeLoggedInClient, expectToThrowGQLError } = require('@open-condo/keystone/test.utils')
const {
    catchErrorFrom,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAuthenticationErrorToObj,
} = require('@open-condo/keystone/test.utils')

const { createTestAcquiringIntegration, createTestAcquiringIntegrationAccessRight, createTestAcquiringIntegrationContext, updateTestAcquiringIntegrationContext } = require('@condo/domains/acquiring/utils/testSchema')
const { createTestBillingIntegrationOrganizationContext, makeClientWithIntegrationAccess, updateTestBillingIntegrationOrganizationContext } = require('@condo/domains/billing/utils/testSchema')
const { DEFAULT_ENGLISH_COUNTRY, RUSSIA_COUNTRY } = require('@condo/domains/common/constants/countries')
const { COMMON_ERRORS } = require('@condo/domains/common/constants/errors')
const { MANAGING_COMPANY_TYPE, SERVICE_PROVIDER_TYPE } = require('@condo/domains/organization/constants/common')
const { SERVICE_PROVIDER_PROFILE_FEATURE } = require('@condo/domains/organization/constants/features')
const { generateTin, registerNewOrganization, createTestOrganizationWithAccessToAnotherOrganization, OrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const {
    Organization,
    createTestOrganization,
    updateTestOrganization,
    updateTestOrganizationEmployee,
    makeEmployeeUserClientWithAbilities,
    makeClientWithRegisteredOrganization,
} = require('@condo/domains/organization/utils/testSchema')
const {
    VALID_RU_TIN_10,
    VALID_RU_TIN_12,
    INVALID_RU_TIN_10,
    INVALID_RU_TIN_12,
    SOME_RANDOM_LETTERS,
} = require('@condo/domains/organization/utils/tin.utils.spec')
const { DEFAULT_STATUS_TRANSITIONS } = require('@condo/domains/ticket/constants/statusTransitions')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithServiceUser, makeClientWithSupportUser, createTestUser,
    createTestUserRightsSet, updateTestUser,
} = require('@condo/domains/user/utils/testSchema')


describe('Organization', () => {
    let admin
    let support
    let user
    let anonymous
    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        support = await makeClientWithSupportUser()
        user = await makeClientWithNewRegisteredAndLoggedInUser()
        anonymous = await makeClient()
    })
    describe('Basic CRUD', () => {
        describe('Create', () => {
            // Despite just registered user can create Organization from UI, calling `Organization.create`
            // should be forbidden for it. User can create organization using UI, because it executes
            // `registerNewOrganization` GraphQL mutation, that creates all the stuff without
            // access check, using `execGqlWithoutAccess` under the hood.
            // So, organization creation tests should be located in `registerNewOrganization` test suit
            test('User cannot create organization directly', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestOrganization(user)
                })
            })
            test('User with custom rights cannot create organization directly', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [userRightsSet] = await createTestUserRightsSet(support, { canReadOrganizations: true, canManageOrganizations: true })
                await updateTestUser(support, userClient.user.id, { rightsSet: { connect: { id: userRightsSet.id } } })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestOrganization(userClient)
                })
            })
            test('Support can not create organization directly', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestOrganization(support)
                })
            })
            test('Admin can create organization directly', async () => {
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
                expect(obj.isApproved).toBeTruthy()
            })
        })
        describe('Read', () => {
            test('Support can read all organizations', async () => {
                const userClient = await makeClientWithRegisteredOrganization()
                const userOrg = await Organization.getOne(support, { id: userClient.organization.id })
                expect(userOrg).toHaveProperty('id', userClient.organization.id)
            })
            test('User can read organizations in which he is an employed', async () => {
                const userClient = await makeClientWithRegisteredOrganization()
                await createTestOrganization(admin)

                const organizations = await Organization.getAll(userClient, {})
                expect(organizations).toHaveLength(1)
                expect(organizations).toEqual([expect.objectContaining({
                    id: userClient.organization.id,
                    name: userClient.organization.name,
                    description:userClient.organization.description,
                })])
            })
            test('User can read all organizations if custom access is provided', async () => {
                const [organization] = await createTestOrganization(admin)
                const customAccess = {
                    accessRules: [{
                        list: 'Organization',
                        read: true,
                    }],
                }
                const [, userAttrs] = await createTestUser(admin, { customAccess })
                const userClient = await makeLoggedInClient({ password: userAttrs.password, email: userAttrs.email })
                const org = await Organization.getOne(userClient, { id: organization.id })
                expect(org).toHaveProperty('id', organization.id)
            })
            test('User cannot read organization if he is unemployed (OrganizationEmployee was deleted)', async () => {
                const userClient = await makeEmployeeUserClientWithAbilities({
                    canManageEmployees: true,
                    canManageOrganization: true,
                })
                await updateTestOrganizationEmployee(support, userClient.employee.id, { deletedAt: 'true' })

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestOrganization(userClient, userClient.organization.id, { name: 'name3' })
                })
            })
            test('Anonymous cannot read any organization', async () => {
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await Organization.getAll(anonymous, {})
                })
            })
        })
        describe('Update', () => {
            let userOrganization
            beforeAll(async () => {
                [userOrganization] = await registerNewOrganization(user)
            })
            test('User from another organization cannot update organization regardless of granted "canManageOrganization"', async () => {
                const anotherUser = await makeEmployeeUserClientWithAbilities({
                    canManageOrganization: true,
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestOrganization(anotherUser, userOrganization.id, {})
                })
            })
            test('Organization employee with "canManageOrganization" can', async () => {
                const anotherUser = await makeEmployeeUserClientWithAbilities({
                    canManageOrganization: true,
                })
                const newName = faker.company.name()
                const [updatedOrg] = await updateTestOrganization(anotherUser, anotherUser.organization.id, {
                    name: newName,
                })
                expect(updatedOrg).toEqual(expect.objectContaining({
                    id: anotherUser.organization.id,
                    name: newName,
                }))
            })
            test('Organization employee with "canManageOrganization" cannot', async () => {
                const anotherUser = await makeEmployeeUserClientWithAbilities({
                    canManageOrganization: false,
                })

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestOrganization(anotherUser, anotherUser.organization.id, {})
                })
            })
            test('Anonymous cannot', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestOrganization(anonymous, userOrganization.id)
                })
            })
            test('Support can', async () => {
                const [updatedOrg, attrs] = await updateTestOrganization(support, userOrganization.id)
                expect(attrs).toHaveProperty('meta')
                expect(attrs).toHaveProperty('name')
                expect(attrs).toHaveProperty('description')
                expect(attrs).toHaveProperty('country')
                expect(updatedOrg).toEqual(expect.objectContaining({
                    meta: attrs.meta,
                    name: attrs.name,
                    description: attrs.description,
                    country: attrs.country,
                }))
            })

        })
        describe('Update TIN and importId Field', () => {
            let userOrganization
            beforeAll(async () => {
                [userOrganization] = await registerNewOrganization(user, { country: DEFAULT_ENGLISH_COUNTRY })
            })
            test('Owner cannot change TIN and importId fields', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestOrganization(user, userOrganization.id, { tin: generateTin(DEFAULT_ENGLISH_COUNTRY) })
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestOrganization(user, userOrganization.id, { importId: faker.datatype.uuid() })
                })
            })
            test('Support cannot change TIN and importId fields', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestOrganization(support, userOrganization.id, { tin: generateTin(DEFAULT_ENGLISH_COUNTRY) })
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestOrganization(support, userOrganization.id, { importId: faker.datatype.uuid() })
                })
            })

            test('Admin can change TIN and importId', async () => {
                const newTin = generateTin(DEFAULT_ENGLISH_COUNTRY)
                const [updatedOrg] = await updateTestOrganization(admin, userOrganization.id, { tin: newTin })
                expect(updatedOrg.tin).toEqual(newTin)
                const importId = faker.datatype.uuid()
                const [updatedImportIdOrg] = await updateTestOrganization(admin, userOrganization.id, { importId })
                expect(updatedImportIdOrg.importId).toEqual(importId)
            })
        })
        describe('Delete', () => {
            test('Nobody cannot', async () => {
                const [org] = await createTestOrganization(admin)
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await Organization.delete(admin, org.id)
                })
            })
        })
    })
    describe('Organization types', () => {
        test(`Organization should have "${MANAGING_COMPANY_TYPE}" type by default`, async () => {
            const [org] = await createTestOrganization(admin)
            expect(org).toHaveProperty('type', MANAGING_COMPANY_TYPE)
        })
        test('Support can change organization type', async () => {
            const [org] = await createTestOrganization(admin)
            const [updatedOrg] = await updateTestOrganization(support, org.id, {
                type: SERVICE_PROVIDER_TYPE,
            })
            expect(updatedOrg).toHaveProperty('type', SERVICE_PROVIDER_TYPE)
        })
        test('Employee cannot change organization type', async () => {
            const userClient = await makeEmployeeUserClientWithAbilities({
                canManageOrganization: true,
            })
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestOrganization(userClient, userClient.organization.id, {
                    type: SERVICE_PROVIDER_TYPE,
                })
            })
        })
    })
    describe('Organization status transitions', () => {
        test('Default status transitions must be created automatically', async () => {
            const { organization } = await makeClientWithRegisteredOrganization()
            expect(organization.statusTransitions).toBeDefined()
            expect(organization.defaultEmployeeRoleStatusTransitions).toMatchObject(DEFAULT_STATUS_TRANSITIONS)
        })
    })
    describe('Organization TIN', () => {
        describe('Valid cases', () => {
            const VALID_CASES = [
                [VALID_RU_TIN_10, RUSSIA_COUNTRY],
                [VALID_RU_TIN_12, RUSSIA_COUNTRY],
            ]
            test.each(VALID_CASES)('TIN: %p, Country: %p', async (tin, country) => {
                const [org] = await registerNewOrganization(user, {
                    tin,
                    country,
                })
                expect(org).toHaveProperty('tin', tin)
                expect(org).toHaveProperty('country', country)
            })
        })
        describe('Invalid cases', () => {
            const INVALID_CASES = [
                [INVALID_RU_TIN_10, RUSSIA_COUNTRY],
                [INVALID_RU_TIN_12, RUSSIA_COUNTRY],
                [SOME_RANDOM_LETTERS, RUSSIA_COUNTRY],
            ]
            test.each(INVALID_CASES)('TIN: %p, Country: %p', async (tin, country) => {
                await catchErrorFrom(async () => {
                    await registerNewOrganization(user, {
                        tin,
                        country,
                    })
                }, ({ errors }) => {
                    console.log(errors[0])
                    console.log(errors[0].originalError.errors[0].data.messages)
                    expect(errors).toEqual(expect.objectContaining([
                        expect.objectContaining({
                            name: 'GraphQLError',
                            path: ['obj'],
                            originalError: expect.objectContaining({
                                errors: expect.arrayContaining([
                                    expect.objectContaining({
                                        data: expect.objectContaining({
                                            messages: expect.arrayContaining(['Tin field has not a valid values supplied']),
                                        }),
                                    }),
                                ]),
                            }),
                        }),
                    ]))
                })
            })
        })
    })
    describe('Organization features', () => {
        test('Organization is created with no features be default', async () => {
            const [org] = await registerNewOrganization(user)
            expect(org).toHaveProperty('features', [])
        })
        test('Organization can be created with known features', async () => {
            const [obj] = await createTestOrganization(admin, { features: [SERVICE_PROVIDER_PROFILE_FEATURE] })
            expect(obj).toHaveProperty('features', [SERVICE_PROVIDER_PROFILE_FEATURE])
        })
        test('Existing organization can be enhanced with features by support', async () => {
            const client = await makeClientWithRegisteredOrganization()
            expect(client).toHaveProperty(['organization', 'id'])
            expect(client).toHaveProperty(['organization', 'features'], [])

            const [orgWithFeatures] = await updateTestOrganization(support, client.organization.id, {
                features: [SERVICE_PROVIDER_PROFILE_FEATURE],
            })
            expect(orgWithFeatures).toHaveProperty('features', [SERVICE_PROVIDER_PROFILE_FEATURE])

            const [orgWithDisabledFeature] = await updateTestOrganization(support, client.organization.id, {
                features: [],
            })
            expect(orgWithDisabledFeature).toHaveProperty('features', [])
        })
        test('Organization employee cannot set features himself', async () => {
            const orgManager = await makeClientWithRegisteredOrganization()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestOrganization(orgManager, orgManager.organization.id, { features: [SERVICE_PROVIDER_PROFILE_FEATURE] })
            })
        })
    })
    describe('Service user access', () => {
        describe('Billing integration', () => {
            test('Can access to organization with existing billing integration context', async () => {
                const serviceUserClient = await makeClientWithIntegrationAccess(support)
                const [organization] = await registerNewOrganization(user)
                const noCtxOrg = await Organization.getOne(serviceUserClient, { id: organization.id })
                expect(noCtxOrg).toBeUndefined()

                const [ctx] = await createTestBillingIntegrationOrganizationContext(user, organization, serviceUserClient.integration)
                const org = await Organization.getOne(serviceUserClient, { id: organization.id })
                expect(org).toHaveProperty('id', organization.id)

                await updateTestBillingIntegrationOrganizationContext(support, ctx.id, { deletedAt: dayjs().toISOString() })
                const noOrg = await Organization.getOne(serviceUserClient, { id: organization.id })
                expect(noOrg).toBeUndefined()
            })
        })
        describe('Acquiring integration', () => {
            test('Can access to organization with existing billing acquiring context', async () => {
                const [organization] = await registerNewOrganization(user)
                const serviceUserClient = await makeClientWithServiceUser()
                const [acquiringIntegration] = await createTestAcquiringIntegration(admin)
                await createTestAcquiringIntegrationAccessRight(admin, acquiringIntegration, serviceUserClient.user)

                const noCtxOrg = await Organization.getOne(serviceUserClient, { id: organization.id })
                expect(noCtxOrg).toBeUndefined()

                const [ctx] = await createTestAcquiringIntegrationContext(user, organization, acquiringIntegration)
                const org = await Organization.getOne(serviceUserClient, { id: organization.id })
                expect(org).toHaveProperty('id', organization.id)

                await updateTestAcquiringIntegrationContext(support, ctx.id, { deletedAt: dayjs().toISOString() })
                const noOrg = await Organization.getOne(serviceUserClient, { id: organization.id })
                expect(noOrg).toBeUndefined()
            })
        })
    })
    describe('Related organizations', () => {
        test('Employee from "from" related organization: can read organization from "to" organization', async () => {
            const { clientFrom, organizationTo } = await createTestOrganizationWithAccessToAnotherOrganization()
            const organizations = await Organization.getAll(clientFrom, { id: organizationTo.id })

            expect(organizations).toHaveLength(1)
        })
        test('employee from "to" related organization: cannot read organization from "from"', async () => {
            const { organizationFrom, clientTo } = await createTestOrganizationWithAccessToAnotherOrganization()
            const organizations = await Organization.getAll(clientTo, { id: organizationFrom.id })

            expect(organizations).toHaveLength(0)
        })
        test('blocked employee from related organization cannot read', async () => {
            const { clientFrom, employeeFrom, organizationTo } = await createTestOrganizationWithAccessToAnotherOrganization()
            await updateTestOrganizationEmployee(admin, employeeFrom.id, { isBlocked: true })
            const organizations = await Organization.getAll(clientFrom, { id: organizationTo.id })

            expect(organizations).toHaveLength(0)
        })
        test('deleted employee from related organization cannot read', async () => {
            const { clientFrom, employeeFrom, organizationTo } = await createTestOrganizationWithAccessToAnotherOrganization()
            await OrganizationEmployee.softDelete(admin, employeeFrom.id)
            const organizations = await Organization.getAll(clientFrom, { id: organizationTo.id })

            expect(organizations).toHaveLength(0)
        })
    })
    describe('Fields', () => {
        describe('isApproved', () => {
            test('Admin: can create, read and update field "isApproved"', async () => {
                const [createdO10n] = await createTestOrganization(admin, { isApproved: false })
                expect(createdO10n.isApproved).toBeFalsy()

                const o10n = await Organization.getOne(admin, { id: createdO10n.id })
                expect(o10n.isApproved).toBeFalsy()

                const [updatedO18n] = await updateTestOrganization(admin, createdO10n.id, { isApproved: true })
                expect(updatedO18n.isApproved).toBeTruthy()
            })

            test('Support: can read and update field "isApproved"', async () => {
                const [createdO10n] = await createTestOrganization(admin, { isApproved: false })
                expect(createdO10n.isApproved).toBeFalsy()

                const o10n = await Organization.getOne(support, { id: createdO10n.id })
                expect(o10n.isApproved).toBeFalsy()

                const [updatedO18n] = await updateTestOrganization(support, createdO10n.id, { isApproved: true })
                expect(updatedO18n.isApproved).toBeTruthy()
            })

            test('Employee: can read and cannot update field "isApproved" for their organization', async () => {
                const userClient = await makeEmployeeUserClientWithAbilities({
                    canManageOrganization: true,
                })

                const { organization } = userClient

                const o10n = await Organization.getOne(userClient, { id: organization.id })
                expect(o10n.isApproved).toBeTruthy()

                const [updatedO18n, attrs] = await updateTestOrganization(support, organization.id, { name: faker.company.name() })
                expect(updatedO18n.name).toEqual(attrs.name)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await Organization.update(userClient, organization.id, {
                        dv: 1,
                        sender: { dv: 1, fingerprint: faker.datatype.uuid() },
                        isApproved: false,
                    })
                })

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await Organization.update(userClient, organization.id, {
                        dv: 1,
                        sender: { dv: 1, fingerprint: faker.datatype.uuid() },
                        isApproved: false,
                        name: faker.company.name(),
                    })
                })
            })
        })
    })
    describe('Validations', () => {
        describe('phone', () => {
            it('throw error when phone has invalid format', async () => {
                const admin = await makeLoggedInAdminClient()

                await expectToThrowGQLError(
                    async () => await createTestOrganization(admin, { phone: '42' }),
                    { ...COMMON_ERRORS.WRONG_PHONE_FORMAT, variable: ['data', 'phone'] }
                )
            })
        })
    })
})