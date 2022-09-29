/**
 * Generated by `createschema ticket.TicketOrganizationSetting 'organization:Relationship:Organization:CASCADE; defaultDeadline?:Integer; paidDeadline?:Integer; emergencyDeadline?:Integer; warrantyDeadline?:Integer;'`
 */

const { throwAuthenticationError } = require('@condo/keystone/apolloErrorFormatter')
const {
    queryOrganizationEmployeeFor,
    queryOrganizationEmployeeFromRelatedOrganizationFor,
} = require('@condo/domains/organization/utils/accessSchema')

async function canReadTicketOrganizationSettings ({ authentication: { item: user } }) {
    if (!user) throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    return {
        organization: {
            OR: [
                queryOrganizationEmployeeFor(user.id),
                queryOrganizationEmployeeFromRelatedOrganizationFor(user.id),
            ],
        },
    }
}

async function canManageTicketOrganizationSettings ({ authentication: { item: user }, operation }) {
    if (!user) throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    if (operation === 'create') return false

    if (operation === 'update') {
        return {
            organization: {
                OR: [
                    queryOrganizationEmployeeFor(user.id),
                    queryOrganizationEmployeeFromRelatedOrganizationFor(user.id),
                ],
            },
        }
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTicketOrganizationSettings,
    canManageTicketOrganizationSettings,
}