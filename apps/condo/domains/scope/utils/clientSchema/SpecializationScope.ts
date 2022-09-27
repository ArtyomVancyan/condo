/**
 * Generated by `createschema scope.SpecializationScope 'employee:Relationship:OrganizationEmployee:CASCADE; specialization:Relationship:TicketCategoryClassifier:CASCADE;'`
 */

import {
    SpecializationScope,
    SpecializationScopeCreateInput,
    SpecializationScopeUpdateInput,
    QueryAllSpecializationScopesArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'
import { SpecializationScope as SpecializationScopeGQL } from '@condo/domains/scope/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<SpecializationScope, SpecializationScopeCreateInput, SpecializationScopeUpdateInput, QueryAllSpecializationScopesArgs>(SpecializationScopeGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
