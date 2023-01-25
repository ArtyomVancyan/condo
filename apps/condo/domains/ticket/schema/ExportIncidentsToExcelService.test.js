/**
 * Generated by `createservice ticket.ExportIncidentsToExcelService`
 */

const { makeLoggedInAdminClient, makeClient } = require('@open-condo/keystone/test.utils')
const { expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObjects } = require('@open-condo/keystone/test.utils')

const { exportIncidentsToExcelByTestClient } = require('@condo/domains/ticket/utils/testSchema')

// todo(doma-2567) add tests
describe('ExportIncidentsToExcelService', () => {
    test('user: execute', async () => {
        const client = await makeClient()  // TODO(codegen): use truly useful client!
        const payload = {}  // TODO(codegen): change the 'user: update ExportIncidentsToExcelService' payload
        const [data, attrs] = await exportIncidentsToExcelByTestClient(client, payload)
        // TODO(codegen): write user expect logic
        throw new Error('Not implemented yet')
    })
 
    test('anonymous: execute', async () => {
        const client = await makeClient()
        await expectToThrowAuthenticationErrorToObjects(async () => {
            await exportIncidentsToExcelByTestClient(client)
        })
    })
 
    test('admin: execute', async () => {
        const admin = await makeLoggedInAdminClient()
        const payload = {}  // TODO(codegen): change the 'user: update ExportIncidentsToExcelService' payload
        const [data, attrs] = await exportIncidentsToExcelByTestClient(admin, payload)
        // TODO(codegen): write admin expect logic
        throw new Error('Not implemented yet')
    })
})