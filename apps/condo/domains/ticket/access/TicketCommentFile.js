// @ts-nocheck
/**
 * Generated by `createschema ticket.TicketCommentFile 'organization:Relationship:Organization:CASCADE;file?:File;ticketComment?:Relationship:TicketComment:SET_NULL'`
 */

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { RESIDENT, STAFF } = require('@condo/domains/user/constants/common')
const { find, getByCondition, getById } = require('@core/keystone/schema')
const compact = require('lodash/compact')
const get = require('lodash/get')
const { getTicketFieldsMatchesResidentFieldsQuery } = require('../utils/accessSchema')
const { RESIDENT_COMMENT_TYPE, COMPLETED_STATUS_TYPE, CANCELED_STATUS_TYPE } = require('../constants')
const uniq = require('lodash/uniq')
const {
    queryOrganizationEmployeeFor,
    queryOrganizationEmployeeFromRelatedOrganizationFor, checkPermissionInUserOrganizationOrRelatedOrganization,
} = require('@condo/domains/organization/utils/accessSchema')
const omit = require('lodash/omit')
const isEmpty = require('lodash/isEmpty')

async function canReadTicketCommentFiles ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isSupport || user.isAdmin) return {}

    if (user.type === RESIDENT) {
        const residents = await find('Resident', { user: { id: user.id }, deletedAt: null })

        const organizationsIds = compact(residents.map(resident => get(resident, 'organization')))
        const residentAddressOrStatement = getTicketFieldsMatchesResidentFieldsQuery(user, residents)

        return {
            type: RESIDENT_COMMENT_TYPE,
            ticket: {
                organization: {
                    id_in: uniq(organizationsIds),
                    deletedAt: null,
                },
                OR: [
                    { createdBy: { id: user.id } },
                    ...residentAddressOrStatement,
                ],
            },
        }
    }

    return {
        organization: {
            OR: [
                queryOrganizationEmployeeFor(user.id),
                queryOrganizationEmployeeFromRelatedOrganizationFor(user.id),
            ],
        },
    }
}

async function canManageTicketCommentFiles ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    if (user.type === RESIDENT) {
        let ticket, commentType

        if (operation === 'create') {
            const ticketId = get(originalInput, ['ticket', 'connect', 'id'])
            const ticketCommentId = get(originalInput, ['ticketComment', 'connect', 'id'])
            const ticketComment = await getByCondition('TicketComment', { id: ticketCommentId, deletedAt: null })
            ticket = await getByCondition('Ticket', { id: ticketId, deletedAt: null })
            commentType = get(ticketComment, 'type')
        } else if (operation === 'update' && itemId) {
            const ticketCommentId = get(originalInput, ['ticketComment', 'connect', 'id'])
            const ticketComment = await getByCondition('TicketComment', { id: ticketCommentId, deletedAt: null })
            if (!ticketComment || ticketComment.user !== user.id) return false

            ticket = await getByCondition('Ticket', { id: ticketComment.ticket, deletedAt: null })
            if (!ticket) return false

            commentType = get(ticketComment, 'type')
        }

        if (!ticket || !commentType || commentType !== RESIDENT_COMMENT_TYPE) return false

        const ticketStatusId = get(ticket, 'status')
        const ticketStatus = await getById('TicketStatus', ticketStatusId)
        if (ticketStatus.type === COMPLETED_STATUS_TYPE || ticketStatus.type === CANCELED_STATUS_TYPE) {
            return false
        }

        const propertyId = get(ticket, 'property', null)
        const unitName = get(ticket, 'unitName', null)
        const unitType = get(ticket, 'unitType', null)

        const residents = await find('Resident', {
            user: { id: user.id },
            property: { id: propertyId, deletedAt: null },
            unitName,
            unitType,
            deletedAt: null,
        })

        return residents.length > 0
    } else if (user.type === STAFF) {
        if (operation === 'create') {
            const ticketId = get(originalInput, ['ticket', 'connect', 'id'])
            const ticket = await getByCondition('Ticket', { id: ticketId, deletedAt: null })
            if (!ticket) return false
            const organizationId = get(ticket, 'organization')

            return await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, organizationId, 'canManageTicketComments')
        } else if (operation === 'update' && itemId) {
            const commentFile = await getByCondition('TicketCommentFile', { id: itemId, deletedAt: null })
            const commentId = get(commentFile, 'ticketComment')
            const comment = await getByCondition('TicketCommentFile', { id: commentId, deletedAt: null })
            if (!comment || comment.user !== user.id) return false

            const ticket = await getByCondition('Ticket', { id: comment.ticket, deletedAt: null })
            if (!ticket) return false

            const organizationId = get(ticket, 'organization')

            return await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, organizationId, 'canManageTicketComments')
        }
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTicketCommentFiles,
    canManageTicketCommentFiles,
}
