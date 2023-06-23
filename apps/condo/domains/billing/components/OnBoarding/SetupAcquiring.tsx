import { Col, Row } from 'antd'
import get from 'lodash/get'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect } from 'react'

import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'
import { Typography, Space } from '@open-condo/ui'

import { AcquiringIntegrationContext as AcquiringContext, AcquiringIntegration } from '@condo/domains/acquiring/utils/clientSchema'
import { BillingIntegrationOrganizationContext as BillingContext } from '@condo/domains/billing/utils/clientSchema'
import { LoginWithSBBOLButton } from '@condo/domains/common/components/Button'
import { Loader } from '@condo/domains/common/components/Loader'
import { extractOrigin } from '@condo/domains/common/utils/url.utils'
import { IFrame } from '@condo/domains/miniapp/components/IFrame'
import { CONTEXT_FINISHED_STATUS, CONTEXT_IN_PROGRESS_STATUS } from '@condo/domains/miniapp/constants'
import { SBBOL_IMPORT_NAME } from '@condo/domains/organization/integrations/sbbol/constants'


import type{ RowProps } from 'antd'

type SetupAcquiringProps = {
    onFinish: () => void
}

const AUTH_BUTTON_GUTTER: RowProps['gutter'] = [0, 40]
const AUTH_TITLE_SPACE = 12
const PARAGRAPH_SPACE = 16
const FULL_COL_SPAN = 24
const CERTIFICATES_INFO_LINK = 'https://help.doma.ai/article/262-minc'
const CONNECT_EMAIL = 'sales@doma.ai'

export const SetupAcquiring: React.FC<SetupAcquiringProps> = ({ onFinish }) => {
    const intl = useIntl()
    const AuthRequiredTitle = intl.formatMessage({ id: 'accrualsAndPayments.setup.verificationNeeded.title' })
    const AuthRequiredLink = intl.formatMessage({ id: 'accrualsAndPayments.setup.verificationNeeded.link' })
    const AuthRequiredCertMessage = intl.formatMessage({ id: 'accrualsAndPayments.setup.verificationNeeded.message.certs' }, {
        link: <Typography.Link href={CERTIFICATES_INFO_LINK} target='_blank'>{AuthRequiredLink}</Typography.Link>,
    })
    const AuthRequiredContactMessage = intl.formatMessage({ id: 'accrualsAndPayments.setup.verificationNeeded.message.contact' }, {
        email: <Typography.Link href={`mailto:${CONNECT_EMAIL}`}>{CONNECT_EMAIL}</Typography.Link>,
    })

    const router = useRouter()
    const { organization } = useOrganization()
    const orgId = get(organization, 'id', null)
    const remoteSystem = get(organization, 'importRemoteSystem', null)
    const isOrgVerified = remoteSystem === SBBOL_IMPORT_NAME

    const createAction = AcquiringContext.useCreate({
        status: CONTEXT_IN_PROGRESS_STATUS,
        settings: { dv: 1 },
        state: { dv: 1 },
    })
    const updateAction = AcquiringContext.useUpdate({
        status: CONTEXT_FINISHED_STATUS,
    })

    const { obj: billingCtx, loading: billingCtxLoading, error: billingCtxError } = BillingContext.useObject({
        where: {
            status: CONTEXT_FINISHED_STATUS,
            organization: { id: orgId },
        },
    })

    // NOTE: On practice there's only 1 acquiring and there's no plans to change it soon
    const { objs: acquiring, loading: acquiringLoading, error: acquiringError } = AcquiringIntegration.useObjects({
        where: {
            isHidden: false,
            setupUrl_not: null,
        },
    })

    const acquiringId = get(acquiring, ['0', 'id'], null)

    const { obj: acquiringCtx, loading: acquiringCtxLoading, error: acquiringCtxError, refetch: refetchCtx } = AcquiringContext.useObject({
        where: {
            integration: { id: acquiringId },
            organization: { id: orgId },
        },
    })



    const billingCtxId = get(billingCtx, 'id', null)
    const acquiringCtxId = get(acquiringCtx, 'id', null)

    // No connected billing = go to setup beginning
    useEffect(() => {
        if (!billingCtxLoading && !billingCtxError && !billingCtxId) {
            router.replace({ query: { step: 0 } })
        }
    }, [billingCtxLoading, billingCtxError, billingCtxId, router])

    // If no context for selected acquiring and correct organization => need to create it and re-fetch
    useEffect(() => {
        if ((!acquiringLoading && !acquiringError) &&
            (!acquiringCtxLoading && !acquiringCtxError) &&
            (acquiringId && orgId && !acquiringCtxId) &&
            isOrgVerified) {
            createAction({
                organization: { connect: { id: orgId } },
                integration: { connect: { id: acquiringId } },
            }).then(() => {
                refetchCtx()
            })
        }
        // NOTE: Does not include createAction and refetch in deps,
        // since it will trigger createContext twice and useObject will be broken :)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        acquiringLoading,
        acquiringError,
        acquiringCtxLoading,
        acquiringCtxError,
        acquiringId,
        acquiringCtxId,
        orgId,
    ])

    const setupUrl = get(acquiringCtx, ['integration', 'setupUrl'], '')
    const setupOrigin = extractOrigin(setupUrl)

    const handleDoneMessage = useCallback((event: MessageEvent) => {
        if (event.origin === setupOrigin && get(event.data, 'success') === true) {
            updateAction({}, { id: acquiringCtxId })
                .then(() => {
                    onFinish()
                })
        }
    }, [acquiringCtxId, setupOrigin, updateAction, onFinish])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('message', handleDoneMessage)

            return () => window.removeEventListener('message', handleDoneMessage)
        }
    }, [handleDoneMessage])

    if (!isOrgVerified) {
        return (
            <Row gutter={AUTH_BUTTON_GUTTER}>
                <Col span={FULL_COL_SPAN}>
                    <Space size={AUTH_TITLE_SPACE} direction='vertical'>
                        <Typography.Title level={3}>{AuthRequiredTitle}</Typography.Title>
                        <Space size={PARAGRAPH_SPACE} direction='vertical'>
                            <Typography.Paragraph type='secondary'>
                                {AuthRequiredCertMessage}
                            </Typography.Paragraph>
                            <Typography.Paragraph type='secondary'>
                                {AuthRequiredContactMessage}
                            </Typography.Paragraph>
                        </Space>
                    </Space>
                </Col>
                <Col span={FULL_COL_SPAN}>
                    <LoginWithSBBOLButton redirect={router.asPath}/>
                </Col>
            </Row>
        )
    }

    if (acquiringError || acquiringCtxError || billingCtxError) {
        return <Typography.Title>{acquiringError || acquiringCtxError || billingCtxError}</Typography.Title>
    }

    // NOTE: !setupUrl = case when useEffect for creating ctx is being triggered, but not finished yet
    if (acquiringLoading || acquiringCtxLoading || billingCtxLoading || !setupUrl) {
        return <Loader fill size='large'/>
    }

    return (
        <IFrame
            src={setupUrl}
            reloadScope='organization'
            withPrefetch
            withLoader
            withResize
        />
    )
}