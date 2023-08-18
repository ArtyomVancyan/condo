/**
 * Generated by `createschema settings.MobileFeatureConfig 'organization:Relationship:Organization:CASCADE; emergencyPhone:Text; commonPhone:Text; onlyGreaterThanPreviousMeterReadingIsEnabled:Checkbox; meta:Json; ticketSubmittingIsEnabled:Checkbox'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateServerUtils, execGqlWithoutAccess } = require('@open-condo/codegen/generate.server.utils')

const { MobileFeatureConfig: MobileFeatureConfigGQL } = require('@condo/domains/settings/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const MobileFeatureConfig = generateServerUtils(MobileFeatureConfigGQL)
/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    MobileFeatureConfig,
/* AUTOGENERATE MARKER <EXPORTS> */
}