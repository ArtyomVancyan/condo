/**
 * Generated by `createschema document.Document 'organization:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; category:Relationship:DocumentCategory:CASCADE; file:File;'`
 */

const get = require('lodash/get')
const uniq = require('lodash/uniq')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getById, find } = require('@open-condo/keystone/schema')

const { queryOrganizationEmployeeFor, checkOrganizationPermission, checkUserPermissionsInOrganizations } = require('@condo/domains/organization/utils/accessSchema')


async function canReadDocuments ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin) return {}

    return { organization: queryOrganizationEmployeeFor(user.id, 'canReadDocuments') }
}

async function canManageDocuments ({ authentication: { item: user }, originalInput, operation, itemId, itemIds }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    const isBulkRequest = Array.isArray(originalInput)

    let organizationId

    if (operation === 'create') {
        if (isBulkRequest) {
            const organizationIds = uniq(originalInput.map(item => get(item, 'data.organization.connect.id')))

            return await checkUserPermissionsInOrganizations({
                userId: user.id, organizationIds, permission: 'canManageDocuments',
            })
        } else {
            organizationId = get(originalInput, ['organization', 'connect', 'id'])
        }
    } else if (operation === 'update') {
        if (isBulkRequest) {
            if (!itemIds || !Array.isArray(itemIds)) return false
            if (itemIds.length !== uniq(itemIds).length) return false
            const documents = await find('Document', {
                id_in: itemIds,
                deletedAt: null,
            })
            if (documents.length !== itemIds.length) return false
            const organizationIds = uniq(documents.map(document => get(document, 'organization')))

            return await checkUserPermissionsInOrganizations({
                userId: user.id, organizationIds, permission: 'canManageDocuments',
            })
        } else {
            const document = await getById('Document', itemId)
            if (!document || document.deletedAt) {
                return false
            }

            organizationId = document.organization
        }
    }

    if (!organizationId) {
        return false
    }

    return await checkOrganizationPermission(user.id, organizationId, 'canManageDocuments')
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadDocuments,
    canManageDocuments,
}
