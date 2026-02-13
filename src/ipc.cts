import { type ChildProcess } from 'node:child_process'

const cmd = 'NODE_DEV'

export const on = (src: ChildProcess, prop: string, cb: (m: any) => void) => {
    src.on('internalMessage', m => {
        if (m.cmd === cmd && prop in m) cb(m)
    })
}

export const relay = (src: ChildProcess) => {
    src.on('internalMessage', m => {
        if (process.connected && m.cmd === cmd) process.send?.(m)
    })
}

export const send = (m: Record<any, any>) => {
    if (process.connected) process.send?.({ ...m, cmd })
}
