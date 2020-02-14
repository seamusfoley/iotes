import { Logger, Store } from '../types'
import { nullLogger } from '../logger'

interface EnvironmentObject {
    logger: Logger,
    stores?: {[key: string]: Store} | {[key: string]: undefined}
}

export const EnvironmentObject: EnvironmentObject = {
    logger: nullLogger,
    stores: {},
}
