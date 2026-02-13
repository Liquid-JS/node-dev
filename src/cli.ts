import assert from 'node:assert'
import { resolve } from 'node:path'
import minimist, { ParsedArgs } from 'minimist'
import { getConfig } from './cfg.cjs'

const arrayify = <T>(v: T | T[]) => (Array.isArray(v) ? [...v] : [v])
const argify = (key: string) => ({ arg: `--${key}`, key })

const resolvePath = (p: string) => resolve(process.cwd(), p)

const nodeAlias = { require: 'r' }
const nodeBoolean = ['expose_gc', 'preserve-symlinks']
const nodeCustom = ['inspect', 'inspect-brk', 'no-warnings']
const nodeString = ['require']

const nodeDevBoolean = ['clear', 'dedupe', 'fork', 'notify', 'poll', 'respawn', 'vm']
const nodeDevNumber = ['debounce', 'deps', 'interval', 'kill_timeout']
const nodeDevString = ['graceful_ipc', 'ignore', 'timestamp']

const alias = { ...nodeAlias }
const boolean = [...nodeBoolean, ...nodeDevBoolean]
const string = [...nodeString, ...nodeDevString]

const nodeArgsReducer =
    (opts: ParsedArgs) =>
        (out: string[], { arg, key }: { arg: string, key: string }) => {
            const value = opts[key]

            if (typeof value === 'boolean') {
                value && out.push(arg)
            } else if (typeof value !== 'undefined') {
                arrayify(value).forEach(v => {
                    if (arg.includes('=')) {
                        out.push(`${arg.split('=')[0]}=${v}`)
                    } else {
                        out.push(`${arg}=${v}`)
                    }
                })
            }

            delete opts[key]

            return out
        }

const nodeCustomFactory = (args: any[]) => (arg: string) => {
    const isNodeCustom = nodeCustom.includes(arg.substring(2))
    if (isNodeCustom) args.push(arg)
    return !isNodeCustom
}

const unknownFactory = (args: Array<{ arg: string, key: string }>) => (arg: string) => {
    const [, key] = Object.keys(minimist([arg]))
    key && !nodeDevNumber.includes(key) && args.push({ arg, key })
    return true
}

export interface Options {
    clear: boolean
    dedupe: boolean
    fork: boolean
    notify: boolean
    poll: boolean
    respawn: boolean
    vm: boolean
    debounce: number
    deps: number
    extensions: Record<string, string>
    graceful_ipc: string
    ignore: string[]
    interval: number
    timestamp: string
    kill_timeout?: number
}

export const cli = (argv: string[]) => {
    const nodeCustomArgs = new Array<string>()
    const args = argv.slice(2).filter(nodeCustomFactory(nodeCustomArgs))

    const unknownArgs = new Array<{ arg: string, key: string }>()
    const unknown = unknownFactory(unknownArgs)

    const {
        _: [script, ...scriptArgs]
    } = minimist(args, { alias, boolean, string, unknown })

    assert(script, 'Could not parse command line arguments')

    const opts = minimist(args, { alias, boolean, default: getConfig(script) })
    const nodeArgs = [...nodeBoolean.map(argify), ...nodeString.map(argify), ...unknownArgs]
        .sort((a, b) => parseFloat(a.key) - parseFloat(b.key))
        .reduce(nodeArgsReducer(opts), [...nodeCustomArgs])

    opts.ignore = arrayify(opts.ignore).map(resolvePath)

    return { nodeArgs, opts: opts as any as Options, script, scriptArgs }
}
