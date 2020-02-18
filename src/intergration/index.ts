import {
    DeviceConfig,
    HostConfig,
    DeviceFactory,
    HostFactory,
    TopologyMap,
} from '../types'


type Intergration = (
    hostFactory: HostFactory,
    topologyMap: TopologyMap
) => void

export const createIntergration: Intergration = async (
    hostFactory,
    topologyMap,
) => {
    const { hosts, devices } = topologyMap

    const hostFactories = await Promise.all(hosts.map(async (
        hostConfig: HostConfig,
    ) => (
        [hostConfig.name, await hostFactory(hostConfig)]
    )))

    const deviceFactories = hostFactories.reduce((
        a: { [name: string]: DeviceFactory },
        v: [string, DeviceFactory],
    ): { [name: string]: DeviceFactory } => (
        { ...a, [v[0]]: v[1] }
    ), {})

    Promise.all(devices.map((device) => (
        // Select device creation method from correct host
        deviceFactories[device.hostName][device.type](device)
    )))
}
