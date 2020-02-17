import {
    useEffect, useState, EffectCallback, DependencyList,
} from 'react'
import {
    PhidgetReactConfig, Store, Logger, LogLevel,
} from './types'
import { createStore, unwrapStore } from './store'
import { EnvironmentObject } from './environment'
import { createLogger } from './logger'
import { createIntergration } from './intergration'

export const createPhidgetReactHook = async (
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

    system$.subscribe((state) => console.log(state))
    phidget$.subscribe((state) => console.log(state))


    // await createIntergration()

    /*
    // This hook listens to system events from the phidget
    const usePhidgetSystem = () => {
        const [system, setSystem] = useState({})

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
    */

    // return [usePhidget, usePhidgetSystem]
}
