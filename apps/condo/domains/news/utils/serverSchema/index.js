/**
 * Generated by `createschema news.OrganizationNewsItem 'organization:Relationship:Organization:CASCADE; title:Text; body:Text; type:Select:common,emergency'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateServerUtils } = require('@open-condo/codegen/generate.server.utils')

const { NewsItem: NewsItemGQL } = require('@condo/domains/news/gql')
const { NewsItemScope: NewsItemScopeGQL } = require('@condo/domains/news/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const NewsItem = generateServerUtils(NewsItemGQL)
const NewsItemScope = generateServerUtils(NewsItemScopeGQL)
/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    NewsItem,
    NewsItemScope,
/* AUTOGENERATE MARKER <EXPORTS> */
}
