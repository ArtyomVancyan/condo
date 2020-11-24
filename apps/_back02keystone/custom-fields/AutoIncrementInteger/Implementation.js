const { Integer } = require('@keystonejs/fields')
const { KnexFieldAdapter } = require('@keystonejs/adapter-knex')
// const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose')

class AutoIncrementInteger extends Integer.implementation {
    async validateInput ({ resolvedData, addFieldValidationError }) {
        const value = resolvedData[this.path]
        if (value) {
            const list = this.getListByKey(this.listKey)
            const listAdapter = list.adapter
            const count = await listAdapter.itemsQuery({ [this.path]: value }, { meta: true })
            if (count) {
                addFieldValidationError(`[${this.path}.is.not.unique] Field ${this.path} should be unique`)
            }
        }
    }
}

class AutoIncrementIntegerKnexFieldAdapter extends KnexFieldAdapter {
    setupHooks ({ addPreSaveHook, addPostReadHook }) {
        addPreSaveHook(item => {
            if (this.path in item) {
                return item
            }

            const tableName = this.listAdapter.tableName
            const fieldName = this.dbPath
            const knex = this.listAdapter.parentAdapter.knex
            item[this.path] = knex.raw(
                `coalesce( (select max(:fieldName:) as max from :tableName:), 0) + 1`, { tableName, fieldName })
                .wrap('(', ')')
            return item
        })
    }
}

// TODO(pahaz): add mongo support for AutoIncrementInteger

module.exports = {
    AutoIncrementInteger,
    AutoIncrementIntegerKnexFieldAdapter,
}
