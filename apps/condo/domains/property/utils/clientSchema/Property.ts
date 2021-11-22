/**
 * Generated by `createschema property.Property 'organization:Text; name:Text; address:Text; addressMeta:Json; type:Select:building,village; map?:Json'`
 */

import { pick, get } from 'lodash'
import dayjs from 'dayjs'
import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { Property as PropertyGQL } from '@condo/domains/property/gql'
import { Property, PropertyUpdateInput, QueryAllPropertiesArgs } from '@condo/domains/property/schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'organization', 'name', 'address', 'addressMeta', 'type', 'map', 'ticketsInWork', 'ticketsClosed', 'unitsCount', 'yearOfConstruction', 'area']
const RELATIONS = ['organization']
import { BuildingMap, AddressMetaField } from '@app/condo/schema'

export interface IPropertyUIState extends Property {
    id: string
    address: string
    addressMeta: AddressMetaField
    name?: string
    ticketsInWork: string
    ticketsClosed: string
    unitsCount: string
    map?: BuildingMap
    area?: number
    yearOfConstruction?: string
}

function convertToUIState (item: Property): IPropertyUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    const result = pick(item, FIELDS) as IPropertyUIState
    return result
}

export interface IPropertyFormState {
    id?: undefined
    type?: string
    organization?: string
    name?: string
    address?: string
    map?: BuildingMap
    area?: number
    yearOfConstruction?: string
    // address: string,
    // TODO(codegen): write IPropertyUIFormState or extends it from
}

function convertToUIFormState (state: IPropertyUIState): IPropertyFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
        if (attr === 'yearOfConstruction' && state[attr].length) {
            result[attr] = dayjs(state[attr]).format('YYYY')
        }
    }
    return result as IPropertyFormState
}

function convertToGQLInput (state: IPropertyFormState): PropertyUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? { connect: { id: (attrId || state[attr]) } } : state[attr]
    }
    return result
}

function extractAttributes (state: IPropertyUIState, attributes: Array<string>): IPropertyUIState | undefined {
    const result = {}
    attributes.forEach((attribute) => {
        if (RELATIONS.includes(attribute)) {
            result[attribute] = get(state, [attribute, 'name'])
        } else {
            result[attribute] = get(state, attribute)
        }
    })
    return result as IPropertyUIState
}

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    useSoftDelete,
} = generateReactHooks<Property, PropertyUpdateInput, IPropertyFormState, IPropertyUIState, QueryAllPropertiesArgs>(PropertyGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    useSoftDelete,
    convertToUIFormState,
    extractAttributes,
}
