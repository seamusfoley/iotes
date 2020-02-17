import { DeviceConfig } from '../types'

interface Strategy {
    createHost: any
    createDeviceFactory: any
}


export const createIntergration = async ({
    config,
    deviceMap = [],
    strategy,
} : {
    config: any,
    deviceMap: DeviceConfig[],
    strategy: Strategy
}) => {
    const { createHost, createDeviceFactory } = strategy
    const { dispatch, systemDispatch } = config


    const client = await createHost(config, dispatch, systemDispatch)
    // eslint-disable-next-line max-len
    const deviceFactory: any = await createDeviceFactory(client)

    deviceMap.forEach((device: DeviceConfig) => deviceFactory[device.type](device))
}
