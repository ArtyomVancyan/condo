/**
 * Generated by `createservice acquiring.GeneratePaymentLinkService`
 */
const { isNil } = require('lodash')
const Big = require('big.js')
const dayjs = require('dayjs')

const conf = require('@open-condo/config')
const { ISO_CODES } = require('@condo/domains/common/constants/currencies')
const { DV_VERSION_MISMATCH, WRONG_FORMAT } = require('@condo/domains/common/constants/errors')
const { getById, GQLCustomSchema } = require('@open-condo/keystone/schema')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { checkDvAndSender } = require('@open-condo/keystone/plugins/dvAndSender')

const {
    PAYMENT_LINK_PATH,
    PAYMENT_LINK_QP: {
        acquiringIntegrationContextQp,
        successUrlQp,
        failureUrlQp,
        billingReceiptQp,
        currencyCodeQp,
        amountQp,
        periodQp,
        accountNumberQp,
    },
} = require('@condo/domains/acquiring/constants/links')
const {
    RECEIPTS_ARE_DELETED,
    RECEIPTS_HAVE_NEGATIVE_TO_PAY_VALUE,
    ACQUIRING_INTEGRATION_IS_DELETED,
    CANNOT_FIND_ALL_BILLING_RECEIPTS,
    ACQUIRING_INTEGRATION_CONTEXT_IS_DELETED,
    EMPTY_RECEIPT_AND_RECEIPT_DATA_VALUES,
    RECEIPT_HAVE_INVALID_TO_PAY_VALUE,
    RECEIPT_HAVE_INVALID_CURRENCY_CODE_VALUE,
    RECEIPT_HAVE_INVALID_PAYMENT_MONTH_VALUE,
    RECEIPT_HAVE_INVALID_PAYMENT_YEAR_VALUE,
} = require('@condo/domains/acquiring/constants/errors')
const access = require('@condo/domains/acquiring/access/GeneratePaymentLinkService')

/**
 * List of possible errors, that this custom schema can throw
 * They will be rendered in documentation section in GraphiQL for this custom schema
 */
const ERRORS = {
    DV_VERSION_MISMATCH: {
        mutation: 'generatePaymentLink',
        variable: ['data', 'dv'],
        code: BAD_USER_INPUT,
        type: DV_VERSION_MISMATCH,
        message: 'Wrong value for data version number',
    },
    WRONG_SENDER_FORMAT: {
        mutation: 'generatePaymentLink',
        variable: ['data', 'sender'],
        code: BAD_USER_INPUT,
        type: WRONG_FORMAT,
        message: 'Invalid format of "sender" field value. {details}',
        correctExample: '{ dv: 1, fingerprint: \'example-fingerprint-alphanumeric-value\'}',
    },
    ACQUIRING_INTEGRATION_CONTEXT_IS_DELETED: {
        mutation: 'generatePaymentLink',
        variable: ['data', 'acquiringIntegrationContext', 'id'],
        code: BAD_USER_INPUT,
        type: ACQUIRING_INTEGRATION_CONTEXT_IS_DELETED,
        message: 'Cannot generate payment link with deleted acquiring integration context',
    },
    ACQUIRING_INTEGRATION_IS_DELETED: {
        mutation: 'generatePaymentLink',
        variable: ['data', 'acquiringIntegrationContext', 'id'],
        code: BAD_USER_INPUT,
        type: ACQUIRING_INTEGRATION_IS_DELETED,
        message: 'Cannot generate payment link with deleted acquiring integration with id "{id}"',
    },
    CANNOT_FIND_BILLING_RECEIPT: {
        mutation: 'generatePaymentLink',
        variable: ['data', 'receipt', 'id'],
        code: BAD_USER_INPUT,
        type: CANNOT_FIND_ALL_BILLING_RECEIPTS,
        message: 'Cannot find specified BillingReceipt with id {missingReceiptId}',
    },
    RECEIPT_IS_DELETED: {
        mutation: 'generatePaymentLink',
        variable: ['data', 'receipt', 'id'],
        code: BAD_USER_INPUT,
        type: RECEIPTS_ARE_DELETED,
        message: 'Cannot generate payment link with deleted receipt {id}',
    },
    RECEIPT_HAVE_INVALID_TO_PAY_VALUE: {
        mutation: 'generatePaymentLink',
        code: BAD_USER_INPUT,
        type: RECEIPT_HAVE_INVALID_TO_PAY_VALUE,
        message: 'Cannot generate payment link with invalid "toPay" value',
    },
    RECEIPT_HAVE_NEGATIVE_TO_PAY_VALUE: {
        mutation: 'generatePaymentLink',
        code: BAD_USER_INPUT,
        type: RECEIPTS_HAVE_NEGATIVE_TO_PAY_VALUE,
        message: 'Cannot generate payment link with negative "toPay" value',
    },
    EMPTY_RECEIPT_AND_RECEIPT_DATA_VALUES: {
        mutation: 'generatePaymentLink',
        code: BAD_USER_INPUT,
        type: EMPTY_RECEIPT_AND_RECEIPT_DATA_VALUES,
        message: 'Cannot generate payment link with empty "receipt" and "receiptData" fields',
    },
    RECEIPT_HAVE_INVALID_CURRENCY_CODE_VALUE: {
        mutation: 'generatePaymentLink',
        variable: ['data', 'receiptData', 'currencyCode'],
        code: BAD_USER_INPUT,
        type: RECEIPT_HAVE_INVALID_CURRENCY_CODE_VALUE,
        message: 'Cannot generate payment link with invalid "currencyCode" value',
    },
    RECEIPT_HAVE_INVALID_PAYMENT_MONTH_VALUE: {
        mutation: 'generatePaymentLink',
        variable: ['data', 'receiptData', 'paymentMonth'],
        code: BAD_USER_INPUT,
        type: RECEIPT_HAVE_INVALID_PAYMENT_MONTH_VALUE,
        message: 'Cannot generate payment link with invalid "paymentMonth" value',
    },
    RECEIPT_HAVE_INVALID_PAYMENT_YEAR_VALUE: {
        mutation: 'generatePaymentLink',
        variable: ['data', 'receiptData', 'paymentYear'],
        code: BAD_USER_INPUT,
        type: RECEIPT_HAVE_INVALID_PAYMENT_YEAR_VALUE,
        message: 'Cannot generate payment link with invalid "paymentYear" value',
    },
}

const GeneratePaymentLinkService = new GQLCustomSchema('GeneratePaymentLinkService', {
    types: [
        {
            access: true,
            type: 'input GeneratePaymentLinkCallbacksInput { successUrl: String!, failureUrl: String! }',
        },
        {
            access: true,
            type: 'input GeneratePaymentLinkReceiptDataInput { currencyCode: String!, amount: String!, periodYear: Int!, periodMonth: Int!, accountNumber: String! }',
        },
        {
            access: true,
            type: 'input GeneratePaymentLinkInput { dv: Int!, sender: SenderFieldInput!, receipt: BillingReceiptWhereUniqueInput, receiptData: GeneratePaymentLinkReceiptDataInput, acquiringIntegrationContext: AcquiringIntegrationContextWhereUniqueInput!, callbacks: GeneratePaymentLinkCallbacksInput! }',
        },
        {
            access: true,
            type: 'type GeneratePaymentLinkOutput { dv: Int!, paymentUrl: String! }',
        },
    ],

    queries: [
        {
            access: access.canGeneratePaymentLink,
            schema: 'generatePaymentLink(data: GeneratePaymentLinkInput!): GeneratePaymentLinkOutput',
            resolver: async (parent, args, context) => {
                // wrap validator function to the current call context
                const { data } = args
                const {
                    receipt,
                    receiptData,
                    acquiringIntegrationContext,
                    callbacks: { successUrl, failureUrl },
                } = data

                // Stage 0: Check if sender input is valid
                checkDvAndSender(data, ERRORS.DV_VERSION_MISMATCH, ERRORS.WRONG_SENDER_FORMAT, context)

                // Stage 1: get acquiring context & integration
                const acquiringContext = await getById('AcquiringIntegrationContext', acquiringIntegrationContext.id)

                if (acquiringContext.deletedAt) {
                    throw new GQLError(ERRORS.ACQUIRING_INTEGRATION_CONTEXT_IS_DELETED, context)
                }

                // Stage 2: generate links
                // two cases expected here
                // first one: receipt.id was provided - a regular payment flow expected
                // second one: receipt.id is empty, but receiptData are provided - a virtual receipt payment flow expected
                const paymentLinkBaseUrl = new URL(`${conf.SERVER_URL}${PAYMENT_LINK_PATH}`)

                // set common QP
                paymentLinkBaseUrl.searchParams.set(acquiringIntegrationContextQp, acquiringIntegrationContext.id)
                paymentLinkBaseUrl.searchParams.set(successUrlQp, successUrl)
                paymentLinkBaseUrl.searchParams.set(failureUrlQp, failureUrl)

                // set payment flow specific QP
                // a regular payment flow
                if (!isNil(receipt)) {
                    // Stage 2.1: Check BillingReceipts
                    const billingReceipt = await getById('BillingReceipt', receipt.id)

                    if (isNil(billingReceipt)) {
                        throw new GQLError({
                            ...ERRORS.CANNOT_FIND_BILLING_RECEIPT,
                            messageInterpolation: { missingReceiptId: receipt.id },
                        }, context)
                    }

                    if (billingReceipt.deletedAt) {
                        throw new GQLError({
                            ...ERRORS.RECEIPT_IS_DELETED,
                            messageInterpolation: { id: billingReceipt.id },
                        }, context)
                    }

                    // negative to pay value
                    if (Big(billingReceipt.toPay).lte(0)) {
                        throw new GQLError({
                            ...ERRORS.RECEIPT_HAVE_NEGATIVE_TO_PAY_VALUE,
                            messageInterpolation: { id: billingReceipt.id },
                        }, context)
                    }

                    paymentLinkBaseUrl.searchParams.set(billingReceiptQp, billingReceipt.id)
                } else if (!isNil(receiptData)) {
                    // Stage 2.1: check receipt data
                    const { currencyCode, amount, periodYear, periodMonth, accountNumber } = receiptData

                    // amount is not a number
                    if (isNaN(amount)) {
                        throw new GQLError({
                            ...ERRORS.RECEIPT_HAVE_INVALID_TO_PAY_VALUE,
                        }, context)
                    }

                    // negative to pay value
                    if (Big(amount).lte(0)) {
                        throw new GQLError({
                            ...ERRORS.RECEIPT_HAVE_NEGATIVE_TO_PAY_VALUE,
                        }, context)
                    }

                    // invalid currency code
                    if (!ISO_CODES.includes(currencyCode)) {
                        throw new GQLError({
                            ...ERRORS.RECEIPT_HAVE_INVALID_CURRENCY_CODE_VALUE,
                        }, context)
                    }

                    // invalid year
                    if (periodYear < 2000 || periodYear > new Date().getFullYear()) {
                        throw new GQLError({
                            ...ERRORS.RECEIPT_HAVE_INVALID_PAYMENT_YEAR_VALUE,
                        }, context)
                    }

                    // invalid month
                    if (periodMonth < 1 || periodMonth > 12) {
                        throw new GQLError({
                            ...ERRORS.RECEIPT_HAVE_INVALID_PAYMENT_MONTH_VALUE,
                        }, context)
                    }

                    // assemble period string representation
                    // periodMonth - 1 since Date objects expects that month number start from 0
                    const periodDate = new Date(periodYear, periodMonth - 1, 1)
                    const period = dayjs(periodDate).format('YYYY-MM-DD')

                    paymentLinkBaseUrl.searchParams.set(currencyCodeQp, currencyCode)
                    paymentLinkBaseUrl.searchParams.set(amountQp, amount)
                    paymentLinkBaseUrl.searchParams.set(periodQp, period)
                    paymentLinkBaseUrl.searchParams.set(accountNumberQp, accountNumber)
                } else {
                    throw new GQLError({ ...ERRORS.EMPTY_RECEIPT_AND_RECEIPT_DATA_VALUES }, context)
                }

                return {
                    dv: 1,
                    paymentUrl: paymentLinkBaseUrl.toString(),
                }
            },
        },
    ],

})

module.exports = {
    GeneratePaymentLinkService,
}
