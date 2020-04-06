import { createStore } from './store'
import { EnvironmentObject } from './environment'
import { createLogger } from './logger'
import { createIntegration } from './integration'
import { identityPlugin } from './plugins/identity'
import { createHostDispatchable, createDeviceDispatchable } from './utils'

import {
    Dispatchable,
    Iotes,
    CreateIotes,
} from './types'

const createIotes: CreateIotes = ({
    topology,
    strategy,
    plugin = identityPlugin,
    logLevel,
    logger,
}): Iotes => {
    // Set up logger
    EnvironmentObject.logger = createLogger(logger, logLevel)
    const env = EnvironmentObject

    // Set up stores
    EnvironmentObject.stores = {
        ...EnvironmentObject.stores,
        host$: createStore(),
        device$: createStore(),
    }

    env.logger.info('Set up store')

    const { host$, device$ } = EnvironmentObject.stores

    try {
        createIntegration(strategy(
            host$.dispatch,
            device$.dispatch,
            host$.subscribe,
            device$.subscribe,
        ), topology)
    } catch (error) {
        if (error && error.length > 0) { throw Error(error) }
        throw Error('Failed to create Integration for unknown reasons. Did you pass the result of a function call instead of a function?')
    }

    return plugin({
        hostSubscribe: host$.subscribe,
        deviceSubscribe: device$.subscribe,
        // wrap dispatch with source value
        hostDispatch: (dispatchable: any) => {
            env.logger.info(`Host dispatch recieved ${dispatchable}`)
            const hostDispatchable = Object.keys(dispatchable).map((key) => ({ [key]: { ...dispatchable[key], '@@source': 'APP', '@@bus': 'DEVICE' } }))[0]
            host$.dispatch(hostDispatchable)
        },
        deviceDispatch: (dispatchable: any) => {
            env.logger.info(`Device dispatch recieved ${JSON.stringify(dispatchable, null, 2)}`)
            const deviceDispatchable = Object.keys(dispatchable).map((key) => ({ [key]: { ...dispatchable[key], '@@source': 'APP', '@@bus': 'HOST' } }))[0]
            device$.dispatch(deviceDispatchable)
        },
    })
}

export {
    createIotes,
}
