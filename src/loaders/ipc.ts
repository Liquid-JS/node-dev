import { MessagePort } from 'node:worker_threads'

const cmd = 'NODE_DEV'

export const send = (m: Record<any, any>) => {
    if (process.connected) process.send?.({ ...m, cmd })
}

export const sendPort = (port: MessagePort, m: Record<any, any>) => {
    if (port) port.postMessage({ ...m, cmd })
}
