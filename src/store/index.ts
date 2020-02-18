import { Store, Dispatchable, State } from '../types'
import { EnvironmentObject } from '../environment'

interface WrappedStore extends Store {
    isWrapped: boolean
}

export const createStore = (
    errorHandler?: (error: Error, currentState?: State) => State,
): WrappedStore => {
    type ShouldUpdateState = boolean

    let state: State = {}
    let subscribers: ((state: State) => unknown)[] = []

    const subscribe = (subscriber: (state: State) => void) => {
        subscribers = [subscriber, ...subscribers]
    }

    const updateSubscribers = () => {
        subscribers.forEach((subscriber) => subscriber(state))
    }

    const unwrapDispatchable = (dispatchable: Dispatchable): [State, ShouldUpdateState] => {
        if (dispatchable instanceof Error) return [errorHandler(dispatchable, state), false]
        return [dispatchable, true]
    }

    const setState = (newState: State, callback: () => void) => {
        state = { ...state, ...newState }
        callback()
    }

    const dispatch = (dispatchable: Dispatchable) => {
        const [newState, shouldUpdateState] = unwrapDispatchable(dispatchable)
        if (shouldUpdateState) setState(newState, updateSubscribers)
    }

    return {
        dispatch,
        subscribe,
        isWrapped: true,
    }
}

const nullStore = {
    dispatch: (_: Dispatchable) => {},
    subscribe: (_: (state: State) => void) => {},
}

export const unwrapStore = (store: WrappedStore | undefined): Store => {
    if (!store) {
        EnvironmentObject.logger.warn('Attempted to access undefined store, returning non functional null store in it\'s place')
        return nullStore
    }

    return store
}
