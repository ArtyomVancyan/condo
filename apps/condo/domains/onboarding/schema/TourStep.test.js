/**
 * Generated by `createschema onboarding.TourStep 'organization:Relationship:Organization:CASCADE;type:Select:ticket,property;status:Select:todo,waiting,disabled,completed;order:Integer;'`
 */

const { makeLoggedInAdminClient, makeClient, setFeatureFlag, expectToThrowGQLError, catchErrorFrom, expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects } = require('@open-condo/keystone/test.utils')
const { expectToThrowAccessDeniedErrorToObj } = require('@open-condo/keystone/test.utils')

const { ORGANIZATION_TOUR } = require('@condo/domains/common/constants/featureflags')
const { ERRORS } = require('@condo/domains/onboarding/constants/errors')
const { STEP_TYPES, COMPLETED_STEP_STATUS, CREATE_PROPERTY_STEP_TYPE, TODO_STEP_STATUS, DISABLED_STEP_STATUS, CREATE_PROPERTY_MAP_STEP_TYPE } = require('@condo/domains/onboarding/constants/steps')
const { TourStep, createTestTourStep, updateTestTourStep } = require('@condo/domains/onboarding/utils/testSchema')
const { registerNewOrganization, createTestOrganizationEmployeeRole, createTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')


describe('TourStep', () => {
    let admin, organization, employeeWithPermissions, employeeWithoutPermissions, anonymous, support

    beforeAll(async () => {
        setFeatureFlag(ORGANIZATION_TOUR, true)

        admin = await makeLoggedInAdminClient()
        support = await makeClientWithSupportUser()
        anonymous = await makeClient()
        const [newOrganization] = await registerNewOrganization(admin)
        organization = newOrganization

        const [roleWithPermissions] = await createTestOrganizationEmployeeRole(admin, organization, {
            canReadTour: true,
            canManageTour: true,
        })
        const [roleWithoutPermissions] = await createTestOrganizationEmployeeRole(admin, organization, {
            canReadTour: false,
            canManageTour: false,
        })

        employeeWithPermissions = await makeClientWithNewRegisteredAndLoggedInUser()
        employeeWithoutPermissions = await makeClientWithNewRegisteredAndLoggedInUser()

        await createTestOrganizationEmployee(admin, organization, employeeWithPermissions.user, roleWithPermissions)
        await createTestOrganizationEmployee(admin, organization, employeeWithoutPermissions.user, roleWithoutPermissions)
    })

    afterAll(() => {
        setFeatureFlag(ORGANIZATION_TOUR, false)
    })

    describe('Access', () => {
        describe('Employee', () => {
            it('With canManageTour: can not create TourStep', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestTourStep(employeeWithPermissions, organization, {})
                })
            })

            it('Without canManageTour: can not create TourStep', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestTourStep(employeeWithoutPermissions, organization, {})
                })
            })

            it('With canManageTour: can update TourStep', async () => {
                const [organization] = await registerNewOrganization(admin)
                const [roleWithPermissions] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canReadTour: true,
                    canManageTour: true,
                })
                await createTestOrganizationEmployee(admin, organization, employeeWithPermissions.user, roleWithPermissions)

                const [step] = await TourStep.getAll(employeeWithPermissions, {
                    organization: { id: organization.id },
                    status: TODO_STEP_STATUS,
                })
                const [updatedStep] = await updateTestTourStep(employeeWithPermissions, step.id, { status: COMPLETED_STEP_STATUS })

                expect(updatedStep.status).toEqual(COMPLETED_STEP_STATUS)
            })

            it('Without canManageTour: can not update TourStep', async () => {
                const [step] = await TourStep.getAll(employeeWithPermissions, {
                    organization: { id: organization.id },
                    status: TODO_STEP_STATUS,
                })

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestTourStep(employeeWithoutPermissions, step.id, { status: COMPLETED_STEP_STATUS })
                })
            })

            it('With canReadTour: can read TourStep', async () => {
                const steps = await TourStep.getAll(employeeWithPermissions, { organization: { id: organization.id } })

                expect(steps).toHaveLength(STEP_TYPES.length)
            })

            it('Without canReadTour: can not read TourStep', async () => {
                const steps = await TourStep.getAll(employeeWithoutPermissions, { organization: { id: organization.id } })

                expect(steps).toHaveLength(0)
            })

            it('With canManageTour: can not soft delete TourStep', async () => {
                const [step] = await TourStep.getAll(employeeWithPermissions, {
                    organization: { id: organization.id },
                    status: TODO_STEP_STATUS,
                })

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestTourStep(employeeWithPermissions, step.id, { deletedAt: 'true' })
                })
            })

            it('Without canManageTour: can not soft delete TourStep', async () => {
                const [step] = await TourStep.getAll(employeeWithPermissions, {
                    organization: { id: organization.id },
                    status: TODO_STEP_STATUS,
                })

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestTourStep(employeeWithoutPermissions, step.id, { deletedAt: 'true' })
                })
            })
        })

        describe('Admin', () => {
            it('can not create TourStep', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestTourStep(admin, organization, {})
                })
            })

            it('can update TourStep', async () => {
                const [organization] = await registerNewOrganization(admin)
                const [step] = await TourStep.getAll(admin, {
                    organization: { id: organization.id },
                    status: TODO_STEP_STATUS,
                })
                const [updatedStep] = await updateTestTourStep(admin, step.id, { status: COMPLETED_STEP_STATUS })

                expect(updatedStep.status).toEqual(COMPLETED_STEP_STATUS)
            })

            it('can not soft delete TourStep', async () => {
                const [step] = await TourStep.getAll(admin, {
                    organization: { id: organization.id },
                    status: TODO_STEP_STATUS,
                })

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestTourStep(admin, step.id, { deletedAt: 'now' })
                })
            })

            it('can read TourStep', async () => {
                const [step] = await TourStep.getAll(admin, {
                    organization: { id: organization.id },
                    status: TODO_STEP_STATUS,
                })

                expect(step).toBeDefined()
            })
        })

        describe('Support', () => {
            it('can not create TourStep', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestTourStep(support, organization, {})
                })
            })

            it('can not update TourStep', async () => {
                const [step] = await TourStep.getAll(support, {
                    organization: { id: organization.id },
                    status: TODO_STEP_STATUS,
                })

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestTourStep(support, step.id, { status: COMPLETED_STEP_STATUS })
                })
            })

            it('can not soft delete TourStep', async () => {
                const [step] = await TourStep.getAll(support, {
                    organization: { id: organization.id },
                    status: TODO_STEP_STATUS,
                })

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestTourStep(support, step.id, { deletedAt: 'now' })
                })
            })

            it('can read TourStep', async () => {
                const [step] = await TourStep.getAll(admin, {
                    organization: { id: organization.id },
                    status: TODO_STEP_STATUS,
                })

                expect(step).toBeDefined()
            })
        })

        describe('Anonymous', () => {
            it('can not create TourStep', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestTourStep(anonymous, organization, {})
                })
            })

            it('can not update TourStep', async () => {
                const [step] = await TourStep.getAll(employeeWithPermissions, {
                    organization: { id: organization.id },
                    status: TODO_STEP_STATUS,
                })

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestTourStep(anonymous, step.id, { status: COMPLETED_STEP_STATUS })
                })
            })

            it('can not soft delete TourStep', async () => {
                const [step] = await TourStep.getAll(employeeWithPermissions, {
                    organization: { id: organization.id },
                    status: TODO_STEP_STATUS,
                })

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestTourStep(anonymous, step.id, { deletedAt: 'now' })
                })
            })

            it('can not read TourStep', async () => {
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await TourStep.getAll(anonymous, {
                        organization: { id: organization.id },
                        status: TODO_STEP_STATUS,
                    })
                })
            })
        })
    })

    describe('Logic', () => {
        it('Tour steps created after organization registered', async () => {
            const [organization] = await registerNewOrganization(admin)
            const steps = await TourStep.getAll(admin, { organization: { id: organization.id } })

            expect(steps).toHaveLength(STEP_TYPES.length)
        })

        it('Enable step after complete previous step', async () => {
            const [organization] = await registerNewOrganization(admin)
            const createPropertyStep = await TourStep.getOne(admin, {
                type: CREATE_PROPERTY_STEP_TYPE,
                organization: { id: organization.id },
            })

            const createPropertyMapStepBeforeUpdate = await TourStep.getOne(admin, {
                type: CREATE_PROPERTY_MAP_STEP_TYPE,
                organization: { id: organization.id },
            })

            expect(createPropertyMapStepBeforeUpdate.status).toEqual(DISABLED_STEP_STATUS)

            await updateTestTourStep(admin, createPropertyStep.id, {
                status: COMPLETED_STEP_STATUS,
            })

            const createPropertyMapStep = await TourStep.getOne(admin, {
                type: CREATE_PROPERTY_MAP_STEP_TYPE,
                organization: { id: organization.id },
            })

            expect(createPropertyMapStep.status).toEqual(TODO_STEP_STATUS)
        })
    })

    describe('Validation', () => {
        it('can not update TourStep type and order field', async () => {
            const [organization] = await registerNewOrganization(admin)
            const steps = await TourStep.getAll(admin, {
                organization: { id: organization.id },
                status: TODO_STEP_STATUS,
            })

            const otherStep = steps.find(step => step.type !== CREATE_PROPERTY_STEP_TYPE)

            await catchErrorFrom(async () => {
                await updateTestTourStep(admin, otherStep.id, {
                    type: CREATE_PROPERTY_STEP_TYPE,
                })
            }, ({ errors }) => {
                expect(errors[0].message).toContain('Field "type" is not defined by type "TourStepUpdateInput"')
                expect(errors[0].name).toMatch('UserInputError')
            })

            await catchErrorFrom(async () => {
                await updateTestTourStep(admin, otherStep.id, {
                    order: 0,
                })
            }, ({ errors }) => {
                expect(errors[0].message).toContain('Field "order" is not defined by type "TourStepUpdateInput"')
                expect(errors[0].name).toMatch('UserInputError')
            })
        })

        it('can not update status of completed TourStep', async () => {
            const [step] = await TourStep.getAll(admin, {
                organization: { id: organization.id },
                status: TODO_STEP_STATUS,
            })

            const [updatedStep] = await updateTestTourStep(admin, step.id, {
                status: COMPLETED_STEP_STATUS,
            })

            await expectToThrowGQLError(async () => {
                await updateTestTourStep(admin, updatedStep.id, {
                    status: TODO_STEP_STATUS,
                })
            }, ERRORS.UPDATE_COMPLETED_STEP_TYPE)
        })
    })
})
