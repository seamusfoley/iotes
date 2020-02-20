import {
    HostConfig,
    DeviceFactory,
    Intergration,
    HostFactory,
    TopologyMap,
} from '../types'
import { EnvironmentObject } from '../environment'

export const createIntergration: Intergration = async (
    hostFactory: HostFactory,
    topologyMap: TopologyMap,
): Promise<void> => {
    const { logger } = EnvironmentObject

    const { hosts, devices } = topologyMap

    logger.info(`Creating info with topology map: ${JSON.stringify(topologyMap, null, 2)}`)

    const hostFactories = await Promise.all(hosts.map(async (
        hostConfig: HostConfig,
    ) => {
        const host = await hostFactory(hostConfig)
            .catch(() => { throw Error(`Failed to create Factory ${hostConfig.name})`) })
        return [hostConfig.name, host]
    })).catch(() => {
        throw Error('Failed to create one of more Factories from topology map')
    })

    logger.info(`Host Factories: ${JSON.stringify(hostFactories, null, 2)}`)

    // Combine returned device factories into indexed collection
    const deviceFactories = hostFactories.reduce((
        a: { [name: string]: DeviceFactory },
        v: [string, DeviceFactory],
    ): { [name: string]: DeviceFactory } => (
        { ...a, [v[0]]: v[1] }
    ), {})

    await Promise.all(devices.map(async (device) => (
        // Select device creation method from correct host
        deviceFactories[device.hostName][device.type](device)
            .catch(() => { throw Error(`Failed to create Device ${device.name})`) })
    ))).catch(() => {
        throw Error('Failed to create Devices one of more Devices from topology map. Check chosen strategy has a method to handle the device type you need')
    })
}
