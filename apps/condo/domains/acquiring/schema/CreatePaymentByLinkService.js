/**
 * Generated by `createservice acquiring.CreatePaymentByLinkService`
 */

const Big = require('big.js')
const { get, isNil } = require('lodash')

const { createInstance } = require('@open-condo/clients/address-service-client')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { GQLCustomSchema, getById } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/acquiring/access/CreatePaymentByLinkService')
const { CONTEXT_FINISHED_STATUS: ACQUIRING_CONTEXT_FINISHED_STATUS } = require('@condo/domains/acquiring/constants/context')
const { PAYMENT_DONE_STATUS, PAYMENT_WITHDRAWN_STATUS } = require('@condo/domains/acquiring/constants/payment')
const {
    registerMultiPaymentForOneReceipt,
    registerMultiPaymentForVirtualReceipt,
    MultiPayment,
} = require('@condo/domains/acquiring/utils/serverSchema')
const { AcquiringIntegrationContext } = require('@condo/domains/acquiring/utils/serverSchema')
const { Payment } = require('@condo/domains/acquiring/utils/serverSchema')
const {
    validateQRCode,
    BillingReceipt,
    BillingIntegrationOrganizationContext,
    BillingRecipient,
} = require('@condo/domains/billing/utils/serverSchema')
const { ALREADY_EXISTS_ERROR, WRONG_FORMAT } = require('@condo/domains/common/constants/errors')
const { CONTEXT_FINISHED_STATUS } = require('@condo/domains/miniapp/constants')
const { Property } = require('@condo/domains/property/utils/serverSchema')

/**
 * List of possible errors, that this custom schema can throw
 * They will be rendered in documentation section in GraphiQL for this custom schema
 */
const ERRORS = {
    ADDRESS_IS_INVALID: {
        mutation: 'createPaymentByLink',
        code: BAD_USER_INPUT,
        type: WRONG_FORMAT,
        message: 'The provided address is invalid',
    },
    BANK_ACCOUNT_IS_INVALID: {
        mutation: 'createPaymentByLink',
        code: BAD_USER_INPUT,
        type: WRONG_FORMAT,
        message: 'Provided bank account is not in the system',
    },
    RECEIPT_ALREADY_PAID: {
        mutation: 'createPaymentByLink',
        code: BAD_USER_INPUT,
        type: ALREADY_EXISTS_ERROR,
        message: 'Provided receipt already paid',
        messageForUser: 'api.billing.error.alreadyPaid',
    },
}

const validateReceiptDuplicates = async (context, accountNumber, period, organizationIds, recipientBankAccount) => {
    // check if receipt already paid
    // at this point no mater if receipt was paid as a virtual one or by billing receipt
    // since all of them must have enough information about payment destination

    // let's request payments that have specific statuses and receipt params
    // and decide if we are going to make a duplicate
    const payments = await Payment.getAll(context, {
        accountNumber,
        period,
        organization: { id_in: organizationIds },
        status_in: [PAYMENT_DONE_STATUS, PAYMENT_WITHDRAWN_STATUS],
        recipientBankAccount,
        deletedAt: null,
    })

    if (payments.length > 0) {
        throw new GQLError(ERRORS.RECEIPT_ALREADY_PAID, context)
    }
}

const CreatePaymentByLinkService = new GQLCustomSchema('CreatePaymentByLinkService', {
    types: [
        {
            access: true,
            type: 'input CreatePaymentByLinkInput { dv: Int!, sender: SenderFieldInput!, qrCode: String! }',
        },
        {
            access: true,
            type: 'type CreatePaymentByLinkOutput { multiPaymentId: ID!, amount: String!, explicitFee: String!, totalAmount: String!, address: String!, addressMeta: AddressMetaField!, unitType: String!, unitName: String!, accountNumber: String!, period: String! }',
        },
    ],

    mutations: [
        {
            access: access.canCreatePaymentByLink,
            schema: 'createPaymentByLink(data: CreatePaymentByLinkInput!): CreatePaymentByLinkOutput',
            resolver: async (parent, args, context) => {
                // TODO(DOMA-7078) Must be modified within 7078

                const { data: { dv, sender, qrCode } } = args

                // Stage 0: validate QR code
                const validationResult = await validateQRCode(context, { dv, sender, qrCode })

                const {
                    qrCodeFields: {
                        PersonalAcc, // organization's bank account
                        BIC,
                        PayerAddress,
                        PaymPeriod, // mm.yyyy
                        Sum,
                        PayeeINN,
                        PersAcc, // resident's account within organization
                    },
                } = validationResult
                const period = `${PaymPeriod.split('.')[1]}-${PaymPeriod.split('.')[0]}-01`
                const amount = String(Big(Sum).div(100))

                // Stage 1: normalize address
                const addressServiceClient = createInstance({ address: PayerAddress })
                const normalizedAddress = await addressServiceClient.search(PayerAddress, { extractUnit: true })

                if (!normalizedAddress.addressKey) throw new GQLError(ERRORS.ADDRESS_IS_INVALID, context)

                // Stage 2: find properties
                const properties = await Property.getAll(context, {
                    organization: { tin: PayeeINN },
                    OR: [
                        { address: normalizedAddress.address },
                        { addressKey: normalizedAddress.addressKey },
                    ],
                    deletedAt: null,
                })

                const organizationsIds = properties.map((item) => item.organization.id)

                // Stage 3: find organizations with valid contexts and make contexts map
                const billingContexts = await BillingIntegrationOrganizationContext.getAll(context, {
                    organization: { id_in: organizationsIds, deletedAt: null },
                    status: CONTEXT_FINISHED_STATUS,
                    deletedAt: null,
                })

                const acquiringContexts = await AcquiringIntegrationContext.getAll(context, {
                    organization: { id_in: organizationsIds, deletedAt: null },
                    status: ACQUIRING_CONTEXT_FINISHED_STATUS,
                    deletedAt: null,
                })

                /**
                 * Map billingContextId to acquiringContextId
                 * @type {Object<string, string>}
                 * */
                const contextsMap = {}
                for (const billingContext of billingContexts) {
                    const orgId = get(billingContext, ['organization', 'id'])
                    for (const acquiringContext of acquiringContexts) {
                        if (orgId === get(acquiringContext, ['organization', 'id'])) {
                            contextsMap[billingContext.id] = acquiringContext.id
                        }
                    }
                }

                // Stage 4: make sure PersonalAccount is in our system
                /** @type {BillingRecipient[]} */
                const billingRecipients = await BillingRecipient.getAll(context, {
                    context: { id_in: billingContexts.map((context) => context.id), deletedAt: null },
                    bankAccount: PersonalAcc,
                    deletedAt: null,
                })

                if (billingRecipients.length === 0) throw new GQLError(ERRORS.BANK_ACCOUNT_IS_INVALID, context)

                // Stage 5: find the last BillingReceipt we have
                const [lastBillingReceipt] = await BillingReceipt.getAll(context, {
                    account: { number: PersAcc, deletedAt: null },
                    receiver: { bankAccount: PersonalAcc, deletedAt: null },
                    deletedAt: null,
                }, {
                    sortBy: ['period_DESC'],
                    first: 1,
                })

                let multiPaymentId
                if (isNil(lastBillingReceipt)) {
                    // No receipts found at our side - let's create a virtual one
                    await validateReceiptDuplicates(context, PersAcc, period, organizationsIds, PersonalAcc)
                    const { multiPaymentId: id } = await registerMultiPaymentForVirtualReceipt(context, {
                        dv, sender,
                        receipt: {
                            currencyCode: get(billingContexts, [0, 'integration', 'currencyCode']),
                            amount,
                            period,
                            recipient: {
                                routingNumber: BIC,
                                bankAccount: PersonalAcc,
                                accountNumber: PersAcc,
                            },
                        },
                        acquiringIntegrationContext: {
                            id: acquiringContexts[0].id,
                        },
                    })

                    multiPaymentId = id
                } else if (lastBillingReceipt.period === period) {
                    // if period matches we use found receipt to create MultiPayment
                    await validateReceiptDuplicates(context, PersAcc, lastBillingReceipt.period, organizationsIds, PersonalAcc)
                    const { multiPaymentId: id } = await registerMultiPaymentForOneReceipt(context, {
                        dv, sender,
                        receipt: { id: lastBillingReceipt.id },
                        acquiringIntegrationContext: { id: contextsMap[get(lastBillingReceipt, ['context', 'id'])] },
                    })
                    multiPaymentId = id
                } else if (lastBillingReceipt.period > period) {
                    // we have a newer receipt at our side - let's pay for newer one
                    await validateReceiptDuplicates(context, PersAcc, lastBillingReceipt.period, organizationsIds, PersonalAcc)
                    const { multiPaymentId: id } = await registerMultiPaymentForOneReceipt(context, {
                        dv, sender,
                        receipt: { id: lastBillingReceipt.id },
                        acquiringIntegrationContext: { id: contextsMap[get(lastBillingReceipt, ['context', 'id'])] },
                    })
                    multiPaymentId = id
                } else {
                    // the last receipt is older than the scanned one - let's create a virtual one to follow scanned one
                    await validateReceiptDuplicates(context, PersAcc, period, organizationsIds, PersonalAcc)

                    // find acquiring context and routing number from older receipt
                    const billingIntegrationContext = await getById('BillingIntegrationOrganizationContext', lastBillingReceipt.context.id)
                    /** @type {AcquiringIntegrationContext[]} */
                    const acquiringContexts = await AcquiringIntegrationContext.getAll(context, {
                        organization: { id: billingIntegrationContext.organization, deletedAt: null },
                        status: ACQUIRING_CONTEXT_FINISHED_STATUS,
                        deletedAt: null,
                    })

                    const { multiPaymentId: id } = await registerMultiPaymentForVirtualReceipt(context, {
                        dv, sender,
                        receipt: {
                            currencyCode: get(billingContexts, [0, 'integration', 'currencyCode']),
                            amount,
                            period,
                            recipient: {
                                routingNumber: billingRecipients[0].bic,
                                bankAccount: PersonalAcc,
                                accountNumber: PersAcc,
                            },
                        },
                        acquiringIntegrationContext: {
                            id: acquiringContexts[0].id,
                        },
                    })

                    multiPaymentId = id
                }

                const multiPayment = await MultiPayment.getOne(context, { id: multiPaymentId })

                return {
                    multiPaymentId,
                    amount: multiPayment.amountWithoutExplicitFee,
                    explicitFee: multiPayment.explicitServiceCharge,
                    totalAmount: multiPayment.amount,
                    address: normalizedAddress.address,
                    addressMeta: {
                        dv: 1,
                        value: get(normalizedAddress, ['addressMeta', 'value'], ''),
                        unrestricted_value: get(normalizedAddress, ['addressMeta', 'unrestricted_value'], ''),
                        data: get(normalizedAddress, ['addressMeta', 'data'], null),
                    },
                    unitType: get(normalizedAddress, 'unitType'),
                    unitName: get(normalizedAddress, 'unitName'),
                    accountNumber: PersAcc,
                    period,
                }
            },
        },
    ],
})

module.exports = {
    CreatePaymentByLinkService,
}
