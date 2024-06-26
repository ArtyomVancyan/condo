import { CardBody } from './body/cardBody'
import { CardButton } from './button/cardButton'
import { Card as CardComponent } from './card'
import './style.less'
import { CardCheckbox } from './checkbox/cardCheckbox'
import { CardHeader } from './header/cardHeader'


type CardType = typeof CardComponent & {
    CardCheckbox: typeof CardCheckbox
    CardButton: typeof CardButton
    CardHeader: typeof CardHeader
    CardBody: typeof CardBody
}

const Card = CardComponent as CardType
Card.CardCheckbox = CardCheckbox
Card.CardButton = CardButton
Card.CardHeader = CardHeader
Card.CardBody = CardBody

export type { CardProps } from './card'
export type { CardCheckboxProps } from './checkbox/cardCheckbox'
export type { CardButtonProps } from './button/cardButton'
export type { CardHeaderProps } from './header/cardHeader'
export type { CardBodyProps } from './body/cardBody'
export {
    Card,
}