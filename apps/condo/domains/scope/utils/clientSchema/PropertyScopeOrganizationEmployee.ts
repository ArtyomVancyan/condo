/**
 * Generated by `createschema scope.PropertyScopeOrganizationEmployee 'propertyScope:Relationship:PropertyScope:CASCADE; employee:Relationship:OrganizationEmployee:CASCADE;'`
 */

import {
    PropertyScopeOrganizationEmployee,
    PropertyScopeOrganizationEmployeeCreateInput,
    PropertyScopeOrganizationEmployeeUpdateInput,
    QueryAllPropertyScopeOrganizationEmployeesArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/codegen/generate.hooks'
import { PropertyScopeOrganizationEmployee as PropertyScopeOrganizationEmployeeGQL } from '@condo/domains/scope/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useAllObjects,
} = generateReactHooks<PropertyScopeOrganizationEmployee, PropertyScopeOrganizationEmployeeCreateInput, PropertyScopeOrganizationEmployeeUpdateInput, QueryAllPropertyScopeOrganizationEmployeesArgs>(PropertyScopeOrganizationEmployeeGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useAllObjects,
}
