import { createStore } from './store'
import { EnvironmentObject } from './environment'
import { createLogger } from './logger'
import { createIntegration } from './Integration'
import { identityPlugin } from './plugins/identity'

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

    // Set up stores
    EnvironmentObject.stores = {
        ...EnvironmentObject.stores,
        host$: createStore(),
        device$: createStore(),
    }

    EnvironmentObject.logger.info('Set up store')

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
        hostDispatch: (dispatchable: Dispatchable) => { host$.dispatch({ ...dispatchable, '@@source': 'APP', '@@bus': 'SYSTEM' }) },
        deviceDispatch: (dispatchable: Dispatchable) => { device$.dispatch({ ...dispatchable, '@@source': 'APP', '@@bus': 'DEVICE' }) },
    })
}

export {
    createIotes,
}
