/**
 * Generated by `createschema ticket.TicketCommentFile 'organization:Relationship:Organization:CASCADE;file?:File;ticketComment?:Relationship:TicketComment:SET_NULL'`
 */

const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@core/keystone/test.utils')

const { TicketCommentFile, createTestTicketCommentFile, updateTestTicketCommentFile,
    createTestTicket,
    createTestTicketComment, TicketComment,
} = require('@condo/domains/ticket/utils/testSchema')
const { expectToThrowAccessDeniedErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
} = require('@condo/domains/common/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const {
    createTestOrganization,
    createTestOrganizationEmployeeRole,
    createTestOrganizationEmployee,
    createTestOrganizationWithAccessToAnotherOrganization,
    updateTestOrganizationEmployee,
} = require('@condo/domains/organization/utils/testSchema')
const { createTestProperty, makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { RESIDENT_COMMENT_TYPE } = require('../constants')

describe('TicketCommentFile', () => {
    describe('employee', () => {
        describe('create', () => {
            test('can be created by user, who has "canManageTicketComments" ability', async () => {
                const adminClient = await makeLoggedInAdminClient()
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(adminClient)
                const [property] = await createTestProperty(adminClient, organization)
                const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                    canManageTickets: true,
                    canManageTicketComments: true,
                })
                await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)

                const [ticket] = await createTestTicket(userClient, organization, property)
                const [ticketComment] = await createTestTicketComment(userClient, ticket, userClient.user)
                const [ticketCommentFile] = await createTestTicketCommentFile(userClient, organization, ticket, ticketComment)

                expect(ticketCommentFile.id).toMatch(UUID_RE)
            })

            test('cannot be created by user, who does not have "canManageTicketComments" ability', async () => {
                const adminClient = await makeLoggedInAdminClient()
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(adminClient)
                const [property] = await createTestProperty(adminClient, organization)
                const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                    canManageTickets: true,
                    canManageTicketComments: false,
                })
                await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)

                const [ticket] = await createTestTicket(userClient, organization, property)
                const [ticketComment] = await createTestTicketComment(adminClient, ticket, userClient.user)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestTicketCommentFile(userClient, organization, ticket, ticketComment)
                })
            })

            test('can be created by admin', async () => {
                const adminClient = await makeLoggedInAdminClient()
                const [organization] = await createTestOrganization(adminClient)
                const [property] = await createTestProperty(adminClient, organization)
                const [ticket] = await createTestTicket(adminClient, organization, property)

                const [ticketComment] = await createTestTicketComment(adminClient, ticket, adminClient.user)
                const [ticketCommentFile] = await createTestTicketCommentFile(adminClient, organization, ticket, ticketComment)

                expect(ticketCommentFile.id).toMatch(UUID_RE)
            })

            test('cannot be created by anonymous', async () => {
                const anonymous = await makeClient()

                const client = await makeClientWithProperty()
                const [ticket] = await createTestTicket(client, client.organization, client.property)
                const [ticketComment] = await createTestTicketComment(client, ticket, client.user)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestTicketCommentFile(anonymous, client.organization, ticket, ticketComment)
                })
            })

            test('can be created by employee from "from" relation organization', async () => {
                const admin = await makeLoggedInAdminClient()
                const { clientFrom, organizationTo, propertyTo, organizationFrom, employeeFrom } = await createTestOrganizationWithAccessToAnotherOrganization()
                const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom, {
                    canManageTickets: true,
                })
                await updateTestOrganizationEmployee(admin, employeeFrom.id, {
                    role: { connect: { id: role.id } },
                })
                const [ticket] = await createTestTicket(admin, organizationTo, propertyTo)
                const [ticketComment] = await createTestTicketComment(clientFrom, ticket, clientFrom.user)

                const [ticketCommentFile] = await createTestTicketCommentFile(clientFrom, organizationTo, ticket, ticketComment)
                expect(ticketCommentFile.id).toMatch(UUID_RE)
            })

            test('cannot be created by employee from "to" relation organization', async () => {
                const admin = await makeLoggedInAdminClient()
                const { clientTo, organizationFrom, propertyFrom } = await createTestOrganizationWithAccessToAnotherOrganization()
                const [ticket] = await createTestTicket(admin, organizationFrom, propertyFrom)
                const [ticketComment] = await createTestTicketComment(admin, ticket, admin.user)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestTicketCommentFile(clientTo, organizationFrom, ticket, ticketComment)
                })
            })
        })

        describe('read', () => {
            test('can be read by admin', async () => {
                const adminClient = await makeLoggedInAdminClient()

                const userClient1 = await makeClientWithProperty()
                const [ticket1] = await createTestTicket(userClient1, userClient1.organization, userClient1.property)
                const [ticketComment] = await createTestTicketComment(userClient1, ticket1, userClient1.user)
                await createTestTicketCommentFile(userClient1, userClient1.organization, ticket1, ticketComment)

                const objs = await TicketCommentFile.getAll(adminClient, {})
                expect(objs.length).toBeGreaterThan(0)
            })

            test('cannot be read by anonymous', async () => {
                const anonymous = await makeClient()

                const client = await makeClientWithProperty()
                const [ticket] = await createTestTicket(client, client.organization, client.property)
                await createTestTicketComment(client, ticket, client.user)

                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await TicketComment.getAll(anonymous)
                })
            })

            it('can be read by employee from "from" relation organization', async () => {
                const admin = await makeLoggedInAdminClient()
                const { clientFrom, organizationTo, propertyTo } = await createTestOrganizationWithAccessToAnotherOrganization()
                const [ticket] = await createTestTicket(admin, organizationTo, propertyTo)
                await createTestTicketComment(admin, ticket, clientFrom.user)

                const comments = await TicketComment.getAll(clientFrom)
                expect(comments).toHaveLength(1)
            })

            it('cannot be read by employee from "to" relation organization', async () => {
                const admin = await makeLoggedInAdminClient()
                const { clientFrom, clientTo, organizationFrom, propertyFrom } = await createTestOrganizationWithAccessToAnotherOrganization()
                const [ticket] = await createTestTicket(admin, organizationFrom, propertyFrom)
                await createTestTicketComment(admin, ticket, clientFrom.user)

                const comments = await TicketComment.getAll(clientTo)
                expect(comments).toHaveLength(0)
            })
        })

    })

    describe('resident', () => {

    })


})
