/**
 * Generated by `createservice miniapp.PublishB2CAppService`
 */

const fs = require('fs')

const got = require('got')

const { GQLError, GQLErrorCode: { BAD_USER_INPUT, INTERNAL_ERROR } } = require('@open-condo/keystone/errors')
const { getLogger } = require('@open-condo/keystone/logging')
const { GQLCustomSchema } = require('@open-condo/keystone/schema')

const { REMOTE_SYSTEM } = require('@dev-api/domains/common/constants/common')
const { developmentClient, productionClient } = require('@dev-api/domains/common/utils/serverClients')
const {
    CondoB2CAppGql,
    CondoB2CAppBuildGql,
    CondoOIDCClientGql,
} = require('@dev-api/domains/condo/gql')
const access = require('@dev-api/domains/miniapp/access/PublishB2CAppService')
const { DEFAULT_COLOR_SCHEMA } = require('@dev-api/domains/miniapp/constants/b2c')
const {
    FIRST_PUBLISH_WITHOUT_INFO,
    APP_NOT_FOUND,
    CONDO_APP_NOT_FOUND,
    BUILD_NOT_FOUND,
    PUBLISH_NOT_ALLOWED,
} = require('@dev-api/domains/miniapp/constants/errors')
const {
    AVAILABLE_ENVIRONMENTS,
    PROD_ENVIRONMENT,
    B2C_APP_DEFAULT_LOGO_PATH,
    PUBLISH_REQUEST_APPROVED_STATUS,
} = require('@dev-api/domains/miniapp/constants/publishing')
const {
    B2CApp,
    B2CAppBuild,
    B2CAppPublishRequest,
} = require('@dev-api/domains/miniapp/utils/serverSchema/index')

const { getOIDCClientWhere } = require('./GetOIDCClientService')

const ERRORS = {
    FIRST_PUBLISH_WITHOUT_INFO: {
        code: BAD_USER_INPUT,
        type: FIRST_PUBLISH_WITHOUT_INFO,
        message: 'The first publication of the application should include information about the application',
        messageForUser: 'errors.FIRST_PUBLISH_WITHOUT_INFO.message',
    },
    APP_NOT_FOUND: {
        code: BAD_USER_INPUT,
        type: APP_NOT_FOUND,
        message: 'The application with the specified ID was not found',
        messageForUser: 'errors.APP_NOT_FOUND.message',
    },
    CONDO_APP_NOT_FOUND: {
        code: INTERNAL_ERROR,
        type: CONDO_APP_NOT_FOUND,
        message: 'The application was probably deleted on remote server. Try to publish app info to recreate it',
        messageForUser: 'errors.CONDO_APP_NOT_FOUND.message',
    },
    BUILD_NOT_FOUND: {
        code: BAD_USER_INPUT,
        type: BUILD_NOT_FOUND,
        message: 'Application build with the specified ID was not found',
        messageForUser: 'errors.BUILD_NOT_FOUND.message',
    },
    PUBLISH_NOT_ALLOWED: {
        code: BAD_USER_INPUT,
        type: PUBLISH_NOT_ALLOWED,
        message: 'The application cannot be published to the specified stand, as this requires additional verification',
        messageForUser: 'errors.PUBLISH_NOT_ALLOWED.message',
    },
}

const logger = getLogger('dev-api/publishB2CApp')

function getExportIdField (environment) {
    return `${environment}ExportId`
}

async function publishAppChanges ({ app, condoApp, serverClient, args, context }) {
    const { data: { dv, sender, environment } } = args
    logger.info({ msg: 'Started app publishing', appId: app.id, environment })
    const exportIdField = getExportIdField(environment)
    const exportId = app[exportIdField]

    // Step 1. Prepare payload
    const appPayload = {
        dv,
        sender,
        name: app.name,
        developer: app.developer || app.createdBy.name,
        colorSchema: DEFAULT_COLOR_SCHEMA,
        logo: app.logo
            ? serverClient.createUploadFile({
                stream: got.stream(app.logo.publicUrl),
                filename: app.logo.originalFilename,
            })
            : serverClient.createUploadFile({
                stream: fs.createReadStream(B2C_APP_DEFAULT_LOGO_PATH),
            }),
        importId: app.id,
        importRemoteSystem: REMOTE_SYSTEM,
    }

    // Step 2. Update / create app in condo
    let updatedCondoApp
    if (condoApp) {
        // App found -> update
        logger.info({ msg: 'Found existing condo app', appId: app.id, environment, meta: { condoAppId: condoApp.id } })
        updatedCondoApp = await serverClient.updateModel({
            modelGql: CondoB2CAppGql,
            id: condoApp.id,
            updateInput: appPayload,
        })
        logger.info({ msg: 'Condo app successfully updated', appId: app.id, condoAppId: condoApp.id, environment })
    } else {
        // App not found -> create new one
        logger.info({ msg: 'Condo app not found. Creating new one', appId: app.id, environment })
        updatedCondoApp = await serverClient.createModel({
            modelGql: CondoB2CAppGql,
            createInput: appPayload,
        })
        logger.info({ msg: 'Condo app successfully created', appId: app.id, environment, meta: { condoAppId: updatedCondoApp.id } })
    }
    // Update exportIdField if needed
    if (!exportId || exportId !== updatedCondoApp.id) {
        await B2CApp.update(context, app.id, {
            dv,
            sender,
            [exportIdField]: updatedCondoApp.id,
        })
        logger.info({ msg: 'Dev-api app exportId updated', appId: app.id, environment, meta: { condoAppId: updatedCondoApp.id } })
    }

    return updatedCondoApp
}

async function publishBuildChanges ({ build, condoBuild, app, condoApp, context, args, serverClient }) {
    const { data: { dv, sender, environment } } = args
    const exportIdField = getExportIdField(environment)
    const exportId = build[exportIdField]
    let buildToUpdate = condoBuild
    if (!buildToUpdate) {
        logger.info({
            msg: 'Condo build not found, creating new one',
            appId: app.id,
            environment,
            meta: {
                condoAppId: condoApp.id,
                version: build.version,
            },
        })
        buildToUpdate = await serverClient.createModel({
            modelGql: CondoB2CAppBuildGql,
            createInput: {
                dv,
                sender,
                app: { connect: { id: condoApp.id } },
                version: build.version,
                data: serverClient.createUploadFile({
                    stream: got.stream(build.data.publicUrl),
                    filename: build.data.originalFilename,
                    mimetype: build.data.mimetype,
                    encoding: build.data.encoding,
                }),
                importId: build.id,
                importRemoteSystem: REMOTE_SYSTEM,
            },
        })
        logger.info({ msg: 'Condo build created', environment, appId: app.id, meta: { version: build.version, condoAppId: condoApp.id } })
    }

    logger.info({ msg: 'Updating condo app current build', environment, appId: app.id, meta: { condoAppId: condoApp.id, version: build.version, condoBuildId: buildToUpdate.id } })
    await serverClient.updateModel({
        modelGql: CondoB2CAppGql,
        id: condoApp.id,
        updateInput: {
            dv,
            sender,
            currentBuild: { connect: { id: buildToUpdate.id } },
        },
    })
    logger.info({ msg: 'Current build successfully updated', environment, appId: app.id, meta: { condoAppId: condoApp.id, version: build.version, condoBuildId: buildToUpdate.id } })

    if (!exportId || exportId !== buildToUpdate.id) {
        await B2CAppBuild.update(context, build.id, {
            dv,
            sender,
            [exportIdField]: buildToUpdate.id,
        })
        logger.info({ msg: 'Dev-api build exportId updated', appId: app.id, environment, meta: { condoAppId: condoApp.id, version: build.version, condoBuildId: buildToUpdate.id } })
    }
}

async function enableOIDCClient ({ args, serverClient }) {
    const { data: { dv, sender, app, environment } } = args

    const oidcClients = await serverClient.getModels({
        modelGql: CondoOIDCClientGql,
        where: getOIDCClientWhere(app),
        first: 1,
    })

    if (!oidcClients.length) {
        logger.info({ msg: 'No OIDC clients found for app', appId: app.id, environment })
        return
    }

    const oidcClient = oidcClients[0]

    if (oidcClient.isEnabled) {
        logger.info({ msg: 'OIDC client is already enabled', appId: app.id, environment, meta: { oidcClientId: oidcClient.id } })
        return
    }

    await serverClient.updateModel({
        modelGql: CondoOIDCClientGql,
        id: oidcClient.id,
        updateInput: {
            dv,
            sender,
            isEnabled: true,
        },
    })
    logger.info({ msg: 'OIDC client is enabled now', appId: app.id, environment, meta: { oidcClientId: oidcClient.id } })
}

const PublishB2CAppService = new GQLCustomSchema('PublishB2CAppService', {
    types: [
        {
            access: true,
            type: 'input B2CAppPublishOptions { info: Boolean, build: B2CAppBuildWhereUniqueInput }',
        },
        {
            access: true,
            type: `enum AppEnvironment { ${AVAILABLE_ENVIRONMENTS.join(' ')} }`,
        },
        {
            access: true,
            type: 'input PublishB2CAppInput { dv: Int!, sender: SenderFieldInput!, app: B2CAppWhereUniqueInput!, environment: AppEnvironment!, options: B2CAppPublishOptions! }',
        },
        {
            access: true,
            type: 'type PublishB2CAppOutput { success: Boolean! }',
        },
    ],
    
    mutations: [
        {
            access: access.canPublishB2CApp,
            schema: 'publishB2CApp(data: PublishB2CAppInput!): PublishB2CAppOutput',
            resolver: async (parent, args, context) => {
                const { data: { app: { id }, options, environment } } = args

                const app = await B2CApp.getOne(context, { id, deletedAt: null })
                if (!app) {
                    throw new GQLError(ERRORS.APP_NOT_FOUND, context)
                }

                const exportIdField = getExportIdField(environment)
                let exportId = app[exportIdField]

                if (!exportId && !options.info) {
                    throw new GQLError(ERRORS.FIRST_PUBLISH_WITHOUT_INFO, context)
                }

                if (environment === PROD_ENVIRONMENT) {
                    const publishRequest = await B2CAppPublishRequest.getOne(context, {
                        app: { id: app.id },
                        deletedAt: null,
                        status: PUBLISH_REQUEST_APPROVED_STATUS,
                    })
                    if (!publishRequest) {
                        throw new GQLError(ERRORS.PUBLISH_NOT_ALLOWED, context)
                    }
                }

                const serverClient = environment === PROD_ENVIRONMENT
                    ? productionClient
                    : developmentClient

                let condoApp = await serverClient.findExportedModel({
                    modelGql: CondoB2CAppGql,
                    exportId,
                    id: app.id,
                    context,
                })

                // Step 1. Create / update app if needed
                if (options.info) {
                    condoApp = await publishAppChanges({
                        app,
                        condoApp,
                        serverClient,
                        args,
                        context,
                    })
                }

                if (!condoApp) {
                    throw new GQLError(ERRORS.CONDO_APP_NOT_FOUND, context)
                }

                // Step 2. Create build if needed and update app's currentBuild
                if (options.build) {
                    const build = await B2CAppBuild.getOne(context, {
                        id: options.build.id,
                        deletedAt: null,
                        app: { id: app.id },
                    })
                    if (!build) {
                        throw new GQLError(ERRORS.BUILD_NOT_FOUND, context)
                    }
                    const condoBuild = await serverClient.findExportedModel({
                        modelGql: CondoB2CAppBuildGql,
                        exportId: build[exportIdField],
                        id: build.id,
                        context,
                    })

                    await publishBuildChanges({
                        build,
                        condoBuild,
                        app,
                        condoApp,
                        context,
                        args,
                        serverClient,
                    })
                }

                // Step 4. If OIDC client was created, publish must enable it for usage
                await enableOIDCClient({ args, serverClient })

                return {
                    success: true,
                }
            },
        },
    ],
})

module.exports = {
    PublishB2CAppService,
}
