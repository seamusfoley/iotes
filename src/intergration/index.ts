/* eslint-disable no-unused-vars */
import { IntergrationDefinition, DeviceDefinition } from '../types'
import { createNullIntergrationDefinition } from './null'
/* eslint-enable no-unused-vars */

export const createIntergration = async ({
    deviceMap = [],
    intergrationDefinition,
    dispatch,
    systemDispatch,
} : {
    deviceMap: any[],
    intergrationDefinition: IntergrationDefinition,
    dispatch: any,
    systemDispatch: any
}) => {
    const nullIntergrationDefinition = await createNullIntergrationDefinition()

    deviceMap.forEach((device: DeviceDefinition) => (
        intergrationDefinition[device.type]
            ? intergrationDefinition[device.type](device)
            : nullIntergrationDefinition[device.type](device)
    ))

    return {
        connect: () => systemDispatch(() => console.log('connected')),
        disconnect: () => systemDispatch('disconnected'),
    }
}
