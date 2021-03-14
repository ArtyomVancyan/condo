const { Text, Relationship, Integer, DateTimeUtc } = require('@keystonejs/fields')
const { JSON_UNKNOWN_VERSION_ERROR } = require('../../constants/errors')

const access = require('@core/keystone/access')
const { ORGANIZATION_OWNED_FIELD } = require('../_common')
const { GQLListSchema } = require('@core/keystone/schema')
const { Json, AutoIncrementInteger } = require('@core/keystone/fields')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')

const { SENDER_FIELD, DV_FIELD } = require('../_common')
const { hasRequestAndDbFields } = require('../../utils/validation.utils')
const { JSON_EXPECT_OBJECT_ERROR, DV_UNKNOWN_VERSION_ERROR, STATUS_UPDATED_AT_ERROR } = require('../../constants/errors')

const ACCESS_TO_ALL = {
    read: true,
    create: access.userIsAuthenticated,
    update: access.userIsAuthenticated,
    delete: access.userIsAuthenticated,
    auth: true,
}

const Ticket = new GQLListSchema('Ticket', {
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        // TODO(pahaz): no needed to check organization access!
        organization: ORGANIZATION_OWNED_FIELD,

        // statusDeadline
        // statusDeferredDate
        // statusDeferredBy
        statusReopenedCounter: {
            type: Integer,
            isRequired: true,
            defaultValue: 0,
            schemaDoc: 'Counter showing the number of changes `status` to `new_or_reopened`. Is not auto changed',
            access: {
                read: true,
                update: false,
                create: false,
            },
        },
        statusReason: {
            type: Text,
            schemaDoc: 'Text reason for status changes. Sometimes you should describe the reason why you change the `status`',
        },
        status: {
            type: Relationship,
            ref: 'TicketStatus',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
        },

        number: {
            type: AutoIncrementInteger,
            isRequired: false,
            schemaDoc: 'Autogenerated ticket human readable ID',
            kmigratorOptions: { unique: true, null: false },
        },

        client: {
            type: Relationship,
            ref: 'User',
            schemaDoc: 'Inhabitant/customer/person who has a problem or want to improve/order something. Not null if we have a registered client',
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },
        clientName: {
            type: Text,
            schemaDoc: 'Inhabitant/customer/person who has a problem. Sometimes we get a problem from an unregistered client, in such cases we have a null inside the `client` and just have something here. Or sometimes clients want to change it',
        },
        clientEmail: {
            type: Text,
            schemaDoc: 'Inhabitant/customer/person who has a problem. Sometimes we get a problem from an unregistered client, in such cases we have a null inside the `client` and just have something here. Or sometimes clients want to change it',
        },
        clientPhone: {
            type: Text,
            schemaDoc: 'Inhabitant/customer/person who has a problem. Sometimes we get a problem from an unregistered client, in such cases we have a null inside the `client` and just have something here. Or sometimes clients want to change it',
        },
        // clientExtraPhone (номер для связи)

        operator: {
            schemaDoc: 'Staff/person who created the issue (submitter). This may be a call center operator or an employee who speaks to a inhabitant/client and filled out an issue for him',
            type: Relationship,
            ref: 'User',
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },
        // operatorMeta: {
        //     type: Json,
        //     schemaDoc: 'For external analytics about the operator who created the issue. Example: geolocation, contact type, ...',
        // },

        // Integrations!?
        // hookStatus
        // hookResult

        // department?
        // who close
        // who accept

        assignee: {
            schemaDoc: 'Assignee/responsible employee/user who must ensure that the issue is fulfilled',
            type: Relationship,
            ref: 'User',
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },
        executor: {
            schemaDoc: 'Executor employee/user who perform the issue',
            type: Relationship,
            ref: 'User',
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },
        watchers: {
            type: Relationship,
            ref: 'User',
            many: true,
            schemaDoc: 'Staff/person who want to watch ticket changes',
        },

        // classifierMeta
        classifier: {
            type: Relationship,
            ref: 'TicketClassifier',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
        },

        // description / title
        details: {
            type: Text, // MD
            isRequired: true,
            schemaDoc: 'Text description of the issue. Maybe written by a user or an operator',
        },
        related: {
            type: Relationship,
            ref: 'Ticket',
            isRequired: false,
            knexOptions: { isNotNullable: false }, // Relationship only!
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
            schemaDoc: 'Sometimes, it is important for us to show related issues. For example, to show related issues',
        },
        meta: {
            type: Json,
            isRequired: false,
            schemaDoc: 'Extra analytics not related to remote system',
            hooks: {
                validateInput: ({ resolvedData, fieldPath, addFieldValidationError }) => {
                    if (!resolvedData.hasOwnProperty(fieldPath)) return // skip if on value
                    const value = resolvedData[fieldPath]
                    if (value === null) return // null is OK
                    if (typeof value !== 'object') {return addFieldValidationError(`${JSON_EXPECT_OBJECT_ERROR}${fieldPath}] ${fieldPath} field type error. We expect JSON Object`)}
                    const { dv } = value
                    if (dv === 1) {
                        // TODO(pahaz): need to checkIt!
                    } else {
                        return addFieldValidationError(`${JSON_UNKNOWN_VERSION_ERROR}${fieldPath}] Unknown \`dv\` attr inside JSON Object`)
                    }
                },
            },
        },

        // Where?
        // building/community
        // entrance/section
        // floor
        // premise/unit
        // placeDetail (behind the radiator, on the fifth step of the stairs)
        // Intercom code
        property: {
            schemaDoc: 'Property related to the Ticket',
            type: Relationship,
            ref: 'Property',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
        },

        entranceName: { type: Text },
        floorName: { type: Text },
        unitName: { type: Text },

        source: {
            schemaDoc: 'Ticket source channel/system. Examples: call, email, visit, ...',
            type: Relationship,
            ref: 'TicketSource',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
        },
        sourceMeta: {
            type: Json,
            schemaDoc: 'In the case of remote system sync, you can store some extra analytics. Examples: email, name, phone, ...',
        },

        // sourceCreatedAt: {
        //     type: DateTimeUtc,
        //     schemaDoc: 'In the case of remote system sync you can store the remote system created at time',
        // },
        // sourceUpdatedAt: {
        //     type: DateTimeUtc,
        //     schemaDoc: 'In the case of remote system sync you can store the remote system updated at time',
        // },
        // sourceSyncAt: {
        //     type: DateTimeUtc,
        //     schemaDoc: 'In the case of remote system sync you can store the sync at time',
        // },
        // sourceStatus: {
        //     type: Text,
        //     schemaDoc: 'In the case of remote system sync you can store the remote status text',
        // },

        // TODO(Dimitreee): move to server side autogen
        statusUpdatedAt: {
            type: DateTimeUtc,
            schemaDoc: 'Status updated at time',
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: ACCESS_TO_ALL,
    hooks: {
        validateInput: ({ resolvedData, existingItem, addValidationError }) => {
            if (!hasRequestAndDbFields(['dv', 'sender'], ['organization', 'source', 'status', 'classifier', 'details'], resolvedData, existingItem, addValidationError)) return
            const { dv } = resolvedData
            if (dv === 1) {
                // NOTE: version 1 specific translations. Don't optimize this logic
            } else {
                return addValidationError(`${DV_UNKNOWN_VERSION_ERROR}dv] Unknown \`dv\``)
            }

            if (resolvedData.statusUpdatedAt) {
                if (existingItem.statusUpdatedAt) {
                    if (new Date(resolvedData.statusUpdatedAt) <= new Date(existingItem.statusUpdatedAt)) {
                        return addValidationError(`${STATUS_UPDATED_AT_ERROR}statusUpdatedAt] Incorrect \`statusUpdatedAt\``)
                    }
                } else {
                    if (new Date(resolvedData.statusUpdatedAt) <= new Date(existingItem.createdAt)) {
                        return addValidationError(`${STATUS_UPDATED_AT_ERROR}statusUpdatedAt] Incorrect \`statusUpdatedAt\``)
                    }
                }
            }
        },
    },
})

module.exports = {
    Ticket,
}
