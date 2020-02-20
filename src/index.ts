import {
    Logger,
    LogLevel,
    TopologyMap,
    Strategy,
    Dispatchable,
} from './types'
import { createStore } from './store'
import { EnvironmentObject } from './environment'
import { createLogger } from './logger'
import { createIntergration } from './intergration'

export const createPhidgetReact = async (
    topology: TopologyMap,
    strategy: Strategy,
    logLevel?: LogLevel,
    logger?: Logger,
) => {
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
        await createIntergration(strategy(
            host$.dispatch,
            device$.dispatch,
            device$.subscribe,
        ), topology)
    } catch {
        throw Error('Failied to create intergration. Did you pass the result of a function call instead of a function?')
    }


    return {
        systemSubscribe: host$.subscribe,
        deviceSubscribe: device$.subscribe,
        // wrap dispatch with source value
        deviceDispatch: (dispatchable: Dispatchable) => { device$.dispatch({ ...dispatchable, '@@source': 'app' }) },
    }
}
