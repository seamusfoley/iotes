import {
    Logger,
    LogLevel,
    TopologyMap,
    Strategy,
    Dispatchable,
    Iotes,
} from './types'
import { createStore } from './store'
import { EnvironmentObject } from './environment'
import { createLogger } from './logger'
import { createIntergration } from './intergration'
import { identityPlugin } from './plugins/idenity'


const createIotes = (
    topology: TopologyMap,
    strategy: Strategy,
    plugin: (iotes: Iotes) => any = identityPlugin,
    logLevel?: LogLevel,
    logger?: Logger,
): Iotes => {
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
        createIntergration(strategy(
            host$.dispatch,
            device$.dispatch,
            host$.subscribe,
            device$.subscribe,
        ), topology)
    } catch (error) {
        if (error && error.length > 0) { throw Error(error) }
        throw Error('Failed to create intergration for unknown reasons. Did you pass the result of a function call instead of a function?')
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
    Logger,
    LogLevel,
    TopologyMap,
    Strategy,
    Dispatchable,
    Iotes,
}
