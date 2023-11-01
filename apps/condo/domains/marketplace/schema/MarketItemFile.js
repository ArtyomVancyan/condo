/**
 * Generated by `createschema marketplace.MarketItemFile 'marketItem:Relationship:MarketItem:CASCADE; file:File;'`
 */

const get = require('lodash/get')

const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const FileAdapter = require('@condo/domains/common/utils/fileAdapter')
const { getFileMetaAfterChange } = require('@condo/domains/common/utils/fileAdapter')
const access = require('@condo/domains/marketplace/access/MarketItemFile')


const MARKET_ITEM_FILE_FOLDER_NAME = 'marketitemfile'
const Adapter = new FileAdapter(MARKET_ITEM_FILE_FOLDER_NAME)
const fileMetaAfterChange = getFileMetaAfterChange(Adapter)
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/heic',
]
const ERRORS = {
    FORBIDDEN_FILE_TYPE: (mimeType) => ({
        code: BAD_USER_INPUT,
        type: 'FORBIDDEN_FILE_TYPE',
        message: `Expected file to be one of the following mimetypes: ${ALLOWED_MIME_TYPES.map(type => `"${type}"`).join(', ')}. But got: ${mimeType}`,
    }),
}

const MarketItemFile = new GQLListSchema('MarketItemFile', {
    schemaDoc: 'Image file attached to the market item',
    fields: {

        marketItem: {
            schemaDoc: 'Link to MarketItem',
            type: 'Relationship',
            ref: 'MarketItem',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        file: {
            schemaDoc: 'File object with meta information and publicUrl',
            type: 'File',
            adapter: Adapter,
            isRequired: true,
            hooks: {
                validateInput: ({ resolvedData, fieldPath, context }) => {
                    const mimetype = get(resolvedData, [fieldPath, 'mimetype'])
                    if (!ALLOWED_MIME_TYPES.includes(mimetype)) throw new GQLError(ERRORS.FORBIDDEN_FILE_TYPE(mimetype), context)
                },
            },
        },

    },
    hooks: {
        afterChange: fileMetaAfterChange,
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadMarketItemFiles,
        create: access.canManageMarketItemFiles,
        update: access.canManageMarketItemFiles,
        delete: false,
        auth: true,
    },
})

module.exports = {
    MarketItemFile,
}