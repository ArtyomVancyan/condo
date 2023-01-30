import { Radio as DefaultRadio } from 'antd'
import classNames from 'classnames'
import React, { useState, useCallback } from 'react'

import { Radio, Typography, Space } from '@open-condo/ui/src'
import type { RadioProps } from '@open-condo/ui/src'

import type { RadioGroupProps as DefaultRadioGroupProps } from 'antd'

const RADIO_GROUP_CLASS_PREFIX = 'condo-radio'

type RadioGroupOptionType = Pick<RadioProps, 'value' | 'label'> & {
    radioProps?: Partial<Pick<RadioProps, 'labelProps' | 'disabled'>>
}

type RadioGroupType = {
    name: string
    icon?: React.ReactElement
    options: Array<RadioGroupOptionType>
}

export type RadioGroupProps = {
    icon: React.ReactElement
    groups: Array<RadioGroupType>
} & Pick<DefaultRadioGroupProps, 'value' | 'onChange' | 'disabled'>

const GroupWithIcon: React.FC<RadioGroupType> = ({ name, options, icon }) => {
    const [open, setOpen] = useState(false)

    const onGroupClick = useCallback(() => {
        setOpen(!open)
    }, [open])

    const rootClassName = classNames(`${RADIO_GROUP_CLASS_PREFIX}-group-container`, {
        open,
    })

    return (
        <div key={name} className={rootClassName}>
            <div
                className={`${RADIO_GROUP_CLASS_PREFIX}-group-title`}
                onClick={onGroupClick}
            >
                <span className={`${RADIO_GROUP_CLASS_PREFIX}-group-icon`}>{icon}</span>
                <Typography.Text>{name}</Typography.Text>
            </div>
            <Space
                direction='vertical'
                size={12}
            >
                {options.map(({ value, label, radioProps }) => (
                    <Radio key={value} label={label} value={value} {...radioProps} />
                ))}
            </Space>
        </div>
    )
}

const RadioGroup: React.FC<RadioGroupProps> = (props) => {
    const { groups, icon, ...rest } = props

    return (
        <DefaultRadio.Group
            {...rest}
            prefixCls={RADIO_GROUP_CLASS_PREFIX}
        >
            {groups.map(group => (
                <GroupWithIcon name={group.name} options={group.options} key={group.name} icon={icon} />
            ))}
        </DefaultRadio.Group>
    )
}

export {
    RadioGroup,
}
