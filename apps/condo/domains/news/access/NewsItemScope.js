/**
 * Generated by `createschema news.NewsItemScope 'newsItem:Relationship:NewsItem:CASCADE; property:Relationship:Property:CASCADE; unitType:Select:get,from,constant,unit_types; unitName:Text'`
 */

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

async function canReadNewsItemScopes ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin || user.isSupport) return {}

    return false
}

async function canManageNewsItemScopes ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    return !!user.isAdmin
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadNewsItemScopes,
    canManageNewsItemScopes,
}
