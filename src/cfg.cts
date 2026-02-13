import { existsSync, readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { type Options } from './cli.js'
import { resolveMain } from './resolve-main.cjs'

const defaultConfig: Options = {
    clear: false,
    debounce: 10,
    dedupe: false,
    deps: 1,
    extensions: {
        coffee: 'coffeescript/register',
        ls: 'LiveScript',
        ts: 'ts-node/register'
    },
    fork: true,
    graceful_ipc: '',
    ignore: [],
    interval: 1000,
    notify: true,
    poll: false,
    respawn: false,
    timestamp: 'HH:MM:ss',
    vm: true
}

function read(dir: string) {
    const f = resolve(dir, '.node-dev.json')
    return existsSync(f) ? JSON.parse(readFileSync(f, 'utf-8')) : {}
}

function getConfig(script: string) {
    const main = resolveMain(script)
    const dir = main ? dirname(main) : '.'

    return Object.assign(
        defaultConfig,
        read((process.env.HOME || process.env.USERPROFILE)!),
        read(process.cwd()),
        read(dir)
    )
}

export {
    defaultConfig,
    getConfig
}
