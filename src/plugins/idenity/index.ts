// This is the default plugin which returns the core dispatch and subscribe functions

import { Iotes } from '../../types'

export const identityPlugin = (iotes: Iotes): Iotes => iotes
