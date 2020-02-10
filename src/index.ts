import { PhidgetReactConfig, Store  } from './types'
import { createStore } from './store'
import  { useEffect, useState, EffectCallback, DependencyList } from 'react'
import { EnvironmentObject } from './environment'

type EffectHook = { (effect: EffectCallback, deps?: DependencyList): void }

export const createPhidgetReactHook = (
    config: PhidgetReactConfig, logger?: any
):[EffectHook, EffectHook] => {
    EnvironmentObject.logger = logger

    const createDefaultSystemStatus = () => {
        const { name, phidgetHost } = config

        return ({ 
            [name]: { phidgetHost }
        })
    }

    const defaultSystemStatus = createDefaultSystemStatus()

    //set up stores
    const system$: Store = createStore()
    const phidget$: Store = createStore()
    
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

   return [usePhidget, usePhidgetSystem ] 
}