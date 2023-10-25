/**
 * Generated by `createschema marketplace.MarketItemPrice 'price:Json; marketItem:Relationship:MarketItem:CASCADE; organization:Relationship:Organization:CASCADE;'`
 */

const { faker } = require('@faker-js/faker')
const Ajv = require('ajv')

const { makeLoggedInAdminClient, makeClient, UUID_RE, expectValuesOfCommonFields, expectToThrowGQLError } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
} = require('@open-condo/keystone/test.utils')

const { PRICE_FIELD_SCHEMA } = require('@condo/domains/marketplace/schema/fields/price')
const { MarketItemPrice, createTestMarketItemPrice, updateTestMarketItemPrice, createTestMarketItem } = require('@condo/domains/marketplace/utils/testSchema')
const { createTestMarketCategory } = require('@condo/domains/marketplace/utils/testSchema')
const { createTestOrganization, createTestOrganizationEmployeeRole, createTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { createTestResident, createTestServiceConsumer } = require('@condo/domains/resident/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')
const { makeClientWithResidentUser } = require('@condo/domains/user/utils/testSchema')

const ajv = new Ajv()
const validatePriceField = ajv.compile(PRICE_FIELD_SCHEMA)
const validPriceFieldValue = [{ type: 'variant', group: 'group', name: 'name', price: '300', isMin: false, vatPercent: '20', salesTaxPercent: '0' }]

describe('MarketItemPrice', () => {
    let admin, organization, marketCategory
    beforeAll(async () => {
        admin = await makeLoggedInAdminClient();
        [organization] = await createTestOrganization(admin);
        [marketCategory] = await createTestMarketCategory(admin)
    })

    describe('Accesses', () => {
        describe('admin', () => {
            let marketItem
            beforeAll( async () => {
                [marketItem] = await createTestMarketItem(admin, marketCategory, organization)
            })
            test('can create', async () => {
                const [obj, attrs] = await createTestMarketItemPrice(admin, marketItem)
                expectValuesOfCommonFields(obj, attrs, admin)
            })

            test('can update', async () => {
                const [objCreated] = await createTestMarketItemPrice(admin, marketItem)
                const [obj, attrs] = await  updateTestMarketItemPrice(admin, objCreated.id)
                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            })

            test('cant delete', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await MarketItemPrice.delete(admin, 'id')
                })
            })
            test('can read', async () => {
                const [obj] = await createTestMarketItemPrice(admin, marketItem)

                const objs = await MarketItemPrice.getAll(admin, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                    }),
                ]))
            })
        })

        describe('support', () => {
            let client, marketItem
            beforeAll(async () => {
                client = await makeClientWithSupportUser();
                [marketItem] = await createTestMarketItem(admin, marketCategory, organization)
            })
            test('can create', async () => {
                const [obj, attrs] = await createTestMarketItemPrice(client, marketItem)
                expectValuesOfCommonFields(obj, attrs, client)
            })

            test('can update', async () => {
                const [objCreated] = await createTestMarketItemPrice(client, marketItem)
                const [obj, attrs] = await  updateTestMarketItemPrice(client, objCreated.id)
                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
            })

            test('cant delete', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await MarketItemPrice.delete(client, 'id')
                })
            })
            test('can read', async () => {
                const [obj] = await createTestMarketItemPrice(client, marketItem)

                const objs = await MarketItemPrice.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                    }),
                ]))
            })
        })

        describe('employee with access', () => {
            let organization, client, marketItem
            beforeAll(async () => {
                [organization] = await createTestOrganization(admin)
                client = await makeClientWithNewRegisteredAndLoggedInUser()
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canReadMarketItems: true,
                    canReadMarketItemPrices: true,
                    canManageMarketItemPrices: true,
                })
                await createTestOrganizationEmployee(admin, organization, client.user, role);
                [marketItem] = await createTestMarketItem(admin, marketCategory, organization)
            })

            test('can create', async () => {
                const [obj, attrs] = await createTestMarketItemPrice(client, marketItem)
                expectValuesOfCommonFields(obj, attrs, client)
            })

            test('can update', async () => {
                const [objCreated] = await createTestMarketItemPrice(client, marketItem)
                const [obj, attrs] = await updateTestMarketItemPrice(client, objCreated.id)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
            })

            test('can\'t delete', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await MarketItemPrice.delete(client, 'id')
                })
            })

            test('can read', async () => {
                const [obj] = await createTestMarketItemPrice(client, marketItem)

                const objs = await MarketItemPrice.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                    }),
                ]))
            })
        })

        describe('employee without access', () => {
            let organization, client, marketItem
            beforeAll(async () => {
                [organization] = await createTestOrganization(admin)
                client = await makeClientWithNewRegisteredAndLoggedInUser()
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canReadMarketItems: false,
                    canReadMarketItemPrices: false,
                    canManageMarketItemPrices: false,
                })
                await createTestOrganizationEmployee(admin, organization, client.user, role);
                [marketItem] = await createTestMarketItem(admin, marketCategory, organization)
            })

            test('can\'t create', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestMarketItemPrice(client, marketItem)
                })
            })

            test('can\'t update', async () => {
                const [objCreated] = await createTestMarketItemPrice(admin, marketItem)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestMarketItemPrice(client, objCreated.id)
                })
            })

            test('can\'t delete', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await MarketItemPrice.delete(client, 'id')
                })
            })

            test('can\'t read', async () => {
                await createTestMarketItemPrice(admin, marketItem)
                const objs = await MarketItemPrice.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
                expect(objs).toHaveLength(0)
            })
        })

        describe('anonymus', () => {
            let client
            beforeAll(async () => {
                client = await makeClient()
            })

            test('can\'t create', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestMarketItemPrice(client, { id: 'id' })
                })
            })

            test('can\'t update', async () => {

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestMarketItemPrice(client, 'id')
                })
            })

            test('can\'t delete', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await MarketItemPrice.delete(client, 'id')
                })
            })

            test('can\'t read', async () => {
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await MarketItemPrice.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
                })
            })
        })

        describe('resident', () => {
            let organization, client, marketItem
            beforeAll(async () => {
                [organization] = await createTestOrganization(admin)
                client = await makeClientWithResidentUser()
                const unitName = faker.random.alphaNumeric(8)
                const accountNumber = faker.random.alphaNumeric(8)

                const [property] = await createTestProperty(admin, organization)
                const [resident] = await createTestResident(admin, client.user, property, {
                    unitName,
                })
                await createTestServiceConsumer(admin, resident, organization, {
                    accountNumber,
                });
                [marketItem] = await createTestMarketItem(admin, marketCategory, organization)
            })

            test('can\'t create', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestMarketItemPrice(client, marketItem)
                })
            })

            test('can\'t update', async () => {
                const [objCreated] = await createTestMarketItemPrice(admin, marketItem)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestMarketItemPrice(client, objCreated.id)
                })
            })

            test('can\'t delete', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await MarketItemPrice.delete(client, 'id')
                })
            })

            test('can read MarketItemPrice of his organization', async () => {
                const [obj] = await createTestMarketItemPrice(admin, marketItem)

                const objs = await MarketItemPrice.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                    }),
                ]))
            })
            // TODO (DOMA-7503) test('Resident can read items according to PriceScope settings')
        })

    })

    describe('Hooks validation tests', () => {
        let marketItem
        beforeAll(async () => {
            [marketItem] = await createTestMarketItem(admin, marketCategory, organization)
        })
        test('Validate item price', async () => {
            await expectToThrowGQLError(
                async () => {
                    await createTestMarketItemPrice(admin, marketItem, {
                        price: [{ ...validPriceFieldValue[0], price: '-1' }],
                    })
                },
                {
                    code: 'BAD_USER_INPUT',
                    type: 'INVALID_PRICE',
                    message: 'Invalid price on line 1. Must be greater or equal to 0.',
                },
                'obj'
            )
        })

        test('Validate salesTaxPercent less when 0', async () => {
            await expectToThrowGQLError(
                async () => {
                    await createTestMarketItemPrice(admin, marketItem, {
                        price: [{ ...validPriceFieldValue[0], salesTaxPercent: '-1' }],
                    })
                },
                {
                    code: 'BAD_USER_INPUT',
                    type: 'INVALID_SALES_TAX_PERCENT',
                    message: 'Invalid sales tax percent on line 1. Must be greater or equal to 0 and less or equal to 100.',
                },
                'obj'
            )
        })

        test('Validate salesTaxPercent greater when 100', async () => {
            await expectToThrowGQLError(
                async () => {
                    await createTestMarketItemPrice(admin, marketItem, {
                        price: [{ ...validPriceFieldValue[0], salesTaxPercent: '101' }],
                    })
                },
                {
                    code: 'BAD_USER_INPUT',
                    type: 'INVALID_SALES_TAX_PERCENT',
                    message: 'Invalid sales tax percent on line 1. Must be greater or equal to 0 and less or equal to 100.',
                },
                'obj'
            )
        })

        test('Validate price field is empty', async () => {
            await expectToThrowGQLError(
                async () => {
                    await createTestMarketItemPrice(admin, marketItem, {
                        price: [],
                    })
                },
                {
                    code: 'BAD_USER_INPUT',
                    type: 'EMPTY_PRICE',
                    message: 'Price cannot be empty.',
                },
                'obj'
            )
        })
    })

    describe('Price field validation tests', () => {
        test('positive validation test', async () => {
            expect(validatePriceField(validPriceFieldValue)).toEqual(true)
        })

        describe('Negative tests', () => {
            const cases = [
                [{ ...validPriceFieldValue, type: 'invalid' }],
                [{ ...validPriceFieldValue, group: [] }],
                [{ ...validPriceFieldValue, name: [] }],
                [{ ...validPriceFieldValue, price: 'invalid' }],
                [{ ...validPriceFieldValue, isMin: 'invalid' }],
                [{ ...validPriceFieldValue, vatPercent: '100' }],
                [{ ...validPriceFieldValue, salesTaxPercent: 'invalid' }],
            ]
            test.each(cases)('%j', (data) => {
                expect(validatePriceField(data)).toEqual(false)
            })
        })
    })
})

