import {
    useEffect, useState, EffectCallback, DependencyList,
} from 'react'
import {
    PhidgetReactConfig, Store, Logger, LogLevel,
} from './types'
import { createStore, unwrapStore } from './store'
import { EnvironmentObject } from './environment'
import { createLogger } from './logger'

type EffectHook = { (effect: EffectCallback, deps?: DependencyList): void }

export const createPhidgetReactHook = (
    config: PhidgetReactConfig, logLevel?: LogLevel, logger?: Logger,
) => {
    // Set up logger
    EnvironmentObject.logger = createLogger(logger, logLevel)

    // Set up stores
    EnvironmentObject.stores = {
        ...EnvironmentObject.stores,
        system$: unwrapStore(createStore()),
        phidget$: unwrapStore(createStore()),
    }

    const { system$, phidget$ } = EnvironmentObject.stores

    const createDefaultSystemStatus = () => {
        const { name, phidgetHost } = config

        return ({
            [name]: { phidgetHost },
        })
    }

    const defaultSystemStatus = createDefaultSystemStatus()

    // This hook listens to system events from the phidget
    const usePhidgetSystem = () => {
        const [system, setSystem] = useState(defaultSystemStatus)

        useEffect(() => {
            system$.subscribe((state) => setSystem(state))
        })

        return system
    }

    // This hook listens to the actual data from the phidget
    const usePhidget = () => {
        const [phidget, setPhidget] = useState({})

        useEffect(() => {
            phidget$.subscribe((state) => setPhidget(state))
        })

        return phidget
    }

    return [usePhidget, usePhidgetSystem]
}
