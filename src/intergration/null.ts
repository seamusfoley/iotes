import { IntergrationDefinition, DeviceDefinition } from '../types'
import { EnvironmentObject } from '../environment'

export const createNullIntergrationDefinition = async (): Promise<IntergrationDefinition> => {
    const { logger } = EnvironmentObject

    return {
        RFID_READER: (x: DeviceDefinition) => logger.warn(`RFID_READER warn ${x}`),
        ROTARY_ENCODER: (x: DeviceDefinition) => logger.warn(`ROTARY_ENCODER warn ${x}`),
    }
}
