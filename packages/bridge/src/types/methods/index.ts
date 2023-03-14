// Imports for usage here
import type { GetActiveProgressBarsParams, GetActiveProgressBarsData } from './GetActiveProgressBars'
import type { GetLaunchParamsParams, GetLaunchParamsData } from './GetLaunchParams'
import type { RedirectData, RedirectParams } from './Redirect'
import type { ResizeWindowParams, ResizeWindowData } from './ResizeWindow'
import type { ShowModalWindowParams, ShowModalWindowData } from './ShowModalWindow'
import type { ShowNotificationParams, ShowNotificationData } from './ShowNotification'
import type { ShowProgressBarParams, ShowProgressBarData } from './ShowProgressBar'
import type { UpdateProgressBarParams, UpdateProgressBarData } from './UpdateProgressBar'
// Reexports for accessibility from outside
export type { GetActiveProgressBarsParams, GetActiveProgressBarData, GetActiveProgressBarsData } from './GetActiveProgressBars'
export type { GetLaunchParamsParams, GetLaunchParamsData } from './GetLaunchParams'
export type { RedirectData, RedirectParams } from './Redirect'
export type { ResizeWindowParams, ResizeWindowData } from './ResizeWindow'
export type { ShowModalWindowParams, ShowModalWindowData } from './ShowModalWindow'
export type { ShowNotificationParams, ShowNotificationData } from './ShowNotification'
export type { ShowProgressBarParams, ShowProgressBarData } from './ShowProgressBar'
export type { UpdateProgressBarParams, UpdateProgressBarData } from './UpdateProgressBar'

/**
 * Mapping for event -> request payload
 */
export type RequestMethodsParamsMap = {
    CondoWebAppGetActiveProgressBars: GetActiveProgressBarsParams

    CondoWebAppGetLaunchParams: GetLaunchParamsParams
    CondoWebAppRedirect: RedirectParams
    CondoWebAppResizeWindow: ResizeWindowParams
    CondoWebAppShowModalWindow: ShowModalWindowParams
    CondoWebAppShowNotification: ShowNotificationParams
    CondoWebAppShowProgressBar: ShowProgressBarParams
    CondoWebAppUpdateProgressBar: UpdateProgressBarParams
}

/**
 * Mapping for event -> response data (what method returns unwrapped)
 */
export type ResultResponseDataMap = {
    CondoWebAppGetActiveProgressBars: GetActiveProgressBarsData
    CondoWebAppGetLaunchParams: GetLaunchParamsData
    CondoWebAppRedirect: RedirectData
    CondoWebAppResizeWindow: ResizeWindowData
    CondoWebAppShowModalWindow: ShowModalWindowData
    CondoWebAppShowNotification: ShowNotificationData
    CondoWebAppShowProgressBar: ShowProgressBarData
    CondoWebAppUpdateProgressBar: UpdateProgressBarData
}

type ResponseEventNames<Method extends keyof RequestMethodsParamsMap> = {
    result: `${Method}Result`
    error: `${Method}Error`
}

/**
 * Mapping for event -> success / failed response names
 */
export type ResponseEventNamesMap = { [Method in keyof RequestMethodsParamsMap]: ResponseEventNames<Method> }
