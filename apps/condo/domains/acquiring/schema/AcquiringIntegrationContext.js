/**
 * Generated by `createschema acquiring.AcquiringIntegrationContext 'integration:Relationship:AcquiringIntegration:PROTECT; organization:Relationship:Organization:PROTECT; settings:Json; state:Json;' --force`
 */

const dayjs = require('dayjs')
const { get } = require('lodash')
const { Relationship, DateTimeUtc, Virtual } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const { ACQUIRING_INTEGRATION_FIELD } = require('@condo/domains/acquiring/schema/fields/relations')
const access = require('@condo/domains/acquiring/access/AcquiringIntegrationContext')
const { hasValidJsonStructure, hasDvAndSenderFields } = require('@condo/domains/common/utils/validation.utils')
const { DV_UNKNOWN_VERSION_ERROR } = require('@condo/domains/common/constants/errors')
const { FEE_DISTRIBUTION_SCHEMA_FIELD } = require('@condo/domains/acquiring/schema/fields/json/FeeDistribution')
const { AcquiringIntegrationContext: ContextServerSchema } = require('@condo/domains/acquiring/utils/serverSchema')
const { CONTEXT_ALREADY_HAVE_ACTIVE_CONTEXT } = require('@condo/domains/acquiring/constants/errors')


const AcquiringIntegrationContext = new GQLListSchema('AcquiringIntegrationContext', {
    schemaDoc: 'Object, which links `acquiring integration` with `service provider`, and stores additional data for it\'s proper work',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        integration: ACQUIRING_INTEGRATION_FIELD,

        organization: {
            schemaDoc: 'Service provider (organization)',
            type: Relationship,
            ref: 'Organization',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
        },

        settings: {
            schemaDoc: 'Settings that are required for acquiring to work properly. The data structure depends on the integration and defined here',
            type: Json,
            isRequired: true,
            hooks: {
                validateInput: (args) => {
                    hasValidJsonStructure(args, true, 1, {})
                },
            },
        },

        state: {
            schemaDoc: 'The current state of the integration process. Some integration need to store past state here, additional data and etc.',
            type: Json,
            isRequired: true,
            hooks: {
                validateInput: (args) => {
                    hasValidJsonStructure(args, true, 1, {})
                },
            },
        },

        implicitFeeDistributionSchema: {
            ...FEE_DISTRIBUTION_SCHEMA_FIELD,
            isRequired: false,
            schemaDoc: 'Contains information about the default distribution of implicit fee. Each part is paid by the recipient organization on deducted from payment amount. If part exists then explicit part with the same name from AcquiringIntegration.explicitFeeDistributionSchema is ignored',
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadAcquiringIntegrationContexts,
        create: access.canManageAcquiringIntegrationContexts,
        update: access.canManageAcquiringIntegrationContexts,
        delete: false,
        auth: true,
    },
    hooks: {
        validateInput: async ({ resolvedData, context, addValidationError, operation }) => {
            if (!hasDvAndSenderFields(resolvedData, context, addValidationError)) return
            const { dv } = resolvedData
            if (dv === 1) {
                // NOTE: version 1 specific translations. Don't optimize this logic
            } else {
                return addValidationError(`${DV_UNKNOWN_VERSION_ERROR}dv] Unknown \`dv\``)
            }
            if (operation === 'create') {
                const activeContexts = await ContextServerSchema.getAll(context, {
                    organization: { id: resolvedData['organization'] },
                    deletedAt: null,
                })
                if (activeContexts.length) {
                    addValidationError(CONTEXT_ALREADY_HAVE_ACTIVE_CONTEXT)
                }
            }
        },
    },
})

module.exports = {
    AcquiringIntegrationContext,
}
