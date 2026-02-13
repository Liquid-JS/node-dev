import childProcess from 'child_process'
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'
import { MessageChannel } from 'node:worker_threads'
import { dirname, extname } from 'path'
import resolve from 'resolve'
import semver from 'semver'
import { isMainThread } from 'worker_threads'
import { getConfig } from './cfg.cjs'
import { hook } from './hook.cjs'
import { relay, send } from './ipc.cjs'
import { resolveMain } from './resolve-main.cjs'
import { suppressExperimentalWarnings } from './suppress-experimental-warnings.cjs'

// Experimental warnings need to be suppressed in worker threads as well, since
// their process inherits the Node arguments from the main thread.
suppressExperimentalWarnings(process)

// When using worker threads, each thread appears to require this file through
// the shared Node arguments (--require), so filter them out here and only run
// on the main thread.
if (isMainThread) {

    const script = process.argv[1]
    const { extensions, fork, vm } = getConfig(script)

    if (process.env.NODE_DEV_PRELOAD) {
        require(process.env.NODE_DEV_PRELOAD)
    }

    // We want to exit on SIGTERM, but defer to existing SIGTERM handlers.
    process.once('SIGTERM', () => process.listenerCount('SIGTERM') || process.exit(0))

    if (fork) {
        // Overwrite child_process.fork() so that we can hook into forked processes
        // too. We also need to relay messages about required files to the parent.
        const originalFork = childProcess.fork
        // @ts-ignore
        childProcess.fork = (modulePath, args, options) => {
            const child = originalFork(modulePath, args, options)
            relay(child)
            return child
        }
    }

    // Error handler that displays a notification and logs the stack to stderr:
    process.on('uncaughtException', err => {
        // Sometimes uncaught exceptions are not errors
        const { message, name, stack } =
            err instanceof Error ? err : new Error(`uncaughtException ${err}`)

        console.error(stack)

        // If there's a custom uncaughtException handler expect it to terminate
        // the process.
        const willTerminate = process.listenerCount('uncaughtException') > 1

        send({ error: name, message, willTerminate })
    })

    // Hook into require() and notify the parent process about required files
    hook(vm, required => send({ required }))

    // Check if a module is registered for this extension
    const main = resolveMain(script)
    const ext = extname(main).slice(1)
    const mod = extensions[ext]
    const basedir = dirname(main)

    // Support extensions where 'require' returns a function that accepts options
    if (typeof mod === 'object' && mod.name) {
        const fn = require(resolve.sync(mod.name, { basedir }))
        if (typeof fn === 'function' && mod.options) {
            // require returned a function, call it with options
            fn(mod.options)
        }
    } else if (typeof mod === 'string') {
        require(resolve.sync(mod, { basedir }))
    }

    if (semver.satisfies(process.version, '>=21.0.0')) {
        // This example showcases how a message channel can be used to
        // communicate with the hooks, by sending `port2` to the hooks.
        const { port1, port2 } = new MessageChannel()

        port1
            .on('message', m => {
                if (process.connected) process.send?.(m)
            })
            .unref()

        register('./loaders/load.js', {
            parentURL: pathToFileURL(__filename),
            data: { port: port2 },
            transferList: [port2]
        })
    }
}
