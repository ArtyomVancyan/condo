const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const boxen = require('boxen')
const chalk = require('chalk')
const { program } = require('commander')
const { printSchema } = require('graphql')

const { taskQueue } = require('@open-condo/keystone/tasks')
const { prepareKeystoneExpressApp } = require('@open-condo/keystone/test.utils')

const writeFile = promisify(fs.writeFile)

program.option('--no-codegen', 'Exclude codegen.yml file from being created. ' +
    'Needed for apps, which does not use typescript. (Pure keystone apps)')
program.description('Generates GraphQL schema file for application and codegen config, needed for generation of ts schema')

const CODEGEN_CONFIG = `
# this file is generated by bin/create-graphql-schema.js
# the file is required for @graphql-codegen package
schema: ./schema.graphql
generates:
  ./schema.ts:
    plugins:
      - typescript
`


async function getGraphQLSchema (keystoneModule) {
    const { keystone } = await prepareKeystoneExpressApp(keystoneModule, {
        excludeApps: process.argv.slice(2),
    })
    const internalSchema = keystone._schemas['internal']
    const result = printSchema(internalSchema)
    await keystone.disconnect()
    await taskQueue.close()
    return result
}

async function generate ({ namePath, codegen }) {
    // this is part of codegen development script and no end users input expected
    if (codegen) {
        // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
        await writeFile(path.join(namePath, 'codegen.yaml'), CODEGEN_CONFIG)
    }
    // eslint-disable-next-line import/order
    // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
    const schema = await getGraphQLSchema(require(path.join(namePath, 'index')))
    // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
    await writeFile(path.join(namePath, 'schema.graphql'), schema)
}

async function createGraphQLSchema () {
    program.parse()
    const { codegen } = program.opts()
    const name = path.basename(process.cwd())
    const namePath = path.join(__dirname, '..', 'apps', name)
    const greeting = chalk.white.bold(name)
    const boxenOptions = {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green',
        backgroundColor: '#555555',
    }
    const msgBox = boxen(greeting, boxenOptions)
    console.log(msgBox)
    await generate({ name, namePath, codegen })
}

createGraphQLSchema().then(() => {
    console.log('createGraphQLSchema completed')
    process.exit(0)
}).catch(console.error)
