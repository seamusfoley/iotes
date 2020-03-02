import {
    HostConfig,
    DeviceFactory,
    Integration,
    HostFactory,
    TopologyMap,
} from '../types'
import { EnvironmentObject } from '../environment'

export const createIntegration: Integration = (
    hostFactory: HostFactory,
    topologyMap: TopologyMap,
): void => {
    const { logger } = EnvironmentObject

    const { hosts, devices } = topologyMap

    logger.info(
        `Creating info with topology map: ${JSON.stringify(
            topologyMap,
            null,
            2,
        )}`,
    )

    Promise.all(
        hosts.map(async (hostConfig: HostConfig) => {
            const deviceFactory = await hostFactory(hostConfig).catch(() => {
                throw Error(`Failed to create Factory ${hostConfig.name})`)
            })
            return [hostConfig.name, deviceFactory]
        }),
    )
        .then((deviceFactories) => {
            const deviceFactoriesIndex: {[key: string]: any} = deviceFactories.reduce(
                (a, v:any) => ({ ...a, [v[0]]: v[1] }), {},
            )
            // connect device

            Promise.all(
                devices.map((device) => (
                    // Select device creation method from correct host
                    deviceFactoriesIndex[device.hostName][device.type](device).catch(() => {
                        throw Error(`Failed to create Device ${device.name})`)
                    })
                )),
            ).catch(() => {
                throw Error(
                    'Failed to create Devices one of more Devices from topology map. Check chosen strategy has a method to handle the device type you need',
                )
            })
        })
        .catch(() => {
            throw Error(
                'Failed to create one or more Host Factories from topology map',
            )
        })
}
