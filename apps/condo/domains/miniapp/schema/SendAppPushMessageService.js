/**
 * Generated by `createservice miniapp.SendAppPushMessageService --type mutations`
 */

const { GQLError, GQLErrorCode: { BAD_USER_INPUT, FORBIDDEN } } = require('@open-condo/keystone/errors')
const { checkDvAndSender } = require('@open-condo/keystone/plugins/dvAndSender')
const { GQLCustomSchema } = require('@open-condo/keystone/schema')

const { WRONG_FORMAT, DV_VERSION_MISMATCH } = require('@condo/domains/common/constants/errors')
const access = require('@condo/domains/miniapp/access/SendAppPushMessageService')
const { MessageAppBlackList } = require('@condo/domains/miniapp/utils/serverSchema')
const { B2CApp } = require('@condo/domains/miniapp/utils/serverSchema')
const { VOIP_INCOMING_CALL_MESSAGE_TYPE, B2C_APP_MESSAGE_PUSH_TYPE } = require('@condo/domains/notification/constants/constants')
const { sendMessage } = require('@condo/domains/notification/utils/serverSchema')
const { User } = require('@condo/domains/user/utils/serverSchema')
const { RedisGuard } = require('@condo/domains/user/utils/serverSchema/guards')

const { USER_NOT_FOUND_ERROR, APP_NOT_FOUND_ERROR, APP_BLACK_LIST_ERROR } = require('../constants')

const CACHE_TTL = {
    DEFAULT: 3600,
    VOIP_INCOMING_CALL_MESSAGE: 2,
    B2C_APP_MESSAGE_PUSH: 3600,
}

//TODO(Kekmus) Better to use existing redisGuard if possible
const redisGuard = new RedisGuard()

const ERRORS = {
    USER_NOT_FOUND: {
        mutation: 'sendAppPushMessage',
        code: BAD_USER_INPUT,
        type: USER_NOT_FOUND_ERROR,
        message: 'Unable to find user by provided id.',
    },
    APP_NOT_FOUND: {
        mutation: 'sendAppPushMessage',
        code: BAD_USER_INPUT,
        type: APP_NOT_FOUND_ERROR,
        message: 'Unable to find app by provided id.',
    },
    DV_VERSION_MISMATCH: {
        mutation: 'sendAppPushMessage',
        variable: ['data', 'dv'],
        code: BAD_USER_INPUT,
        type: DV_VERSION_MISMATCH,
        message: 'Wrong value for data version number',
    },
    WRONG_SENDER_FORMAT: {
        mutation: 'sendAppPushMessage',
        variable: ['data', 'sender'],
        code: BAD_USER_INPUT,
        type: WRONG_FORMAT,
        message: 'Invalid format of "sender" field value. {details}',
        correctExample: '{ dv: 1, fingerprint: \'example-fingerprint-alphanumeric-value\'}',
    },
    APP_IN_BLACK_LIST: {
        mutation: 'sendAppPushMessage',
        code: FORBIDDEN,
        type: APP_BLACK_LIST_ERROR,
        message: 'Notification not send because app of message added in MessageAppBlackList',
    },
}

const SendAppPushMessageService = new GQLCustomSchema('SendAppPushMessageService', {
    types: [
        {
            access: true,
            type: `enum SendAppPushMessageType { ${VOIP_INCOMING_CALL_MESSAGE_TYPE} ${B2C_APP_MESSAGE_PUSH_TYPE} }`,
        },
        {
            access: true,
            type: 'input SendAppPushMessageData { body: String!, title: String, B2CAppContext: String }',
        },
        {
            access: true,
            type: 'input SendAppPushMessageInput { dv: Int!, sender: SenderFieldInput!, app: B2CAppWhereUniqueInput!, user: UserWhereUniqueInput!, type: SendAppPushMessageType!, data: SendAppPushMessageData! }',
        },
        {
            access: true,
            type: 'type SendAppPushMessageOutput { id: String!, status: String! }',
        },
    ],
    
    mutations: [
        {
            access: access.canSendAppPushMessage,
            schema: 'sendAppPushMessage(data: SendAppPushMessageInput!): SendAppPushMessageOutput',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { data: argsData } = args
                const { dv, sender, app, user, type, data, uniqKey, B2CAppContext } = argsData

                checkDvAndSender(argsData, ERRORS.DV_VERSION_MISMATCH, ERRORS.WRONG_SENDER_FORMAT, context)

                const userExisted = await User.getOne(context, { id: user.id, deletedAt: null })
                if (!userExisted) {
                    throw new GQLError(ERRORS.USER_NOT_FOUND, context)
                }

                const appExisted = await B2CApp.getOne(context, { id: app.id, deletedAt: null })
                if (!appExisted) {
                    throw new GQLError(ERRORS.APP_NOT_FOUND, context)
                }
                const B2CAppName = appExisted.name

                const appInBlacklsit = await MessageAppBlackList.getOne(context, { app: { id: app.id }, type: type, deletedAt: null })
                if (appInBlacklsit) {
                    throw new GQLError(ERRORS.APP_IN_BLACK_LIST, context)
                }

                const searchKey = `${type}_${app.id}_${user.id}`
                await redisGuard.checkLock(searchKey, 'sendpush', context)

                const ttl = CACHE_TTL[type] || CACHE_TTL['DEFAULT']
                await redisGuard.lock(searchKey, 'sendpush', ttl)

                const messageAttrs = {
                    uniqKey,
                    sender,
                    type,
                    to: {
                        user: user,
                    },
                    meta: {
                        dv,
                        title: data.title,
                        body: data.body,
                        data: {
                            B2CAppContext,
                            B2CAppName,
                            B2CAppId: app,
                        },
                    },
                }

                const sendingResult = await sendMessage(context, messageAttrs)

                return {
                    id: sendingResult.id,
                    status: sendingResult.status,
                }
            },
        },
    ],
    
})

module.exports = {
    SendAppPushMessageService,
}