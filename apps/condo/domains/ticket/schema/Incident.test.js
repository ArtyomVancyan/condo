/**
 * Generated by `createschema ticket.Incident 'organization; number; details:Text; status; textForResident:Text; workStart:DateTimeUtc; workFinish:DateTimeUtc; isScheduled:Checkbox; isEmergency:Checkbox; hasAllProperties:Checkbox;'`
 */

const { makeLoggedInAdminClient, makeClient, catchErrorFrom } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
} = require('@open-condo/keystone/test.utils')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')
const { Incident, createTestIncident, updateTestIncident } = require('@condo/domains/ticket/utils/testSchema')
const faker = require('faker')
const {
    createTestOrganization,
    createTestOrganizationEmployeeRole,
    createTestOrganizationEmployee,
} = require('../../organization/utils/testSchema')
const dayjs = require('dayjs')
const { INCIDENT_ERRORS } = require('../constants/errors')


const INCIDENT_PAYLOAD = {
    details: faker.lorem.sentence(),
    workStart: faker.date.recent().toISOString(),
}

describe('Incident', () => {
    let admin
    let support
    let employeeUser
    let notEmployeeUser
    let anonymous
    let organization
    let incidentByAdmin
    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        support = await makeClientWithSupportUser()
        employeeUser = await makeClientWithNewRegisteredAndLoggedInUser()
        anonymous = await makeClient()

        const [testOrganization] = await createTestOrganization(admin)
        organization = testOrganization

        const [role] = await createTestOrganizationEmployeeRole(admin, organization)

        await createTestOrganizationEmployee(admin, organization, employeeUser.user, role)

        notEmployeeUser = await makeClientWithNewRegisteredAndLoggedInUser()
        const [secondTestOrganization] = await createTestOrganization(admin)
        const [secondRole] = await createTestOrganizationEmployeeRole(admin, secondTestOrganization)
        await createTestOrganizationEmployee(admin, secondTestOrganization, notEmployeeUser.user, secondRole)
    })
    beforeEach(async () => {
        const [testIncident] = await createTestIncident(admin, organization, INCIDENT_PAYLOAD)
        incidentByAdmin = testIncident
    })
    describe('Accesses', () => {
        describe('Admin', () => {
            test('can create', async () => {
                expect(incidentByAdmin).toBeDefined()
                expect(incidentByAdmin).toHaveProperty('organization.id', organization.id)
                expect(incidentByAdmin).toHaveProperty('details', INCIDENT_PAYLOAD.details)
                expect(incidentByAdmin).toHaveProperty('workStart', INCIDENT_PAYLOAD.workStart)
            })
            test('can read', async () => {
                const incident = await Incident.getOne(admin, { id: incidentByAdmin.id }, { sortBy: ['updatedAt_DESC'] })
                expect(incident).toBeDefined()
                expect(incident).toHaveProperty('id', incidentByAdmin.id)
            })
            test('can update', async () => {
                const [incident, attrs] = await updateTestIncident(admin, incidentByAdmin.id, { details: faker.lorem.sentence() })
                expect(incident).toBeDefined()
                expect(incident).toHaveProperty('details', attrs.details)
            })
            test('can\'t delete', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await Incident.delete(admin, incidentByAdmin.id)
                })
            })
        })

        describe('Support', () => {
            test('can create', async () => {
                const [incident] = await createTestIncident(support, organization, INCIDENT_PAYLOAD)
                expect(incident).toBeDefined()
                expect(incident).toHaveProperty('organization.id', organization.id)
                expect(incident).toHaveProperty('details', INCIDENT_PAYLOAD.details)
                expect(incident).toHaveProperty('workStart', INCIDENT_PAYLOAD.workStart)
            })
            test('can read', async () => {
                const incident = await Incident.getOne(support, { id: incidentByAdmin.id }, { sortBy: ['updatedAt_DESC'] })
                expect(incident).toBeDefined()
                expect(incident).toHaveProperty('id', incidentByAdmin.id)
            })
            test('can update', async () => {
                const [incident, attrs] = await updateTestIncident(support, incidentByAdmin.id, { details: faker.lorem.sentence() })
                expect(incident).toBeDefined()
                expect(incident).toHaveProperty('details', attrs.details)
            })
            test('can\'t delete', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await Incident.delete(support, incidentByAdmin.id)
                })
            })
        })

        describe('Employee', () => {
            test('can create', async () => {
                const [incident] = await createTestIncident(employeeUser, organization, INCIDENT_PAYLOAD)
                expect(incident).toBeDefined()
                expect(incident).toHaveProperty('organization.id', organization.id)
                expect(incident).toHaveProperty('details', INCIDENT_PAYLOAD.details)
                expect(incident).toHaveProperty('workStart', INCIDENT_PAYLOAD.workStart)
                expect(incident).toHaveProperty('workFinish', null)
                expect(incident).toHaveProperty('isScheduled', false)
                expect(incident).toHaveProperty('isEmergency', false)
                expect(incident).toHaveProperty('hasAllProperties', false)
                expect(incident).toHaveProperty('number')
                expect(incident.number).not.toBeNull()
            })
            test('can read', async () => {
                const incident = await Incident.getOne(employeeUser, { id: incidentByAdmin.id }, { sortBy: ['updatedAt_DESC'] })
                expect(incident).toBeDefined()
                expect(incident).toHaveProperty('id', incidentByAdmin.id)
            })
            test('can update', async () => {
                const [incident, attrs] = await updateTestIncident(employeeUser, incidentByAdmin.id, { details: faker.lorem.sentence() })
                expect(incident).toBeDefined()
                expect(incident).toHaveProperty('details', attrs.details)
            })
            test('can\'t delete', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await Incident.delete(employeeUser, incidentByAdmin.id)
                })
            })
        })

        describe('Not employee', () => {
            test('can\'t create', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestIncident(notEmployeeUser, organization, INCIDENT_PAYLOAD)
                })
            })
            test('can\'t read', async () => {
                const incidents = await Incident.getAll(notEmployeeUser, { id: incidentByAdmin.id }, { sortBy: ['updatedAt_DESC'], first: 10 })
                expect(incidents).toHaveLength(0)
            })
            test('can\'t update', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestIncident(notEmployeeUser, incidentByAdmin.id, INCIDENT_PAYLOAD)
                })
            })
            test('can\'t delete', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await Incident.delete(notEmployeeUser, incidentByAdmin.id)
                })
            })
        })

        describe('Anonymous', () => {
            test('can\'t create', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestIncident(anonymous, organization, INCIDENT_PAYLOAD)
                })
            })
            test('can\'t read', async () => {
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await Incident.getOne(anonymous, { id: incidentByAdmin.id }, { sortBy: ['updatedAt_DESC'] })
                })
            })
            test('can\'t update', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestIncident(anonymous, incidentByAdmin.id, INCIDENT_PAYLOAD)
                })
            })
            test('can\'t delete', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await Incident.delete(anonymous, incidentByAdmin.id)
                })
            })
        })
    })

    describe('Validations', () => {
        describe('fields', () => {
            test('workFinish should be late then workStart', async () => {
                const [incident, attrs] = await updateTestIncident(admin, incidentByAdmin.id, {
                    workFinish: dayjs().add(1, 'day').toISOString(),
                })
                expect(incident).toBeDefined()
                expect(incident).toHaveProperty('workFinish', attrs.workFinish)
            })
            test('workFinish should not  be early then workStart', async () => {
                await catchErrorFrom(async () => {
                    await updateTestIncident(admin, incidentByAdmin.id, {
                        workFinish: dayjs(incidentByAdmin.workStart).subtract(1, 'day').toISOString(),
                    })
                }, ({ errors }) => {
                    expect(errors).toHaveLength(1)
                    expect(errors[0]).toEqual(expect.objectContaining({
                        message: INCIDENT_ERRORS.WORK_FINISH_EARLY_THAN_WORK_START.message,
                    }))
                })
            })
        })
    })
})
