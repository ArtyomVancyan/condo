/**
 * Generated by `createschema address.AddressInjection 'country:Text; region?:Text; area?:Text; city?:Text; settlement?:Text; street?:Text; building:Text; block?:Text; meta?:Json;'`
 */

const { Text } = require('@keystonejs/fields')
const { GQLListSchema } = require('@open-condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const access = require('@address-service/domains/address/access/AddressInjection')
const get = require('lodash/get')
const { Json, AddressPartWithType } = require('@open-condo/keystone/fields')

const AddressInjection = new GQLListSchema('AddressInjection', {
    schemaDoc: 'Addresses that do not exist in external providers',
    fields: {
        country: {
            schemaDoc: 'The country',
            type: Text,
            isRequired: true,
        },

        region: {
            schemaDoc: 'The region',
            type: AddressPartWithType,
        },

        area: {
            schemaDoc: 'Some area',
            type: AddressPartWithType,
        },

        city: {
            schemaDoc: 'The city name',
            type: AddressPartWithType,
        },

        cityDistrict: {
            schemaDoc: 'The district within the city name',
            type: AddressPartWithType,
        },

        settlement: {
            schemaDoc: 'The settlement name',
            type: AddressPartWithType,
        },

        street: {
            schemaDoc: 'The street name itself',
            type: AddressPartWithType,
        },

        house: {
            schemaDoc: 'The number of the building',
            type: AddressPartWithType,
            isRequired: true,
        },

        block: {
            schemaDoc: 'Some part of the building',
            type: AddressPartWithType,
        },

        keywords: {
            schemaDoc: 'The autogenerated keywords for searching',
            type: Text,
            access: ({ operation }) => operation === 'read',
            adminConfig: {
                isReadOnly: true,
            },
        },

        meta: {
            schemaDoc: 'Additional data',
            type: Json,
        },

    },
    hooks: {
        resolveInput: async ({ resolvedData, existingItem }) => {
            return {
                // Actualize keywords on every data changing
                ...resolvedData,
                keywords: ['country', 'region.name', 'area.name', 'city.name', 'cityDistrict.name', 'settlement.name', 'street.name', 'house.name', 'block.name']
                    .map((field) => get({ ...existingItem, ...resolvedData }, field))
                    .filter(Boolean)
                    .join(' '),
            }
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadAddressInjections,
        create: access.canManageAddressInjections,
        update: access.canManageAddressInjections,
        delete: false,
        auth: true,
    },
})

module.exports = {
    AddressInjection,
}
