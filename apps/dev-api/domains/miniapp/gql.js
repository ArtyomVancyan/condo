/**
 * Generated by `createschema miniapp.B2CApp 'name:Text'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const { gql } = require('graphql-tag')

const { generateGqlQueries } = require('@open-condo/codegen/generate.gql')

const { AVAILABLE_ENVIRONMENTS } = require('@dev-api/domains/miniapp/constants/publishing')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'
const EXPORT_FIELDS = AVAILABLE_ENVIRONMENTS.map(environment => `${environment}ExportId`).join(' ')

const B2C_APP_FIELDS = `{ name developer logo { publicUrl originalFilename } ${COMMON_FIELDS} ${EXPORT_FIELDS} }`
const B2CApp = generateGqlQueries('B2CApp', B2C_APP_FIELDS)

const B2C_APP_BUILD_FIELDS = `{ app { id } version data { publicUrl originalFilename mimetype encoding } ${COMMON_FIELDS} ${EXPORT_FIELDS} }`
const B2CAppBuild = generateGqlQueries('B2CAppBuild', B2C_APP_BUILD_FIELDS)

const B2C_APP_PUBLISH_REQUEST_FIELDS = `{ app { id } status isAppTested isContractSigned isInfoApproved ${COMMON_FIELDS} }`
const B2CAppPublishRequest = generateGqlQueries('B2CAppPublishRequest', B2C_APP_PUBLISH_REQUEST_FIELDS)

const PUBLISH_B2C_APP_MUTATION = gql`
    mutation publishB2CApp ($data: PublishB2CAppInput!) {
        result: publishB2CApp(data: $data) { success }
    }
`

const IMPORT_B2C_APP_MUTATION = gql`
    mutation importB2CApp ($data: ImportB2CAppInput!) {
        result: importB2CApp(data: $data) { success }
    }
`
 
const ALL_B2C_APP_PROPERTIES_QUERY = gql`
    query allB2CAppProperties ($data: AllB2CAppPropertiesInput!) {
        result: allB2CAppProperties(data: $data) {
            objs { id address }
            meta { count }
        }
    }
`

const CREATE_B2C_APP_PROPERTY_MUTATION = gql`
    mutation createB2CAppProperty ($data: CreateB2CAppPropertyInput!) {
        result: createB2CAppProperty(data: $data) { id address }
    }
`

const DELETE_B2C_APP_PROPERTY_MUTATION = gql`
    mutation deleteB2CAppProperty ($data: DeleteB2CAppPropertyInput!) {
        result: deleteB2CAppProperty(data: $data) { id deletedAt address }
    }
`

const GET_OIDC_CLIENT_QUERY = gql`
    query getGetOIDCClient ($data: GetOIDCClientInput!) {
        result: OIDCClient(data: $data) { id clientId redirectUri }
    }
`

const CREATE_OIDC_CLIENT_MUTATION = gql`
    mutation createOIDCClient ($data: CreateOIDCClientInput!) {
        result: createOIDCClient(data: $data) { id clientId clientSecret redirectUri }
    }
`

const GENERATE_OIDC_CLIENT_SECRET_MUTATION = gql`
    mutation generateOIDCClientSecret ($data: GenerateOIDCClientSecretInput!) {
        result: generateOIDCClientSecret(data: $data) { id clientId clientSecret redirectUri }
    }
`

const UPDATE_OIDC_CLIENT_URL_MUTATION = gql`
    mutation updateOIDCClientUrl ($data: UpdateOIDCClientUrlInput!) {
        result: updateOIDCClientUrl(data: $data) { id clientId redirectUri }
    }
`

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    B2CApp,
    B2CAppBuild,
    B2CAppPublishRequest,
    PUBLISH_B2C_APP_MUTATION,
    IMPORT_B2C_APP_MUTATION,
    ALL_B2C_APP_PROPERTIES_QUERY,
    CREATE_B2C_APP_PROPERTY_MUTATION,
    DELETE_B2C_APP_PROPERTY_MUTATION,
    GET_OIDC_CLIENT_QUERY,
    CREATE_OIDC_CLIENT_MUTATION,
    GENERATE_OIDC_CLIENT_SECRET_MUTATION,
    UPDATE_OIDC_CLIENT_URL_MUTATION,
/* AUTOGENERATE MARKER <EXPORTS> */
}
