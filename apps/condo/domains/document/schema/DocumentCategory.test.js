/**
 * Generated by `createschema document.DocumentCategory 'name:Text; order:Integer;'`
 */

const { faker } = require('@faker-js/faker')

const { makeLoggedInAdminClient, makeClient, UUID_RE, expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects, expectToThrowAccessDeniedErrorToObj } = require('@open-condo/keystone/test.utils')

const { DocumentCategory, createTestDocumentCategory, updateTestDocumentCategory, softDeleteTestDocumentCategory } = require('@condo/domains/document/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')


describe('DocumentCategory', () => {
    let admin, support, anonymous, userClient, documentFileCategory

    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        support = await makeClientWithSupportUser()
        anonymous = await makeClient()
        userClient = await makeClientWithNewRegisteredAndLoggedInUser()

        const [testDocumentCategory] = await createTestDocumentCategory(admin)
        documentFileCategory = testDocumentCategory
    })

    describe('Access', () => {
        describe('Create', () => {
            it('admin can', async () => {
                const [testDocumentCategory] = await createTestDocumentCategory(admin)

                expect(testDocumentCategory).toBeDefined()
                expect(testDocumentCategory.id).toMatch(UUID_RE)
            })

            it('support can not', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestDocumentCategory(support)
                })
            })

            it('anonymous can not', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestDocumentCategory(anonymous)
                })
            })

            it('user can not', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestDocumentCategory(userClient)
                })
            })
        })

        describe('Read', () => {
            it('admin can', async () => {
                const readDocumentCategory = await DocumentCategory.getOne(admin, { id: documentFileCategory.id })

                expect(readDocumentCategory).toBeDefined()
                expect(readDocumentCategory.id).toEqual(documentFileCategory.id)
            })

            it('support can', async () => {
                const readDocumentCategory = await DocumentCategory.getOne(support, { id: documentFileCategory.id })

                expect(readDocumentCategory).toBeDefined()
                expect(readDocumentCategory.id).toEqual(documentFileCategory.id)
            })

            it('anonymous can not', async () => {
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await DocumentCategory.getOne(anonymous, { id: documentFileCategory.id })
                })
            })

            it('user can', async () => {
                const readDocumentCategory = await DocumentCategory.getOne(userClient, { id: documentFileCategory.id })

                expect(readDocumentCategory).toBeDefined()
                expect(readDocumentCategory.id).toEqual(documentFileCategory.id)
            })
        })

        describe('Update', () => {
            it('admin can', async () => {
                const [testDocumentCategory] = await createTestDocumentCategory(admin)
                const newName = faker.random.alphaNumeric(8)

                const [updatedDocumentCategory] = await updateTestDocumentCategory(admin, testDocumentCategory.id, {
                    name: newName,
                })

                expect(updatedDocumentCategory.id).toEqual(testDocumentCategory.id)
                expect(updatedDocumentCategory.name).toEqual(newName)
            })

            it('support can not', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestDocumentCategory(support, documentFileCategory.id, {})
                })
            })

            it('anonymous can not', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestDocumentCategory(anonymous, documentFileCategory.id, {})
                })
            })

            it('user can not', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestDocumentCategory(userClient, documentFileCategory.id, {})
                })
            })
        })

        describe('Soft delete', () => {
            it('admin can', async () => {
                const [testDocumentCategory] = await createTestDocumentCategory(admin)
                const [deletedDocumentCategory] = await softDeleteTestDocumentCategory(admin, testDocumentCategory.id)

                expect(deletedDocumentCategory.id).toEqual(testDocumentCategory.id)
                expect(deletedDocumentCategory.deletedAt).toBeDefined()
            })

            it('support can not', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await softDeleteTestDocumentCategory(support, documentFileCategory.id)
                })
            })

            it('anonymous can not', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await softDeleteTestDocumentCategory(anonymous, documentFileCategory.id)
                })
            })

            it('user can not', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await softDeleteTestDocumentCategory(userClient, documentFileCategory.id)
                })
            })
        })
    })
})
