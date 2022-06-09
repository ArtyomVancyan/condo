/**
 * Generated by `createschema ticket.TicketHint 'organization:Relationship:Organization:CASCADE; name?:Text; properties:Relationship:Property:SET_NULL; content:Text;'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { TicketHint as TicketHintGQL } from '@condo/domains/ticket/gql'
import { TicketHint, TicketHintUpdateInput, QueryAllTicketHintsArgs } from '../../../../schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'organization', 'name', 'properties', 'content']
const RELATIONS = ['organization', 'properties']

export interface ITicketHintUIState extends TicketHint {
    id: string
}

function convertToUIState (item: TicketHint): ITicketHintUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as ITicketHintUIState
}

export interface ITicketHintFormState {
    id?: undefined
}

function convertToUIFormState (state: ITicketHintUIState): ITicketHintFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as ITicketHintFormState
}

function convertToGQLInput (state: ITicketHintFormState): TicketHintUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? { connect: { id: (attrId || state[attr]) } } : state[attr]
    }
    return result
}

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    useSoftDelete,
} = generateReactHooks<TicketHint, TicketHintUpdateInput, ITicketHintFormState, ITicketHintUIState, QueryAllTicketHintsArgs>(TicketHintGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    useSoftDelete,
    convertToUIFormState,
}
