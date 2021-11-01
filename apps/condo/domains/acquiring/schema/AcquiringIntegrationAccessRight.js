/**
 * Generated by `createschema acquiring.AcquiringIntegrationAccessRight 'user:Relationship:User:PROTECT;'`
 */

const { Relationship } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/acquiring/access/AcquiringIntegrationAccessRight')
const { DV_UNKNOWN_VERSION_ERROR } = require('@condo/domains/common/constants/errors')
const { hasDvAndSenderFields } = require('@condo/domains/common/utils/validation.utils')
const { ACQUIRING_INTEGRATION_FIELD } = require('@condo/domains/acquiring/schema/fields/relations')


const AcquiringIntegrationAccessRight = new GQLListSchema('AcquiringIntegrationAccessRight', {
    schemaDoc: 'Link between Acquiring integration and user, the existence of this connection means that this user has the rights to perform actions on behalf of the integration',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        integration: {
            ...ACQUIRING_INTEGRATION_FIELD,
            ref: 'AcquiringIntegration.accessRights',
        },

        user: {
            schemaDoc: 'User',
            type: Relationship,
            ref: 'User',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadAcquiringIntegrationAccessRights,
        create: access.canManageAcquiringIntegrationAccessRights,
        update: access.canManageAcquiringIntegrationAccessRights,
        delete: false,
        auth: true,
    },
    hooks: {
        validateInput: ({ resolvedData, context, addValidationError }) => {
            if (!hasDvAndSenderFields(resolvedData, context, addValidationError)) return
            const { dv } = resolvedData
            if (dv === 1) {
                // NOTE: version 1 specific translations. Don't optimize this logic
            } else {
                return addValidationError(`${DV_UNKNOWN_VERSION_ERROR}dv] Unknown \`dv\``)
            }
        },
    },
})

module.exports = {
    AcquiringIntegrationAccessRight,
}
