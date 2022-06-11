/**
 * Generated by `createschema miniapp.B2CApp 'name:Text;'`
 */

const dayjs = require('dayjs')
const { Text, Relationship } = require('@keystonejs/fields')
const { GQLListSchema, find, getByCondition } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { dvAndSender } = require('@condo/domains/common/schema/plugins/dvAndSender')
const access = require('@condo/domains/miniapp/access/B2CApp')
const {
    LOGO_FIELD,
    SHORT_DESCRIPTION_FIELD,
    DEVELOPER_FIELD,
    IS_HIDDEN_FIELD,
} = require('@condo/domains/miniapp/schema/fields/integration')
const { COLOR_SCHEMA_FIELD } = require('@condo/domains/miniapp/schema/fields/b2cApp')
const { B2CAppBuild } = require('@condo/domains/miniapp/utils/serverSchema')
const { RESTRICT_APP_CHANGE_ERROR, RESTRICT_BUILD_SELECT_ERROR } = require('@condo/domains/miniapp/constants')


const B2CApp = new GQLListSchema('B2CApp', {
    schemaDoc: 'B2C App',
    fields: {
        name: {
            schemaDoc: 'Name of B2C App',
            type: Text,
            isRequired: true,
        },
        logo: {
            ...LOGO_FIELD,
            isRequired: true,
        },
        shortDescription: SHORT_DESCRIPTION_FIELD,
        developer: DEVELOPER_FIELD,
        isHidden: IS_HIDDEN_FIELD,
        colorSchema: COLOR_SCHEMA_FIELD,
        currentBuild: {
            schemaDoc: 'Link to current active app build',
            type: Relationship,
            ref: 'B2CAppBuild',
            isRequired: false,
            kmigratorOptions: { null: true, on_delete: 'models.PROTECT' },
            hooks: {
                validateInput: async ({ resolvedData, fieldPath, addFieldValidationError, operation, existingItem }) => {
                    const appId = operation === 'create' ? resolvedData.id : existingItem.id
                    if (resolvedData.hasOwnProperty(fieldPath) && resolvedData[fieldPath] !== null) {
                        const validBuild = await getByCondition('B2CAppBuild', {
                            deletedAt: null,
                            app: { id: appId },
                            id: resolvedData[fieldPath],
                        })
                        if (!validBuild) {
                            return addFieldValidationError(RESTRICT_BUILD_SELECT_ERROR)
                        }
                    }
                },
            },
        },
        builds: {
            schemaDoc: 'List of available app builds. Removing item from this list automatically soft-deletes it',
            type: Relationship,
            ref: 'B2CAppBuild.app',
            many: true,
            hooks: {
                validateInput: async ({ resolvedData, fieldPath, addFieldValidationError, operation, existingItem }) => {
                    const appId = operation === 'create' ? resolvedData.id : existingItem.id
                    const buildIds = resolvedData[fieldPath]
                    const restrictedBuilds = await find('B2CAppBuild', {
                        id_in: buildIds,
                        app: { id_not: appId },
                        deletedAt: null,
                    })
                    if (restrictedBuilds.length) {
                        return addFieldValidationError(RESTRICT_APP_CHANGE_ERROR)
                    }
                },
            },
        },
        accessRights: {
            schemaDoc: 'Specifies set of service users, who can modify B2CAppProperties of the app as well as perform actions on behalf of the application',
            type: Relationship,
            ref: 'B2CAppAccessRight.app',
            many: true,
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    hooks: {
        afterChange: async ({ operation, context }) => {
            if (operation === 'update') {
                const buildsToDelete = await find('B2CAppBuild', {
                    app_is_null: true,
                    deletedAt: null,
                })
                const deletedAt = dayjs().toISOString()
                for (const build of buildsToDelete) {
                    await B2CAppBuild.update(context, build.id, {
                        deletedAt,
                        dv: 1,
                        sender: { dv: 1, fingerprint: 'app-ref-delete' },
                    })
                }
            }
        },
    },
    access: {
        read: access.canReadB2CApps,
        create: access.canManageB2CApps,
        update: access.canManageB2CApps,
        delete: false,
        auth: true,
    },
})

module.exports = {
    B2CApp,
}
