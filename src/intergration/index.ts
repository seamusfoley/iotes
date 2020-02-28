import {
    HostConfig,
    DeviceFactory,
    Intergration,
    HostFactory,
    TopologyMap,
} from '../types'
import { EnvironmentObject } from '../environment'

export const createIntergration: Intergration = (
    hostFactory: HostFactory,
    topologyMap: TopologyMap,
): void => {
    const { logger } = EnvironmentObject

    const { hosts, devices } = topologyMap

    logger.info(
        `Creating info with topology map: ${JSON.stringify(topologyMap, null, 2)}`,
    )

    Promise.all(
        hosts.map(async (hostConfig: HostConfig) => {
            const host = await hostFactory(hostConfig).catch(() => {
                throw Error(`Failed to create Factory ${hostConfig.name})`)
            })
            return [hostConfig.name, host]
        }),
    ).then((hostFactories) => {
        logger.info(`Host Factories: ${JSON.stringify(hostFactories, null, 2)}`)
        // Combine returned device factories into indexed collection
        const deviceFactories = hostFactories.reduce(
            (
                a: {[name: string]: DeviceFactory},
                v: [string, DeviceFactory],
            ): { [name: string]: DeviceFactory } => ({
                ...a,
                [v[0]]: v[1],
            }),
            {},
        )

        logger.info(`Device Factories: ${JSON.stringify(hostFactories, null, 2)}`)

        Promise.all(
            devices.map((device) => (
                // Select device creation method from correct host
                deviceFactories[device.hostName][device.type](device).catch(() => {
                    throw Error(`Failed to create Device ${device.name})`)
                })
            )),
        ).catch(() => {
            throw Error(
                'Failed to create Devices one of more Devices from topology map. Check chosen strategy has a method to handle the device type you need',
            )
        })
    }).catch(() => {
        throw Error(
            'Failed to create one of more Factories from topology map',
        )
    })
}
