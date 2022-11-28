/**
 * Generated by `createschema miniapp.B2BAppPromoBlock 'title:Text; subtitle:Text; backgroundColor:Text; backgroundImage:File'`
 */

import {
    B2BAppPromoBlock,
    B2BAppPromoBlockCreateInput,
    B2BAppPromoBlockUpdateInput,
    QueryAllB2BAppPromoBlocksArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@open-condo/codegen/generate.hooks'
import { B2BAppPromoBlock as B2BAppPromoBlockGQL } from '@condo/domains/miniapp/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<B2BAppPromoBlock, B2BAppPromoBlockCreateInput, B2BAppPromoBlockUpdateInput, QueryAllB2BAppPromoBlocksArgs>(B2BAppPromoBlockGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
