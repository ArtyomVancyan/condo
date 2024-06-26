/**
 * Generated by `createschema ticket.TicketComment 'ticket:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; content:Text;'`
 */
const { Text, Relationship, Select } = require('@keystonejs/fields')
const get = require('lodash/get')
const isNull = require('lodash/isNull')

const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const { normalizeText } = require('@condo/domains/common/utils/text')
const access = require('@condo/domains/ticket/access/TicketComment')
const { COMMENT_TYPES, RESIDENT_COMMENT_TYPE, ORGANIZATION_COMMENT_TYPE } = require('@condo/domains/ticket/constants')
const { USER_MUST_BE_SAME_AS_CREATED_BY } = require('@condo/domains/ticket/constants/errors')
const { sendTicketCommentNotifications, updateTicketLastCommentTime } = require('@condo/domains/ticket/utils/handlers')
const { updateTicketReadCommentTime } = require('@condo/domains/ticket/utils/handlers')
const { RESIDENT, STAFF } = require('@condo/domains/user/constants/common')


const ERRORS = {
    USER_MUST_BE_SAME_AS_CREATED_BY: {
        code: BAD_USER_INPUT,
        message: 'User field must be same as createdBy',
        type: USER_MUST_BE_SAME_AS_CREATED_BY,
    },
}

const TicketComment = new GQLListSchema('TicketComment', {
    schemaDoc: 'Textual comment for tickets',
    fields: {
        type: {
            schemaDoc: 'Comment type (internal for an organization or with a resident)',
            isRequired: true,
            type: Select,
            dataType: 'string',
            options: COMMENT_TYPES,
            hooks: {
                resolveInput: ({ resolvedData, context, fieldPath, operation }) => {
                    const user = get(context, ['req', 'user'])
                    const userType = get(user, 'type')

                    if (userType !== RESIDENT && operation === 'create') {
                        const commentType = get(resolvedData, 'type', null)

                        if (isNull(commentType)) {
                            resolvedData[fieldPath] = ORGANIZATION_COMMENT_TYPE
                        }
                    }

                    return resolvedData[fieldPath]
                },
            },
        },

        ticket: {
            schemaDoc: 'Related ticket of the comment',
            type: Relationship,
            ref: 'Ticket',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        // This field will take part in business logic and should be declared here explicitly.
        // That's why `createdBy` field, generated by `tracked` plugin, is not used for association of a comment with ticket.
        user: {
            schemaDoc: 'User, who created the comment',
            type: Relationship,
            ref: 'User',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
            access: {
                read: access.canReadUserField,
                update: access.canSetUserField,
                create: access.canSetUserField,
            },
            hooks: {
                validateInput: async ({ resolvedData, fieldPath, context }) => {
                    const userId = resolvedData[fieldPath]

                    if (userId !== resolvedData.createdBy) {
                        throw new GQLError(ERRORS.USER_MUST_BE_SAME_AS_CREATED_BY, context)
                    }
                },
            },
        },

        content: {
            schemaDoc: 'Plain text content',
            type: Text,
            hooks: {
                resolveInput: async ({ resolvedData }) => {
                    return normalizeText(resolvedData['content']) || ''
                },
            },
        },
    },
    hooks: {
        afterChange: async (requestData) => {
            const { updatedItem, operation, context } = requestData

            const user = get(context, ['req', 'user'])
            const userType = get(user, 'type')
            const commentType = get(updatedItem, 'type')

            if (operation === 'create') {
                const commentCreatedAt = get(updatedItem, 'createdAt').toISOString()

                await updateTicketLastCommentTime(context, updatedItem, userType, commentCreatedAt)

                if (commentType === RESIDENT_COMMENT_TYPE && userType === STAFF) {
                    await updateTicketReadCommentTime(context, updatedItem, commentCreatedAt)
                }
            }

            await sendTicketCommentNotifications(requestData)
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadTicketComments,
        create: access.canManageTicketComments,
        update: access.canManageTicketComments,
        delete: false,
        auth: true,
    },
})

module.exports = {
    TicketComment,
    ERRORS,
}
