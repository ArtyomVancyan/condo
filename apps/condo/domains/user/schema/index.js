/**
 * This file is autogenerated by `createschema user.User name:Text; password?:Password; isAdmin?:Checkbox; email?:Text; isEmailVerified?:Checkbox; phone?:Text; isPhoneVerified?:Checkbox; avatar?:File; meta:Json; importId:Text;`
 * In most cases you should not change it by hands. And please don't remove `AUTOGENERATE MARKER`s
 */

const { User } = require('./User')
const { RegisterNewUserService } = require('./RegisterNewUserService')
const { AuthenticateUserWithPhoneAndPasswordService } = require('./AuthenticateUserWithPhoneAndPasswordService')
const { ForgotPasswordAction  } = require('./ForgotPasswordAction')
const { ForgotPasswordService } = require('./ForgotPasswordService')
const { ConfirmPhoneAction, ConfirmPhoneActionService } = require('./ConfirmPhoneAction')
const { SigninOrRegisterResidentService } = require('./SigninOrRegisterResidentService')
/* AUTOGENERATE MARKER <REQUIRE> */

module.exports = {
    User,
    RegisterNewUserService,
    AuthenticateUserWithPhoneAndPasswordService,
    ForgotPasswordAction,
    ForgotPasswordService,
    ConfirmPhoneAction,
    ConfirmPhoneActionService,
    SigninOrRegisterResidentService,
/* AUTOGENERATE MARKER <EXPORTS> */
}
