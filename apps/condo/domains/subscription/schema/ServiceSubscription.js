/**
 * Generated by `createschema subscription.ServiceSubscription 'type:Text; isTrial:Checkbox; organization:Relationship:Organization:CASCADE; startAt:DateTimeUtc; finishAt:DateTimeUtc;'`
 */

const { Select, Checkbox, DateTimeUtc } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/subscription/access/ServiceSubscription')
const { ORGANIZATION_OWNED_FIELD } = require('../../../schema/_common')
const { ServiceSubscription: ServiceSubscriptionAPI } = require('../utils/serverSchema')
const get = require('lodash/get')
const { OVERLAPPING_ERROR } = require('../constants/errors')


const ServiceSubscription = new GQLListSchema('ServiceSubscription', {
    schemaDoc: 'Availability time period of service features for client organization. Can be trial or payed.',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        type: {
            schemaDoc: 'System, from where subscription was created (our or external)',
            type: Select,
            options: 'default,sbbol',
            isRequired: true,
        },

        isTrial: {
            schemaDoc: 'Trial mode of subscription',
            type: Checkbox,
            isRequired: true,
        },

        organization: ORGANIZATION_OWNED_FIELD,

        startAt: {
            schemaDoc: 'When subscription was started',
            type: DateTimeUtc,
            isRequired: true,
        },

        finishAt: {
            schemaDoc: 'When subscription should be ended',
            type: DateTimeUtc,
            isRequired: true,
        },

    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.CheckConstraint',
                check: 'Q(type__in=["default", "sbbol"])',
                name: 'type_values_check',
            },
            {
                type: 'models.CheckConstraint',
                check: 'Q(startAt__lt=models.F("finishAt"))',
                name: 'startAt_is_before_finishAt',
            },
        ],
    },
    hooks: {
        validateInput: async ({ resolvedData, operation, existingItem, addValidationError, context }) => {
            // It makes no sense:
            // - To create subscription in past
            let organizationId
            let overlappedSubscriptionsCount
            const ovelappingConditions = {
                OR: [
                    { startAt_gte: resolvedData.startAt },
                    { finishAt_gte: resolvedData.startAt },
                ],
            }
            const scopeConditions = {}
            if (operation === 'create') {
                organizationId = get(resolvedData, 'organization')
            } else if (operation === 'update') {
                organizationId = get(existingItem, 'organization')
                scopeConditions.id_not = existingItem.id
            }
            if (!organizationId) {
                throw new Error('No organization set for ServiceSubscription')
            }
            scopeConditions.organization = { id: organizationId }
            overlappedSubscriptionsCount = await ServiceSubscriptionAPI.count(context, {
                ...ovelappingConditions,
                ...scopeConditions,
            })
            if (overlappedSubscriptionsCount > 0) {
                return addValidationError(`${OVERLAPPING_ERROR} subscription for current organization overlaps already existing by its time period`)
            }
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadServiceSubscriptions,
        create: access.canManageServiceSubscriptions,
        update: access.canManageServiceSubscriptions,
        delete: false,
        auth: true,
    },
})

module.exports = {
    ServiceSubscription,
}
