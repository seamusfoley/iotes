import { Store, Dispatchable, State } from '../types'

export const createStore = (
    errorHandler?: (error: Error, currentState?: State) => State
): Store =>  {
    type ShouldUpdateState = boolean
    
    let state: State = {}
    let subscribers: (( state: State ) => unknown)[] = []

    const subscribe = (subscriber: (state: State) => void) => {
        subscribers = [subscriber, ...subscribers]
    }

    const updateSubscribers = () => {
        subscribers.forEach((subscriber) => subscriber(state) )
    }

    const unwrapDispatchable = <D>(dispatchable: Dispatchable): [State, ShouldUpdateState] => {
        if ( dispatchable instanceof Error ) return [errorHandler(dispatchable, state), true] || [state, false] 
    }

    const setState = (newState: State, callback: () => void) => {
        state = {...state, ...newState}
    }

    const dispatch = (dispatchable: Dispatchable) => {
        const [newState, shouldUpdateState ] = unwrapDispatchable(dispatchable)

        if (shouldUpdateState) setState(newState, updateSubscribers)
    }

    return {
        dispatch,
        subscribe
    }
}
