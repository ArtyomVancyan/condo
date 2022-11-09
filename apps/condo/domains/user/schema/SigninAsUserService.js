/**
 * Generated by `createservice user.SigninAsUserService`
 */

const { GQLCustomSchema } = require('@open-condo/keystone/schema')
const access = require('@condo/domains/user/access/SigninAsUserService')
const { getItem } = require('@keystonejs/server-side-graphql-client')
const { getSchemaCtx } = require('@open-condo/keystone/schema')
const { GQLError, GQLErrorCode: { FORBIDDEN, BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { USER_NOT_FOUND, DENIED_FOR_ADMIN, DENIED_FOR_SUPPORT } = require('../constants/errors')


/**
 * List of possible errors, that this custom schema can throw
 * They will be rendered in documentation section in GraphiQL for this custom schema
 */
const ERRORS = {
    USER_NOT_FOUND: {
        mutation: 'signinAsUser',
        code: BAD_USER_INPUT,
        type: USER_NOT_FOUND,
        message: 'Could not find a user with a specified id',
        messageForUser: 'api.user.signinAsUser.USER_NOT_FOUND',
    },
    DENIED_FOR_ADMIN: {
        mutation: 'signinAsUser',
        code: FORBIDDEN,
        type: DENIED_FOR_ADMIN,
        message: 'You cannot authenticate for an another admin user',
        messageForUser: 'api.user.signinAsUser.DENIED_FOR_ADMIN',
    },
    DENIED_FOR_SUPPORT: {
        mutation: 'signinAsUser',
        code: FORBIDDEN,
        type: DENIED_FOR_SUPPORT,
        message: 'You cannot authenticate for an another support user',
        messageForUser: 'api.user.signinAsUser.DENIED_FOR_SUPPORT',
    },
}

const SigninAsUserService = new GQLCustomSchema('SigninAsUserService', {
    types: [
        {
            access: true,
            // todo(DOMA-2305) use UserWhereUniqueInput instead of ID!
            type: 'input SigninAsUserInput { dv: Int!, sender: SenderFieldInput!, id: ID! }',
        },
        {
            access: true,
            type: 'type SigninAsUserOutput { user: User, token: String! }',
        },
    ],
    
    mutations: [
        {
            access: access.canSigninAsUser,
            schema: 'signinAsUser(data: SigninAsUserInput!): SigninAsUserOutput',
            doc: {
                summary: 'Authenticates as an another user to be able to see the system, as it does',
                description: 'You cannot authenticate for another admin or support or whatever kind of a non-client user',
                errors: ERRORS,
            },
            resolver: async (parent, args, context) => {
                const { data: { id } } = args
                const { keystone } = await getSchemaCtx('User')
                const user = await getItem({ keystone, listKey: 'User', itemId: id, returnFields: 'id isSupport isAdmin' })
                if (!user) {
                    throw new GQLError(ERRORS.USER_NOT_FOUND, context)
                }
                if (user.isAdmin) {
                    throw new GQLError(ERRORS.DENIED_FOR_ADMIN, context)
                }
                if (user.isSupport) {
                    throw new GQLError(ERRORS.DENIED_FOR_SUPPORT, context)
                }
                const sessionToken = await context.startAuthedSession({ item: user, list: keystone.lists['User'] })

                return {
                    user,
                    token: sessionToken,
                }
            },
        },
    ],
    
})

module.exports = {
    SigninAsUserService,
}
