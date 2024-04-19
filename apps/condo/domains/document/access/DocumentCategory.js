/**
 * Generated by `createschema document.DocumentCategory 'name:Text; order:Integer;'`
 */

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

async function canReadDocumentCategories ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    return {}
}

async function canManageDocumentCategories ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadDocumentCategories,
    canManageDocumentCategories,
}
