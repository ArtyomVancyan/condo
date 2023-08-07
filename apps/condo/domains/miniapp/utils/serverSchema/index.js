/**
 * Generated by `createservice miniapp.AllOrganizationAppsService --type queries`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { execGqlWithoutAccess, generateServerUtils } = require('@open-condo/codegen/generate.server.utils')

const {
    ALL_MINI_APPS_QUERY,
    SEND_B2C_APP_PUSH_MESSAGE_MUTATION,
    B2BApp: B2BAppGQL,
    B2BAppContext: B2BAppContextGQL,
    B2BAppAccessRight: B2BAppAccessRightGQL,
    B2BAppAccessRightSet: B2BAppAccessRightSetGQL,
    B2BAppPermission: B2BAppPermissionGQL,
    B2BAppPromoBlock: B2BAppPromoBlockGQL,
    B2BAppRole: B2BAppRoleGQL,
    B2CApp: B2CAppGQL,
    B2CAppProperty: B2CAppPropertyGQL,
    B2CAppAccessRight: B2CAppAccessRightGQL,
    B2CAppBuild: B2CAppBuildGQL,
    MessageAppBlackList: MessageAppBlackListGQL,
} = require('@condo/domains/miniapp/gql')
/* AUTOGENERATE MARKER <IMPORT> */

async function allOrganizationApps (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: ALL_MINI_APPS_QUERY,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to allOrganizationApps',
        dataPath: 'obj',
    })
}

async function sendB2CAppPushMessage (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: SEND_B2C_APP_PUSH_MESSAGE_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to sendB2CAppPushMessage',
        dataPath: 'result',
    })
}

const B2BApp = generateServerUtils(B2BAppGQL)
const B2BAppContext = generateServerUtils(B2BAppContextGQL)
const B2BAppAccessRight = generateServerUtils(B2BAppAccessRightGQL)
const B2CApp = generateServerUtils(B2CAppGQL)
const B2CAppAccessRight = generateServerUtils(B2CAppAccessRightGQL)
const B2CAppBuild = generateServerUtils(B2CAppBuildGQL)
const B2CAppProperty = generateServerUtils(B2CAppPropertyGQL)
const B2BAppPromoBlock = generateServerUtils(B2BAppPromoBlockGQL)
const MessageAppBlackList = generateServerUtils(MessageAppBlackListGQL)
const B2BAppPermission = generateServerUtils(B2BAppPermissionGQL)
const B2BAppRole = generateServerUtils(B2BAppRoleGQL)
const B2BAppAccessRightSet = generateServerUtils(B2BAppAccessRightSetGQL)
/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    allOrganizationApps,
    B2BApp,
    B2BAppContext,
    B2BAppAccessRight,
    B2BAppPermission,
    B2BAppPromoBlock,
    B2BAppRole,
    B2CApp,
    B2CAppAccessRight,
    B2CAppBuild,
    B2CAppProperty,
    sendB2CAppPushMessage,
    MessageAppBlackList,
    B2BAppAccessRightSet,
/* AUTOGENERATE MARKER <EXPORTS> */
}
