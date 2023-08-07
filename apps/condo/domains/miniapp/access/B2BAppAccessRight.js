/**
 * Generated by `createschema miniapp.B2BAppAccessRight 'user:Relationship:User:PROTECT;'`
 */

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

async function canReadB2BAppAccessRights ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isSupport || user.isAdmin) return {}

    // TODO(DOMA-6766): Add the ability to read the permissions of B2BApp for employees whose role has the flag "canManageIntegrations"
    return false
}

async function canManageB2BAppAccessRights ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    return !!(user.isSupport || user.isAdmin)
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadB2BAppAccessRights,
    canManageB2BAppAccessRights,
}
