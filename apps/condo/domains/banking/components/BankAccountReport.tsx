import { BankAccountReport as BankAccountReportType } from '@app/condo/schema'
import styled from '@emotion/styled'
import { Row, Col } from 'antd'
import dayjs from 'dayjs'
import ReactECharts from 'echarts-for-react'
import find from 'lodash/find'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react'

import { useIntl } from '@open-condo/next/intl'
import { Tabs, Card, Typography, Select, Option, Space } from '@open-condo/ui'
import type { TypographyTextProps } from '@open-condo/ui'
import type { CardProps } from '@open-condo/ui'

import { BankAccountReport as BankAccountReportClient } from '@condo/domains/banking/utils/clientSchema'
import { BasicEmptyListView } from '@condo/domains/common/components/EmptyListView'
import { TotalBalanceIcon, BalanceOutIcon, BalanceInIcon } from '@condo/domains/common/components/icons/TotalBalance'
import { useLayoutContext } from '@condo/domains/common/components/LayoutContext'
import { Loader } from '@condo/domains/common/components/Loader'

import type { BankAccount as BankAccountType } from '@app/condo/schema'
import type { RowProps } from 'antd'
import type { EChartsOption, EChartsReactProps } from 'echarts-for-react'

const BANK_ACCOUNT_REPORT_ROW_GUTTER: RowProps['gutter'] = [40, 40]
const LABEL_TRUNCATE_LENGTH = 17
const CHART_COLOR_SET = ['#E45241', '#9036AA', '#4154AE', '#4595EC', '#51B7D1', '#419488', '#96C15B', '#D1DB58', '#FBE960', '#F5C244', '#F29B38']
const CHART_OPTIONS: EChartsReactProps['opts'] = { renderer: 'svg', height: 'auto' }
const BASE_CHART_OPTS: EChartsOption = {
    grid: {
        left: 0,
        right: 0,
        bottom: 0,
        containLabel: true,
        borderWidth: 0,
    },
    tooltip: {
        trigger: 'item',
    },
    color: CHART_COLOR_SET,
}
const BASE_CHART_SERIES_CONFIG = {
    type: 'pie',
    radius: ['80%', '88%'],
    avoidLabelOverlap: true,
    top: 'center',
    left: 'center',
    width: '100%',
    height: '100%',
    labelLine: { show: false },
}

function truncate (str: string, n: number): string {
    return str.length > n ? str.slice(0, n - 1) + '...' : str
}

const LegendContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  
  & > .condo-typography {
    word-break: keep-all;
  }
`
const LegendLabelItem = styled.div<{ color: string }>`
  &:before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 8px;
    margin-right: 16px;
    background-color: ${({ color }) => color};
  }
  
  cursor: pointer;
  word-break: break-word;
`

type InfoCardProps = {
    value: string
    label: string
    icon: React.ReactElement
    isSmall: boolean
    onClick?: CardProps['onClick']
    currencyCode?: string
    valueType?: TypographyTextProps['type']
}
interface IInfoCard { (props: InfoCardProps): React.ReactElement }
const InfoCard: IInfoCard = ({ value, currencyCode = 'RUB',  ...props }) => {
    const intl = useIntl()
    const CurrencyValue = intl.formatNumber(parseFloat(value), { style: 'currency', currency: currencyCode })

    const { isSmall, label, icon, valueType } = props

    return (
        <Card hoverable onClick={props.onClick}>
            <Space
                direction={isSmall ? 'vertical' : 'horizontal'}
                size={isSmall ? 20 : 40}
                align='center'
                width='100%'
            >
                {icon}
                <Space direction='vertical' size={8} align={isSmall ? 'center' : 'start' }>
                    <Typography.Paragraph>{label}</Typography.Paragraph>
                    <Typography.Title level={2} type={valueType}>{CurrencyValue}</Typography.Title>
                </Space>
            </Space>
        </Card>
    )
}

interface IBankReportContent {
    ({ bankAccountReports, currencyCode }: { bankAccountReports: Array<BankAccountReportType>, currencyCode?: string }
    ): React.ReactElement
}

enum ReportCategories {
    'Total',
    'Income',
    'Withdrawal',
}

const BankAccountReportContent: IBankReportContent = ({ bankAccountReports = [], currencyCode = 'RUB' }) => {
    const intl = useIntl()
    const PropertyBalanceLabel = intl.formatMessage({ id: 'pages.condo.property.id.propertyReportBalance.title' })
    const IncomeTitle = intl.formatMessage({ id: 'global.income' }, { isSingular: false })
    const WithdrawalTitle = intl.formatMessage({ id: 'global.withdrawal' }, { isSingular: false })
    const ChooseReportTitle = intl.formatMessage({ id: 'pages.condo.property.id.propertyReport.chooseReportTitle' })
    const ReportCardTitle = intl.formatMessage({ id: 'pages.condo.property.id.propertyReport.reportCardTitle' })
    const NoDataTitle = intl.formatMessage({ id: 'NoData' })

    const { isSmall, isMobile } = useLayoutContext()

    const [activeTab, setActiveTab] = useState(get(bankAccountReports, '0.data.categoryGroups.0.id'))
    const [selectedPeriod, setSelectedPeriod] = useState(0)
    const [activeCategory, setActiveCategory] = useState<ReportCategories>(ReportCategories.Total)
    const chartInstance = useRef(null)

    const bankAccountReport = get(bankAccountReports, selectedPeriod)
    const categoryGroups = get(bankAccountReport, 'data.categoryGroups', [])

    let chartData = get(find(categoryGroups, { id: activeTab }), 'costItemGroups', [])
    if (activeCategory !== ReportCategories.Total) {
        chartData = chartData.filter(costItemGroup => {
            if (activeCategory === ReportCategories.Withdrawal) {
                return costItemGroup.isOutcome === true
            }

            if (activeCategory === ReportCategories.Income) {
                return costItemGroup.isOutcome === false
            }
        })
    }

    const echartsOption: EChartsOption = useMemo(() => ({
        ...BASE_CHART_OPTS,
        legend: { show: false },
        series: [
            {
                ...BASE_CHART_SERIES_CONFIG,
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 24,
                        formatter: (e) => {
                            const amountValue = intl
                                .formatNumber(e.value, { style: 'currency', currency: currencyCode }) + '\n'
                            return amountValue + truncate(e.name, LABEL_TRUNCATE_LENGTH)
                        },
                    },
                },
                label: {
                    position: 'center',
                    fontSize: 24,
                    formatter: () => {
                        const totalSum = chartData
                            .map(e => e.sum)
                            .reduce((prev, cur) => prev + cur, 0)
                        const value = intl.formatNumber(totalSum, { style: 'currency', currency: currencyCode }) + '\n'

                        return value + truncate(intl.formatMessage({ id: 'pages.condo.property.id.propertyReport.totalSumTitle' }, {
                            sumItem: WithdrawalTitle.toLowerCase(),
                        }), LABEL_TRUNCATE_LENGTH)
                    },
                },
                data: chartData.map(categoryInfo => ({
                    value: categoryInfo.sum,
                    name: intl.formatMessage({ id: categoryInfo.name }),
                })),
            },
        ],
    }), [chartData, WithdrawalTitle, currencyCode, intl])

    const onChangeTabs = useCallback((key) => {
        setActiveTab(key)
    }, [])
    const onReportPeriodSelectChange = useCallback((periodIndex) => {
        setSelectedPeriod(periodIndex)
    }, [])
    const onMouseOver = useCallback((itemName) => () => {
        chartInstance.current.setOption({ series: [{ label: { show: false } }] })
        chartInstance.current._api.dispatchAction({
            type: 'highlight',
            name: itemName,
        })
    }, [])
    const onMouseLeave = useCallback((itemName) => () => {
        chartInstance.current.setOption({ series: [{ label: { show: true } }] })
        chartInstance.current._api.dispatchAction({
            type: 'downplay',
            name: itemName,
        })
    }, [])
    const onChartEvents = useMemo(() => ({
        mouseover: () => {
            chartInstance.current.setOption({ series: [{ label: { show: false } }] })
        },
        mouseout: () => {
            chartInstance.current.setOption({ series: [{ label: { show: true } }] })
        },
    }), [])

    const tabsItems = useMemo(() => categoryGroups
        .filter(categoryGroup => {
            if (activeCategory === ReportCategories.Total) {
                return true
            } else if (activeCategory === ReportCategories.Income) {
                return categoryGroup.costItemGroups.some(item => item.isOutcome === false)
            } else if (activeCategory === ReportCategories.Withdrawal) {
                return categoryGroup.costItemGroups.some(item => item.isOutcome === true)
            }
        })
        .map(reportData => ({ label: intl.formatMessage({ id: reportData.name }), key: reportData.id }))
    , [categoryGroups, activeCategory, intl])
    const reportOptionItems = useMemo(() => bankAccountReports
        .map((bankAccountReport, reportIndex) => (
            <Option
                key={bankAccountReport.id}
                value={reportIndex}
            >
                {dayjs(bankAccountReport.period).format('MMMM YYYY')}
            </Option>
        )), [bankAccountReports])
    const chartLegendItems = useMemo(() => {
        return chartData.map((item, index) => {
            const itemName = intl.formatMessage({ id: item.name })
            return (
                <LegendContainer
                    key={'legend-item-' + index}
                    onMouseOver={onMouseOver(itemName)}
                    onMouseLeave={onMouseLeave(itemName)}
                >
                    <LegendLabelItem
                        color={index < CHART_COLOR_SET.length ? CHART_COLOR_SET[index] : CHART_COLOR_SET[index - CHART_COLOR_SET.length]}
                    >
                        <Typography.Text>
                            {itemName}
                        </Typography.Text>
                    </LegendLabelItem>
                    <Typography.Text>
                        {intl.formatNumber(item.sum, { style: 'currency', currency: currencyCode })}
                    </Typography.Text>
                </LegendContainer>
            )
        })
    }, [chartData, intl, currencyCode, onMouseLeave, onMouseOver])
    const emptyPlaceholder = useMemo(() => (
        <BasicEmptyListView image='/dino/searching@2x.png'>
            <Typography.Title level={5}>{NoDataTitle}</Typography.Title>
        </BasicEmptyListView>
    ), [NoDataTitle])

    useEffect(() => {
        const defaultSelectedTab = get(bankAccountReports, [selectedPeriod, 'data', 'categoryGroups', '0', 'id'])

        if (defaultSelectedTab) {
            setActiveTab(defaultSelectedTab)
        }
    }, [bankAccountReports, selectedPeriod])

    useEffect(() => {
        if (isEmpty(chartData) && !isEmpty(categoryGroups)) {
            setActiveTab(get(categoryGroups, '0.id'))
        }
    }, [chartData, categoryGroups])

    if (!bankAccountReport) return emptyPlaceholder

    return (
        <Row gutter={BANK_ACCOUNT_REPORT_ROW_GUTTER}>
            <Col span={24}>
                <Select placeholder={ChooseReportTitle} value={selectedPeriod} onChange={onReportPeriodSelectChange}>
                    {reportOptionItems}
                </Select>
            </Col>
            <Col span={24}>
                <Row gutter={BANK_ACCOUNT_REPORT_ROW_GUTTER}>
                    <Col xl={8} md={24} sm={24} xs={24}>
                        <InfoCard
                            value={(bankAccountReport.amount)}
                            label={PropertyBalanceLabel}
                            icon={<TotalBalanceIcon />}
                            isSmall={isSmall}
                            currencyCode={currencyCode}
                            onClick={() => setActiveCategory(ReportCategories.Total)}
                        />
                    </Col>
                    <Col xl={8} md={12} sm={24} xs={12}>
                        <InfoCard
                            value={bankAccountReport.totalOutcome}
                            label={WithdrawalTitle}
                            icon={<BalanceOutIcon />}
                            valueType='danger'
                            isSmall={isSmall}
                            currencyCode={currencyCode}
                            onClick={() => setActiveCategory(ReportCategories.Withdrawal)}
                        />
                    </Col>
                    <Col xl={8} md={12} sm={24} xs={12}>
                        <InfoCard
                            value={bankAccountReport.totalIncome}
                            label={IncomeTitle}
                            icon={<BalanceInIcon />}
                            valueType='success'
                            isSmall={isSmall}
                            currencyCode={currencyCode}
                            onClick={() => setActiveCategory(ReportCategories.Income)}
                        />
                    </Col>
                </Row>
            </Col>
            <Col span={24}>
                <Card title={<Typography.Title level={3}>{ReportCardTitle}</Typography.Title>}>
                    <Tabs items={tabsItems} onChange={onChangeTabs} activeKey={activeTab} />
                    <Row
                        gutter={BANK_ACCOUNT_REPORT_ROW_GUTTER}
                        style={{ flexDirection: isSmall || isMobile ? 'column-reverse' : 'row' }}
                    >
                        {isEmpty(chartData)
                            ? (
                                emptyPlaceholder
                            ) : (
                                <>
                                    <Col span={isSmall || isMobile ? 24 : 12}>
                                        {chartLegendItems}
                                    </Col>
                                    <Col span={isSmall || isMobile ? 24 : 12}>
                                        <ReactECharts
                                            onChartReady={(instance) => chartInstance.current = instance}
                                            opts={CHART_OPTIONS}
                                            onEvents={onChartEvents}
                                            option={echartsOption}
                                        />
                                    </Col>
                                </>
                            )}
                    </Row>
                </Card>
            </Col>
        </Row>
    )
}

interface IBankAccountReport {
    ({ bankAccount, organizationId }: { bankAccount: BankAccountType, organizationId: string }): React.ReactElement
}

const BankAccountReport: IBankAccountReport = ({ bankAccount, organizationId }) => {
    const { objs: bankAccountReports, loading } = BankAccountReportClient.useObjects({
        where: {
            account: { id: bankAccount.id },
            organization: { id: organizationId },
        },
    })

    if (loading) {
        return <Loader />
    }

    const sortedBankAccountReports = [...bankAccountReports]
        .sort((a, b) => dayjs(a.period).isBefore(b.period) ? 1 : -1)

    return (
        <Row>
            <Col span={24}>
                <BankAccountReportContent
                    bankAccountReports={sortedBankAccountReports}
                    currencyCode={bankAccount.currencyCode}
                />
            </Col>
        </Row>
    )
}

export {
    BankAccountReport,
}
