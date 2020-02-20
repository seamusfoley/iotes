import {
    Logger,
    LogLevel,
    TopologyMap,
    Strategy,
} from './types'
import { createStore, unwrapStore } from './store'
import { EnvironmentObject } from './environment'
import { createLogger } from './logger'
import { createIntergration } from './intergration'
import { createPhidgetStrategy } from './strategies/phidget'

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
        await createIntergration(strategy(host$.dispatch, device$.dispatch), topology)
    } catch {
        throw Error('Failied to create intergration. Did you pass function call instead of function?')
    }

    return {
        systemSubscribe: host$.subscribe,
        deviceSubscribe: device$.subscribe,
    }
}
