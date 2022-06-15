import { Alert, Col, Form, Input, Row, Typography } from 'antd'
import { flatten, get, isEmpty } from 'lodash'
import { useRouter } from 'next/router'
import { Rule } from 'rc-field-form/lib/interface'
import React, { useCallback, useMemo, useState } from 'react'
import { useIntl } from '@core/next/intl'
import Checkbox from '../../../common/components/antd/Checkbox'
import Select from '../../../common/components/antd/Select'
import { FormWithAction } from '../../../common/components/containers/FormList'
import { GraphQlSearchInput } from '../../../common/components/GraphQlSearchInput'
import { colors } from '../../../common/constants/style'
import { useValidations } from '../../../common/hooks/useValidations'
import { searchOrganizationProperty } from '../../utils/clientSchema/search'
import { Editor } from '@tinymce/tinymce-react'
import { Property } from '../../../property/utils/clientSchema'
import { TicketHint } from '../../utils/clientSchema'
import Link from 'next/link'

const INPUT_LAYOUT_PROPS = {
    labelCol: {
        sm: 6,
    },
    wrapperCol: {
        sm: 14,
    },
}

const LAYOUT = {
    layout: 'horizontal',
}

const TicketHintAlert = () => {
    const intl = useIntl()
    const AlertMessage = intl.formatMessage({ id: 'pages.condo.settings.hint.alert.title' })
    const AlertContent = intl.formatMessage({ id: 'pages.condo.settings.hint.alert.content' })
    const ShowHintsMessage = intl.formatMessage({ id: 'pages.condo.settings.hint.alert.showHints' })

    const AlertDescription = useMemo(() => (
        <>
            <Typography.Paragraph style={{ margin: 0 }}>{AlertContent}</Typography.Paragraph>
            <a href={'/settings?tab=hint'} target={'_blank'} rel="noreferrer">
                <Typography.Link style={{ color: colors.black, textDecoration: 'underline' }}>
                    {ShowHintsMessage}
                </Typography.Link>
            </a>
        </>
    ), [AlertContent, ShowHintsMessage])

    return (
        <Alert
            message={AlertMessage}
            description={AlertDescription}
            showIcon
            type={'warning'}
        />
    )
}

export const BaseTicketHintForm = ({ children, action, organization, initialValues }) => {
    const intl = useIntl()
    const ApartmentComplexNameMessage  = intl.formatMessage({ id: 'ApartmentComplexName' })
    const HintMessage = intl.formatMessage({ id: 'Hint' })
    const BuildingsMessage = intl.formatMessage({ id: 'pages.condo.property.index.TableField.Buildings' })

    const organizationId = get(organization, 'id')

    const { requiredValidator } = useValidations()
    const validations: { [key: string]: Rule[] } = {
        properties: [requiredValidator],
        content: [requiredValidator],
    }
    const { objs: properties } = Property.useObjects({
        where: {
            organization: { id: organizationId },
        },
    })
    const { objs: ticketHints } = TicketHint.useObjects({
        where: {
            organization: { id: organizationId },
        },
    })

    const [editorValue, setEditorValue] = useState('')

    const handleEditorChange = useCallback((newValue, form) => {
        setEditorValue(newValue)
        form.setFieldsValue({ content: newValue })
    }, [])

    const propertiesWithTicketHint = useMemo(() => flatten(ticketHints.map(hint => hint.properties.map(property => property.id))),
        [ticketHints])
    const propertiesWithoutTicketHint = useMemo(() =>  properties.filter(property => !propertiesWithTicketHint.includes(property.id)),
        [properties, propertiesWithTicketHint])
    const options = useMemo(() =>
        propertiesWithoutTicketHint
            .map(property => ({ label: property.address, value: property.id })),
    [propertiesWithoutTicketHint])
    const optionValues = useMemo(() => options.map(option => option.value),
        [options])

    const handleCheckboxChange = useCallback((e, form) => {
        const checkboxValue = e.target.checked

        if (checkboxValue) {
            form.setFieldsValue({ properties: optionValues })
        } else {
            form.setFieldsValue({ properties: [] })
        }
    }, [optionValues])

    return (
        <Row gutter={[0, 40]}>
            {
                !isEmpty(propertiesWithTicketHint) && (
                    <Col span={24}>
                        <TicketHintAlert />
                    </Col>
                )
            }
            <Col span={24}>
                <FormWithAction
                    action={action}
                    {...LAYOUT}
                >
                    {({ handleSave, isLoading, form }) => (
                        <Row gutter={[0, 40]}>
                            <Col span={24}>
                                <Row gutter={[0, 25]}>
                                    <Col span={24}>
                                        <Form.Item
                                            name={'properties'}
                                            label={BuildingsMessage}
                                            labelAlign={'left'}
                                            validateFirst
                                            rules={validations.properties}
                                            required
                                            {...INPUT_LAYOUT_PROPS}
                                        >
                                            <Select
                                                // value={selectValue}
                                                // onChange={handleSelectValueChange}
                                                options={options}
                                                mode={'multiple'}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col offset={6} span={24}>
                                        <Checkbox onChange={e => handleCheckboxChange(e, form)}>Добавить все дома ({options.length} шт.)</Checkbox>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name={'name'}
                                    label={ApartmentComplexNameMessage}
                                    labelAlign={'left'}
                                    labelCol={{
                                        sm: 6,
                                    }}
                                    wrapperCol= {{
                                        sm: 8,
                                    }}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Row>
                                    <Col span={6}>
                                        <Form.Item
                                            name={'content'}
                                            label={HintMessage}
                                            labelAlign={'left'}
                                            rules={validations.content}
                                            required
                                            wrapperCol={{ span: 0 }}
                                        />
                                    </Col>
                                    <Col span={14}>
                                        <Editor
                                            value={editorValue}
                                            onEditorChange={(newValue) => handleEditorChange(newValue, form)}
                                            apiKey={'c9hkjseuh8rfim0yiqr6q2zrzb8k12vyoc1dclkml7e9ozg5'}
                                            init={{
                                                link_title: false,
                                                contextmenu: false,
                                                menubar: false,
                                                statusbar: false,
                                                plugins: 'link',
                                                toolbar: 'undo redo | ' +
                                                    'link | bold italic backcolor | alignleft aligncenter ' +
                                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                                    'removeformat',
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                            {children({ handleSave, isLoading, form })}
                        </Row>
                    )}
                </FormWithAction>
            </Col>
        </Row>
    )
}