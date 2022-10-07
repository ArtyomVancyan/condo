/**
 * Generated by `createschema ticket.TicketClassifier 'organization?:Relationship:Organization:CASCADE;place?:Relationship:TicketPlaceClassifier:PROTECT;category?:Relationship:TicketCategoryClassifier:PROTECT;problem?:Relationship:TicketProblemClassifier:PROTECT;'`
 */

const { Relationship } = require('@keystonejs/fields')
const { GQLListSchema } = require('@condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@condo/keystone/plugins')
const { COMMON_AND_ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const access = require('@condo/domains/ticket/access/TicketClassifier')

const TicketClassifier = new GQLListSchema('TicketClassifier', {
    schemaDoc: 'Rules for all possible valid combinations of classifiers',
    fields: {
        organization: COMMON_AND_ORGANIZATION_OWNED_FIELD,
        place: {
            schemaDoc: 'Location of incident',
            type: Relationship,
            ref: 'TicketPlaceClassifier',
            kmigratorOptions: { null: true, on_delete: 'models.PROTECT' },
        },
        category: {
            schemaDoc: 'Type of work to fix incident',
            type: Relationship,
            ref: 'TicketCategoryClassifier',
            kmigratorOptions: { null: true, on_delete: 'models.PROTECT' },
        },
        problem: {
            schemaDoc: 'What needs to be done',
            type: Relationship,
            ref: 'TicketProblemClassifier',
            kmigratorOptions: { null: true, on_delete: 'models.PROTECT' },
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadTicketClassifiers,
        create: access.canManageTicketClassifiers,
        update: access.canManageTicketClassifiers,
        delete: false,
        auth: true,
    },
})

module.exports = {
    TicketClassifier,
}
