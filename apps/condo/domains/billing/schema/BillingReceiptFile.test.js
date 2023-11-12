/**
 * Generated by `createschema billing.BillingReceiptFile 'file:File;context:Relationship:BillingIntegrationOrganizationContext:CASCADE;receipt:Relationship:BillingReceipt:CASCADE;controlSum:Text'`
 */

const path = require('path')

const { makeClient, UUID_RE, DATETIME_RE, expectValuesOfCommonFields,
    expectToThrowValidationFailureError,
} = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
} = require('@open-condo/keystone/test.utils')

const { BillingReceiptFile, createTestBillingReceiptFile, updateTestBillingReceiptFile, PUBLIC_FILE, PRIVATE_FILE } = require('@condo/domains/billing/utils/testSchema')
const {
    makeContextWithOrganizationAndIntegrationAsAdmin,
    createTestBillingProperty,
    createTestBillingAccount,
    makeServiceUserForIntegration,
    makeOrganizationIntegrationManager, createTestBillingReceipt,
} = require('@condo/domains/billing/utils/testSchema')
const {
    createTestContact,
} = require('@condo/domains/contact/utils/testSchema')
const {
    createTestOrganizationEmployeeRole,
    createTestOrganizationEmployee,
} = require('@condo/domains/organization/utils/testSchema')
const {
    createTestProperty,
} = require('@condo/domains/property/utils/testSchema')
const {
    registerResidentByTestClient,
    registerServiceConsumerByTestClient,
    ServiceConsumer,
} = require('@condo/domains/resident/utils/testSchema')
const {
    makeClientWithResidentUser,
} = require('@condo/domains/user/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')


async function makeClientWithResidentVerificationAndReceiptFile ({
    admin,
    organization,
    billingContext,
    billingProperty,
    property,
}, isVerified = true) {
    const client = await makeClientWithResidentUser()
    const [billingAccount] = await createTestBillingAccount(admin, billingContext, billingProperty)
    const { unitName, unitType } = billingAccount
    const [resident] = await registerResidentByTestClient(client, {
        address: property.address,
        addressMeta: property.addressMeta,
        unitName, unitType,
    })
    await createTestContact(admin, organization, property, {
        phone: client.userAttrs.phone,
        unitName,
        unitType,
        isVerified,
    })
    const [receipt] =  await createTestBillingReceipt(admin, billingContext, billingProperty, billingAccount)
    const [receiptFile, attrs] = await createTestBillingReceiptFile(admin, receipt, billingContext)
    const [serviceConsumer] = await registerServiceConsumerByTestClient(client, {
        accountNumber: billingAccount.number,
        residentId: resident.id,
        organizationId: organization.id,
    })
    return {
        serviceConsumer,
        residentClient: client,
        file: {
            receiptFile,
            attrs,
        },
    }
}

describe('BillingReceiptFile', () => {
    let admin
    let anonymous
    let user
    let context
    let receiptByAdmin
    let receiptByService
    let property
    let account
    let integrationUser
    let integrationManager
    let anotherContext
    let anotherProperty
    let anotherAccount
    let organization
    let organizationProperty

    const residentWithVerificationClients = {
        verified: null,
        notVerified: null,
    }

    beforeAll(async () => {
        const { admin: adminClient, context: billingContext, integration, organization: adminOrganization } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        admin = adminClient
        context = billingContext
        organization = adminOrganization
        integrationUser = await makeServiceUserForIntegration(integration)
        const [firstProperty] = await createTestBillingProperty(admin, context)
        const [firstAccount] = await createTestBillingAccount(admin, context, firstProperty)
        const [orgProperty] = await createTestProperty(admin, organization, {
            address: firstProperty.address,
        })
        organizationProperty = orgProperty
        property = firstProperty
        account = firstAccount
        const { context: secondContext } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        anotherContext = secondContext
        const [secondProperty] = await createTestBillingProperty(admin, anotherContext)
        const [secondAccount] = await createTestBillingAccount(admin, anotherContext, secondProperty)
        anotherProperty = secondProperty
        anotherAccount = secondAccount
        anonymous = await makeClient()
        user = await makeClientWithNewRegisteredAndLoggedInUser()
        const { managerUserClient } = await makeOrganizationIntegrationManager({ context })
        integrationManager = managerUserClient
        const [receipt] =  await createTestBillingReceipt(admin, context, property, account)
        receiptByAdmin = receipt
        const [receiptCreatedByIntegration] =  await createTestBillingReceipt(integrationUser, context, property, account)
        receiptByService = receiptCreatedByIntegration
    })
    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                const [receiptFile, attrs] = await createTestBillingReceiptFile(admin, receiptByAdmin, context)

                expectValuesOfCommonFields(receiptFile, attrs, admin)
                expect(receiptFile.id).toMatch(UUID_RE)
                expect(receiptFile.dv).toEqual(1)
                expect(receiptFile.sender).toEqual(attrs.sender)
                expect(receiptFile.v).toEqual(1)
                expect(receiptFile.newId).toEqual(null)
                expect(receiptFile.deletedAt).toEqual(null)
                expect(receiptFile.createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
                expect(receiptFile.updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
                expect(receiptFile.createdAt).toMatch(DATETIME_RE)
                expect(receiptFile.updatedAt).toMatch(DATETIME_RE)
            })

            describe('user', () => {
                describe('Integration account', () => {
                    test('Can if linked to permitted integration via context', async () => {
                        const [file] = await createTestBillingReceiptFile(integrationUser, receiptByService, context)

                        expect(file).toBeDefined()
                        expect(file).toHaveProperty(['context', 'id'], context.id)
                        expect(file).toHaveProperty(['receipt', 'id'], receiptByService.id)
                    })
                    test('Cannot otherwise', async () => {
                        await expectToThrowAccessDeniedErrorToObj(async () => {
                            await createTestBillingReceiptFile(integrationUser, receiptByService, anotherContext)
                        })
                    })
                    test('Integration manager cannot', async () => {
                        await expectToThrowAccessDeniedErrorToObj(async () => {
                            await createTestBillingReceiptFile(integrationManager, receiptByService, context)
                        })
                    })
                    test('Other users cannot', async () => {
                        await expectToThrowAccessDeniedErrorToObj(async () => {
                            await createTestBillingReceiptFile(user, receiptByService, anotherContext)
                        })
                    })
                })
            })

            test('anonymous can\'t', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestBillingReceiptFile(anonymous, receiptByAdmin, context)
                })
            })
        })

        describe('update', () => {
            test('admin can', async () => {
                const [file] = await createTestBillingReceiptFile(admin, receiptByAdmin, context)
                const [obj, attrs] = await updateTestBillingReceiptFile(admin, file.id, { controlSum: 'newControlSum' })

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
                expect(obj.controlSum).toEqual('newControlSum')
            })

            describe('user',  () => {
                describe('Integration account', () => {
                    test('Can if linked to permitted integration via context', async () => {
                        const [file] = await createTestBillingReceiptFile(integrationUser, receiptByService, context)
                        const [obj, attrs] = await updateTestBillingReceiptFile(integrationUser, file.id, { controlSum: 'newControlSum' })

                        expect(obj.id).toMatch(UUID_RE)
                        expect(obj.dv).toEqual(1)
                        expect(obj.sender).toEqual(attrs.sender)
                        expect(obj.v).toEqual(2)
                        expect(obj.updatedBy).toEqual(expect.objectContaining({ id: integrationUser.user.id }))
                        expect(obj.controlSum).toEqual('newControlSum')
                    })
                    test('Cannot otherwise', async () => {
                        const [anotherReceipt] = await createTestBillingReceipt(admin, anotherContext, anotherProperty, anotherAccount)
                        const [file] = await createTestBillingReceiptFile(admin, anotherReceipt, anotherContext)

                        await expectToThrowAccessDeniedErrorToObj(async () => {
                            await updateTestBillingReceiptFile(integrationUser, file.id)
                        })
                    })
                    test('Integration manager cannot', async () => {
                        const [file] = await createTestBillingReceiptFile(admin, receiptByService, context)
                        await expectToThrowAccessDeniedErrorToObj(async () => {
                            await updateTestBillingReceiptFile(integrationManager, file.id)
                        })
                    })
                    test('Other users cannot', async () => {
                        const [file] = await createTestBillingReceiptFile(admin, receiptByService, context)
                        await expectToThrowAccessDeniedErrorToObj(async () => {
                            await updateTestBillingReceiptFile(user, file.id)
                        })
                    })
                })
            })

            test('anonymous can\'t', async () => {
                const [file] = await createTestBillingReceiptFile(admin, receiptByAdmin, context)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestBillingReceiptFile(anonymous, file.id)
                })
            })
        })

        describe('hard delete', () => {
            let file
            beforeAll(async () => {
                [file] = await createTestBillingReceiptFile(admin, receiptByAdmin, context)
            })
            test('admin can\'t', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BillingReceiptFile.delete(admin, file.id)
                })
            })

            test('user can\'t', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BillingReceiptFile.delete(user, file.id)
                })
            })

            test('anonymous can\'t', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BillingReceiptFile.delete(anonymous, file.id)
                })
            })
        })

        describe('read', () => {
            let file
            let anotherFile
            beforeAll(async () => {
                [file] = await createTestBillingReceiptFile(admin, receiptByAdmin, context)
                const [anotherReceipt] =  await createTestBillingReceipt(admin, anotherContext, anotherProperty, anotherAccount);
                [anotherFile] = await createTestBillingReceiptFile(admin, anotherReceipt, anotherContext)
            })
            test('admin can', async () => {
                const objs = await BillingReceiptFile.getAll(admin, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: file.id,
                        context: file.context,
                        receipt: file.receipt,
                        controlSum: file.controlSum,
                    }),
                ]))
            })

            test('resident access to billing receipt do not depends on serviceConsumer deprecated fields: billingAccount, billingIntegrationContext', async () => {
                const {
                    serviceConsumer,
                    residentClient,
                    file,
                } = await makeClientWithResidentVerificationAndReceiptFile({
                    admin, organization, billingContext: context, billingProperty: property, property: organizationProperty,
                }, false)
                const [residentReceiptFile] = await BillingReceiptFile.getAll(residentClient, { id: file.receiptFile.id })
                expect(residentReceiptFile).toBeDefined()
                expect(residentReceiptFile.file.originalFilename).toEqual(path.basename(PUBLIC_FILE))
                await ServiceConsumer.update(admin, serviceConsumer.id, {
                    dv: 1,
                    sender: { dv: 1, fingerprint: 'admin-test-client' },
                    billingIntegrationContext: { disconnectAll: true },
                    billingAccount: { disconnectAll: true },
                })
                const [receiptFileAfterConsumerUpdate] = await BillingReceiptFile.getAll(residentClient, { id: file.receiptFile.id })
                expect(receiptFileAfterConsumerUpdate).toBeDefined()
                expect(receiptFileAfterConsumerUpdate.file.originalFilename).toEqual(path.basename(PUBLIC_FILE))
            })

            test('service can', async () => {
                const objs = await BillingReceiptFile.getAll(integrationUser, {}, { sortBy: ['updatedAt_DESC'] })
                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: file.id,
                        context: file.context,
                        receipt: file.receipt,
                        controlSum: file.controlSum,
                    }),
                ]))
            })

            test('Employee can, but only for permitted organization', async () => {
                const [role] = await createTestOrganizationEmployeeRole(admin, context.organization)
                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationEmployee(admin, context.organization, client.user, role)
                const receiptFiles = await BillingReceiptFile.getAll(client, {
                    id_in: [file.id, anotherFile.id],
                })

                expect(receiptFiles).toHaveLength(1)
                expect(receiptFiles[0]).toHaveProperty('id', file.id)
                expect(receiptFiles[0].file.originalFilename).toEqual(path.basename(PRIVATE_FILE))

            })

            test('anonymous can\'t', async () => {
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await BillingReceiptFile.getAll(anonymous, {}, { sortBy: ['updatedAt_DESC'] })
                })
            })
        })
    })

    describe('Validation tests', () => {
        let file
        let attrs
        beforeAll(async () => {
            [file, attrs] = await createTestBillingReceiptFile(admin, receiptByAdmin, context)
        })
        test('Should have correct dv field (=== 1)', async () => {
            expect(file.dv).toEqual(1)
        })
        test('Should have correct sender field', async () => {
            expect(file.sender).toEqual(attrs.sender)
        })
        test('Cannot create file with incorrect receipt context', async () => {
            await expectToThrowValidationFailureError(async () => {
                await createTestBillingReceiptFile(admin, receiptByAdmin, anotherContext)
            }, 'Context is not equal to receipt.context')
        })
    })

    describe('Sensitive and Public file access', () => {

        describe('Resident user', () => {
            it('has access for public data receipt if is not verified', async () => {
                const {
                    residentClient,
                    file,
                } = await makeClientWithResidentVerificationAndReceiptFile({
                    admin, organization, billingContext: context, billingProperty: property, property: organizationProperty,
                }, false)
                const [residentReceiptFile] = await BillingReceiptFile.getAll(residentClient, { id: file.receiptFile.id })
                expect(residentReceiptFile).toBeDefined()
                expect(residentReceiptFile.file.originalFilename).toEqual(path.basename(PUBLIC_FILE))
            })
            it('has access for sensitive data receipt if is verified', async () => {
                const {
                    residentClient,
                    file,
                } = await makeClientWithResidentVerificationAndReceiptFile({
                    admin, organization, billingContext: context, billingProperty: property, property: organizationProperty,
                }, true)
                const [residentReceiptFile] = await BillingReceiptFile.getAll(residentClient, { id: file.receiptFile.id })
                expect(residentReceiptFile).toBeDefined()
                expect(residentReceiptFile.file.originalFilename).toEqual(path.basename(PRIVATE_FILE))
            })
        })

    })
})
