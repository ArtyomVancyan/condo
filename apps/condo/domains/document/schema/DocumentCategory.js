/**
 * Generated by `createschema document.DocumentCategory 'name:Text;'`
 */
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/document/access/DocumentCategory')


const DocumentCategory = new GQLListSchema('DocumentCategory', {
    schemaDoc: 'Document category, for example, cleaning acts, works performed, design or technical documentation and other categories',
    fields: {
        name: {
            schemaDoc: 'Name of the category',
            type: 'LocalizedText',
            isRequired: true,
            template: 'document.category.*.name',
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadDocumentCategories,
        create: access.canManageDocumentCategories,
        update: access.canManageDocumentCategories,
        delete: false,
        auth: true,
    },
})

module.exports = {
    DocumentCategory,
}
