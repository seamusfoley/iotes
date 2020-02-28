import { Store, Dispatchable, State } from '../types'
import { EnvironmentObject } from '../environment'

type Subscription = (state: State) => any
type Selector = string[]
type Subscriber = [Subscription, Selector | undefined]

export const createStore = (
    errorHandler?: (error: Error, currentState?: State) => State,
): Store => {
    const { logger } = EnvironmentObject
    type ShouldUpdateState = boolean

    let state: State = {}
    let subscribers: Subscriber[] = []

    const subscribe = (subscription: Subscription, selector?: Selector) => {
        const subscriber: Subscriber = [subscription, selector]
        subscribers = [subscriber, ...subscribers]
    }

    const applySelectors = (selectors: string[]) => (
        selectors.reduce((
            a: { [key: string]: any },
            selector: string,
        ) => (
            state[selector]
                ? { ...a, ...state[selector] }
                : a
        ),
        {})
    )

    const updateSubscribers = () => {
        subscribers.forEach((subscriber: Subscriber) => {
            const [subscription, selectors] = subscriber
            const stateSelection = selectors ? applySelectors(selectors) : state
            logger.log(`Subscriber receive state: ${JSON.stringify(state, null, 2)}`)
            if (Object.keys(stateSelection).length !== 0) subscription(stateSelection)
        })
    }

    const isObjectLiteral = (testCase:{[key: string]: any}) => {
        if (Object.getPrototypeOf(testCase) !== Object.getPrototypeOf({})) return false

        let keys = []
        try {
            keys = Object.keys(testCase)
            if (keys.length === 0) return false
        } catch {
            return false
        }

        return keys.reduce((a: boolean, v: string | number) => (testCase[v] ? a : false), true)
    }

    const unwrapDispatchable = (dispatchable: Dispatchable): [State, ShouldUpdateState] => {
        if (dispatchable instanceof Error) return [errorHandler(dispatchable, state), false]
        if (isObjectLiteral(dispatchable)) return [dispatchable, true]
        return [{}, false]
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
    }
}
