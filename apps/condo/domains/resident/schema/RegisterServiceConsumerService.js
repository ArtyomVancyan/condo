/**
 * Generated by `createservice resident.RegisterServiceConsumerService --type mutations`
 */

const { AcquiringIntegrationContext } = require('@condo/domains/acquiring/utils/serverSchema')
const { getById, GQLCustomSchema } = require('@condo/keystone/schema')
const access = require('@condo/domains/resident/access/RegisterServiceConsumerService')
const { BillingIntegrationOrganizationContext, BillingAccount } = require('@condo/domains/billing/utils/serverSchema')
const { ServiceConsumer, Resident } = require('../utils/serverSchema')
const { Meter } = require('@condo/domains/meter/utils/serverSchema')
const { Organization } = require('@condo/domains/organization/utils/serverSchema')
const get = require('lodash/get')
const omit = require('lodash/omit')

const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@condo/keystone/errors')
const { NOT_FOUND } = require('@condo/domains/common/constants/errors')
const { WRONG_FORMAT } = require('../../common/constants/errors')

const errors = {
    RESIDENT_NOT_FOUND: {
        mutation: 'registerServiceConsumer',
        variable: ['data', 'residentId'],
        code: BAD_USER_INPUT,
        type: NOT_FOUND,
        message: 'Cannot find Resident for current user',
    },
    ORGANIZATION_NOT_FOUND: {
        mutation: 'registerServiceConsumer',
        variable: ['data', 'organizationId'],
        code: BAD_USER_INPUT,
        type: NOT_FOUND,
        message: 'Cannot find Organization for current user',
    },
    BILLING_ACCOUNT_NOT_FOUND: {
        mutation: 'registerServiceConsumer',
        variable: ['data', 'accountNumber'],
        code: BAD_USER_INPUT,
        type: NOT_FOUND,
        message: 'Can\'t find billingAccount and any meters with this accountNumber, unitName and organization combination',
    },
    ACCOUNT_NUMBER_IS_NOT_SPECIFIED: {
        mutation: 'registerServiceConsumer',
        variable: ['data', 'accountNumber'],
        code: BAD_USER_INPUT,
        type: WRONG_FORMAT,
        message: 'Argument "accountNumber" is null or empty',
    },
}

const RegisterServiceConsumerService = new GQLCustomSchema('RegisterServiceConsumerService', {
    types: [
        {
            access: true,
            // TODO(pahaz): DOMA-4138 remove this legacy!
            type: 'input RegisterServiceConsumerInputExtra { paymentCategory: String }',
        },
        {
            access: true,
            // TODO(pahaz): DOMA-4150 remove residentId and organizationId and migrate to ResidentWhereUniqueInput and OrganizationWhereUniqueInput
            type: 'input RegisterServiceConsumerInput { dv: Int!, sender: SenderFieldInput!, residentId: ID!, accountNumber: String!, organizationId: ID!, extra: RegisterServiceConsumerInputExtra }',
        },
    ],

    mutations: [
        {
            doc: {
                summary: 'Creates service consumer with default data, and automatically populates the optional data fields, such as `billingAccount',
                description: 'To be successfully created accountNumber and unitName should at least have billingAccount with same data or Meter with same data',
                errors,
            },
            access: access.canRegisterServiceConsumer,
            schema: 'registerServiceConsumer(data: RegisterServiceConsumerInput!): ServiceConsumer',
            resolver: async (parent, args, context = {}) => {
                const { data: { dv, sender, residentId, accountNumber, organizationId, extra } } = args

                if (!accountNumber || accountNumber.length === 0) { throw new GQLError(errors.ACCOUNT_NUMBER_IS_NOT_SPECIFIED, context) }

                const [ resident ] = await Resident.getAll(context, { id: residentId })
                if (!resident) {
                    throw new GQLError(errors.RESIDENT_NOT_FOUND, context)
                }

                const [ organization ] = await Organization.getAll(context, { id: organizationId })
                if (!organization) {
                    throw new GQLError(errors.ORGANIZATION_NOT_FOUND, context)
                }

                const unitName = get(resident, 'unitName', null)

                const paymentCategory = get(extra, 'paymentCategory', null)

                const attrs = {
                    dv,
                    sender,
                    resident: { connect: { id: residentId } },
                    accountNumber: accountNumber,
                    organization: { connect: { id: organization.id } },
                    paymentCategory: paymentCategory,
                }

                const [ billingIntegrationContext ] = await BillingIntegrationOrganizationContext.getAll(context, { organization: { id: organization.id, deletedAt: null }, deletedAt: null })
                if (billingIntegrationContext) {
                    const [acquiringIntegrationContext] = await AcquiringIntegrationContext.getAll(context, { organization: { id: organization.id, deletedAt: null }, deletedAt: null })
                    const [billingAccount] = await BillingAccount.getAll(context,
                        {
                            context: { id: billingIntegrationContext.id },
                            unitName: unitName,
                            number_i: accountNumber,
                        }
                    )
                    // This is deprecated. These fields are not going to be set in future releases!
                    attrs.billingAccount = billingAccount ? { connect: { id: billingAccount.id } } : null
                    attrs.billingIntegrationContext = billingAccount ? { connect: { id: billingIntegrationContext.id } } : null
                    attrs.acquiringIntegrationContext = billingAccount && acquiringIntegrationContext ? { connect: { id: acquiringIntegrationContext.id } } : null
                }
                if (!attrs.billingAccount) {
                    const meters = await Meter.getAll(context, { accountNumber: accountNumber, unitName: unitName, organization: { id: organizationId, deletedAt: null }, deletedAt: null })
                    if (meters.length < 1) {
                        throw new GQLError(errors.BILLING_ACCOUNT_NOT_FOUND, context)
                    }
                }

                const [existingServiceConsumer] = await ServiceConsumer.getAll(context, {
                    resident: { id: residentId },
                    accountNumber: accountNumber,
                })

                let id
                if (existingServiceConsumer) {
                    await ServiceConsumer.update(context, existingServiceConsumer.id, {
                        // We don't update organization!
                        ...omit(attrs, 'organization'),
                        deletedAt: null,
                    })
                    id = existingServiceConsumer.id
                } else {
                    const serviceConsumer = await ServiceConsumer.create(context, attrs)
                    id = serviceConsumer.id
                }

                // Hack that helps to resolve all subfields in result of this mutation
                return await getById('ServiceConsumer', id)
            },
        },
    ],
})

module.exports = {
    RegisterServiceConsumerService,
}
