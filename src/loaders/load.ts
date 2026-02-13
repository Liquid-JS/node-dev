import { createRequire, GlobalPreloadHook, LoadFnOutput, LoadHookContext } from 'node:module'
import { fileURLToPath } from 'node:url'
import { MessagePort } from 'node:worker_threads'
import semver from 'semver'
import { sendPort } from './ipc.js'

const require = createRequire(import.meta.url)

// Port used for communication between the loader and ESM modules
// https://nodejs.org/api/esm.html#globalpreload
let port: MessagePort

export async function load(
    url: string,
    context: LoadHookContext,
    defaultLoad: (
        url: string,
        context?: Partial<LoadHookContext>
    ) => LoadFnOutput | Promise<LoadFnOutput>
) {
    const required = url.startsWith('file://') ? fileURLToPath(url) : url

    sendPort(port, { required })

    try {
        return await defaultLoad(url, context)
    } catch (error: any) {
        if (error.code !== 'ERR_UNKNOWN_FILE_EXTENSION') throw error
        const gpt: typeof import('get-package-type') = require('get-package-type')
        return gpt(required).then(format => {
            if (!['builtin', 'commonjs'].includes(format)) throw error
            return { format }
        })
    }
}

export const globalPreload: GlobalPreloadHook = (context) => {
    // Store port
    port = context.port

    // Inject code to forward loader events to the parent
    return `
port.on('message', (m) => {
  if (process.connected) process.send(m);
}).unref();
  `
}

export const initialize = (semver.satisfies(process.version, '>=21.0.0')) ? (context: { port: MessagePort }) => {
    // Store port
    port = context.port
} : undefined
