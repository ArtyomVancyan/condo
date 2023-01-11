/**
 * Generated by `createservice user.RegisterUserExternalIdentityService`
 */

const { GQLCustomSchema, getById } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/user/access/RegisterUserExternalIdentityService')
const { UserExternalIdentity } = require('@condo/domains/user/utils/serverSchema')
const { IDP_TYPES } = require('@condo/domains/user/constants/common')

const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { DV_VERSION_MISMATCH, WRONG_FORMAT } = require('@condo/domains/common/constants/errors')
const { checkDvAndSender } = require('@open-condo/keystone/plugins/dvAndSender')
const {
    USER_NOT_FOUND,
    EMPTY_EXTERNAL_IDENTITY_ID_VALUE,
} = require('@condo/domains/user/constants/errors')

const errors = {
    DV_VERSION_MISMATCH: {
        mutation: 'registerUserExternalIdentity',
        variable: ['data', 'dv'],
        code: BAD_USER_INPUT,
        type: DV_VERSION_MISMATCH,
        message: 'Unsupported value for dv',
    },
    WRONG_SENDER_FORMAT: {
        mutation: 'registerUserExternalIdentity',
        variable: ['data', 'sender'],
        code: BAD_USER_INPUT,
        type: WRONG_FORMAT,
        message: 'Invalid format of "sender" field value. {details}',
        correctExample: '{ dv: 1, fingerprint: \'example-fingerprint-alphanumeric-value\'}',
    },
    USER_NOT_FOUND: {
        mutation: 'registerUserExternalIdentity',
        variable: ['data', 'user', 'id'],
        code: BAD_USER_INPUT,
        type: USER_NOT_FOUND,
        message: 'Could not find User by provided id',
    },
    EMPTY_EXTERNAL_IDENTITY_ID_VALUE: {
        mutation: 'registerUserExternalIdentity',
        variable: ['data', 'identityId'],
        code: BAD_USER_INPUT,
        type: EMPTY_EXTERNAL_IDENTITY_ID_VALUE,
        message: 'Can not create UserExternalIdentity for empty identityId',
    },
}

const RegisterUserExternalIdentityService = new GQLCustomSchema('RegisterUserExternalIdentityService', {
    types: [
        {
            access: true,
            type: `enum IdentityType { ${IDP_TYPES.join(' ')} }`,
        },
        {
            access: true,
            type: 'input RegisterUserExternalIdentityInput { dv: Int! sender: SenderFieldInput! user: UserWhereUniqueInput! identityId: String! identityType: IdentityType! meta: JSON! }',
        },
        {
            access: true,
            type: 'type RegisterUserExternalIdentityOutput { status: String!, id: String! }',
        },
    ],

    mutations: [
        {
            access: access.canRegisterUserExternalIdentity,
            schema: 'registerUserExternalIdentity(data: RegisterUserExternalIdentityInput!): RegisterUserExternalIdentityOutput',
            resolver: async (parent, args, context) => {
                const { data } = args
                const {
                    dv,
                    sender,
                    user,
                    identityId,
                    identityType,
                    meta,
                } = data
                // validate dv & sender
                checkDvAndSender(data, errors.DV_VERSION_MISMATCH, errors.WRONG_SENDER_FORMAT, context)

                // validate user
                const userEntity = await getById('User', user.id)
                if (!userEntity) {
                    throw new GQLError(errors.USER_NOT_FOUND, context)
                }

                // validate identityId
                if (!identityId) {
                    throw new GQLError(errors.EMPTY_EXTERNAL_IDENTITY_ID_VALUE, context)
                }

                const identity = await UserExternalIdentity.create(context, {
                    dv,
                    sender,
                    user: { connect: { id: userEntity.id } },
                    identityId,
                    identityType,
                    meta,
                })

                return { status: 'ok', id: identity.id }
            },
        },
    ],

})

module.exports = {
    RegisterUserExternalIdentityService,
}