const dayjs = require('dayjs')

const NOT_USED_WORDS_IN_ACCOUNT_NUMBER_REGEXP = /(л\/с|лс|№)/gi
const FIO_REGEXP = /^[А-ЯЁ][а-яё]*([-' .][А-ЯЁ][а-яё]*){0,2}\s+[IVА-ЯЁ][a-zа-яё.]*([- .'ёЁ][IVА-ЯЁ][a-zа-яё.]*)*$/
const FIO_ENDINGS = 'оглы|кызы'
const FIAS_REGEXP = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}.*$/i
const okopfRegex = /(?:^|[^\p{L}\d_])(ИП|ООО|ОАО|АО|ПАО|НКО|КО|ПК|ПКК|СППК|КПК|ЖСК|КСК|ЖНК|ЖК|ТСН|ТСЖ|ТСК|СА|РХ|КХ|ОВС|ЗАО|ТОО)(?=[^\p{L}\d_]|$)/gui

const clearAccountNumber = (accountNumber = '') => String(accountNumber).replace(NOT_USED_WORDS_IN_ACCOUNT_NUMBER_REGEXP, '').trim()

const replaceSameEnglishLetters = (input) => {
    const replacements = {
        'a': 'а', 'b': 'б', 'c': 'с', 'e': 'е', 'h': 'н', 'k': 'к', 'm': 'м',
        'o': 'о', 'p': 'р', 't': 'т', 'x': 'х', 'y': 'у',
    }
    return input.replace(/[a-zA-Z]/g, (match) => {
        const replacement = replacements[match.toLowerCase()]
        if (replacement) {
            if (match === match.toUpperCase()) {
                return replacement.toUpperCase()
            }
            return replacement
        }
        return match
    })
}

const isPerson = (fullName) => {
    if (okopfRegex.test(fullName)) return false

    let [input] = fullName.split(new RegExp(`\\s(${FIO_ENDINGS})$`))
    input = replaceSameEnglishLetters(input).replace(/([А-ЯЁ])([А-ЯЁ]+)/gu,
        (match, firstChar, restOfString) => firstChar + restOfString.toLowerCase()
    )
    return FIO_REGEXP.test(input)
}

const isValidFias = (fias = '') => FIAS_REGEXP.test(fias)

/**
 * Normalize FIAS code to extract the house part.
 *
 * @param {string} rawFiasCode - FIAS code containing information about the unit separated with a comma.
 * @returns {string|null} Returns the house part of the FIAS code if valid, otherwise returns null.
 */
const normalizePropertyGlobalId = (rawFiasCode) => {
    const [fias] = rawFiasCode.split(',')
    if (isValidFias(fias)) {
        return fias
    }
    return null
}

const sortPeriodFunction = (periodA, periodB) => (dayjs(periodA, 'YYYY-MM-DD').isAfter(dayjs(periodB, 'YYYY-MM-DD')) ? 1 : -1)

module.exports = {
    clearAccountNumber,
    isPerson,
    isValidFias,
    sortPeriodFunction,
    normalizePropertyGlobalId,
}