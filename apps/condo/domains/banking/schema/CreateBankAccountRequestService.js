/**
 * Generated by `createservice banking.CreateBankAccountRequestService '--type=mutations'`
 */

const conf = require('@open-condo/config')
const { GQLError, GQLErrorCode: { INTERNAL_ERROR, BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { GQLCustomSchema, find, getById } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/banking/access/CreateBankAccountRequestService')
const { INCORRECT_PROPERTY_ID, EMPTY_BANK_ACCOUNT_REQUEST_EMAIL_TARGET_VALUE } = require('@condo/domains/banking/constants')
const { BANK_ACCOUNT_CREATION_REQUEST_TYPE } = require('@condo/domains/notification/constants/constants')
const { sendMessage } = require('@condo/domains/notification/utils/serverSchema')


/**
 * List of possible errors, that this custom schema can throw
 * They will be rendered in documentation section in GraphiQL for this custom schema
 */
const ERRORS = {
    NO_EMAIL_TARGET_WAS_SET: {
        mutation: 'createBankAccountRequest',
        message: 'No BANK_ACCOUNT_REQUEST_EMAIL_TARGET variable was found',
        type: EMPTY_BANK_ACCOUNT_REQUEST_EMAIL_TARGET_VALUE,
        code: INTERNAL_ERROR,
    },
    INCORRECT_PROPERTY_ID: {
        mutation: 'createBankAccountRequest',
        message: 'Incorrect propertyId was provided. Please check that this id related to passed organizationId',
        type: INCORRECT_PROPERTY_ID,
        code: BAD_USER_INPUT,
        variable: ['propertyId'],
        messageForUser: 'api.banking.createBankAccountRequest.INCORRECT_PROPERTY_ID',
    },
}

const CreateBankAccountRequestService = new GQLCustomSchema('CreateBankAccountRequestService', {
    types: [
        {
            access: true,
            type: 'input CreateBankAccountRequestInput { dv: Int!, sender: JSON!, organizationId: ID!, propertyId: ID! }',
        },
        {
            access: true,
            type: 'type CreateBankAccountRequestOutput { status: String!, id: ID! }',
        },
    ],

    mutations: [
        {
            access: access.canCreateBankAccountRequest,
            schema: 'createBankAccountRequest(data: CreateBankAccountRequestInput!): CreateBankAccountRequestOutput',
            resolver: async (parent, args, context) => {
                const { data: {
                    organizationId, propertyId, sender,
                } } = args
                const emailTo = conf['BANK_ACCOUNT_REQUEST_EMAIL_TARGET']
                if (!emailTo) {
                    throw new GQLError(ERRORS.NO_EMAIL_TARGET_WAS_SET, context)
                }

                const organization = await getById('Organization', organizationId)
                const [property] = await find('Property', {
                    id: propertyId,
                    organization: { id: organizationId },
                })
                if (!property) {
                    throw new GQLError(ERRORS.INCORRECT_PROPERTY_ID, context)
                }

                const { status, id } = await sendMessage(context, {
                    to: {
                        email: emailTo,
                    },
                    type: BANK_ACCOUNT_CREATION_REQUEST_TYPE,
                    meta: {
                        dv: 1,
                        bankAccountClient: {
                            phone: context.authedItem.phone,
                            name: context.authedItem.name,
                            email: context.authedItem.email,
                        },
                        tin: organization.tin,
                        name: organization.name,
                        propertyAddress: property.address,
                    },
                    sender,
                })

                return { id, status }
            },
        },
    ],
})

module.exports = {
    CreateBankAccountRequestService,
}
