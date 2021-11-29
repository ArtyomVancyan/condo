const path = require('path')
const { find } = require('@core/keystone/schema')
const { Ticket } = require('@condo/domains/ticket/utils/serverSchema')
const { GraphQLApp } = require('@keystonejs/app-graphql')
const get = require('lodash/get')

class FixTicketClients {
    context = null
    brokenTickets = []

    async connect () {
        const resolved = path.resolve('@condo//index.js')
        const { distDir, keystone, apps } = require(resolved)
        const graphqlIndex = apps.findIndex(app => app instanceof GraphQLApp)
        await keystone.prepare({ apps: [apps[graphqlIndex]], distDir, dev: true })
        await keystone.connect()
        this.context = await keystone.createContext({ skipAccessControl: true })
    }

    async findBrokenTickets () {
        this.brokenTickets = await find('Ticket', {
            AND: [
                { client: null },
                {
                    OR: [
                        { clientName: null },
                        { clientPhone: null },
                    ],
                },
            ],
        })
    }

    async fixBrokenTickets () {
        if (!get(this.brokenTickets, 'length')) return
        const users = await find('User', {
            id_in: this.brokenTickets.map(ticket => ticket.id),
        })
        const usersByIds = Object.assign({}, ...users.map(user => ({ [user.id]: user })))
        for (const ticket of this.brokenTickets) {
            const user = get(usersByIds, ticket.client)
            await Ticket.update(this.context, ticket.id, {
                clientName: get(user, 'id'),
                clientPhone: get(user, 'phone'),
            })
        }
    }
}

const fixTickets = async () => {
    const fixer = new FixTicketClients()
    console.info('[INFO] Connecting to database...')
    await fixer.connect()
    console.info('[INFO] Finding broken tickets...')
    await fixer.findBrokenTickets()
    console.info(`[INFO] Following tickets will be fixed: [${fixer.brokenTickets.map(ticket => `"${ticket.id}"`).join(', ')}]`)
    await fixer.fixBrokenTickets()
    console.info('[INFO] Broken tickets are fixed...')
}

fixTickets().then(() => {
    console.log('\r\n')
    console.log('All done')
    process.exit(0)
}).catch((err) => {
    console.error('Failed to done', err)
})